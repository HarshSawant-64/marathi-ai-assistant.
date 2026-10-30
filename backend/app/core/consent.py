"""Short-lived, signed, provider-scoped consent receipts for the prototype."""

import base64
import binascii
import hashlib
import hmac
import json
import secrets
import threading
import time
from typing import Any

from app.core.config import Settings
from app.models.schemas import CONSENT_NOTICE_VERSION, ProviderName

CONSENT_RECEIPT_TTL_SECONDS = 60 * 60
_revoked_receipts: dict[str, int] = {}
_revocation_lock = threading.Lock()


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def issue_consent_receipt(
    provider: ProviderName,
    settings: Settings,
    now: int | None = None,
) -> str:
    issued_at = int(time.time()) if now is None else now
    claims = {
        "v": 1,
        "provider": provider,
        "notice_version": CONSENT_NOTICE_VERSION,
        "issued_at": issued_at,
        "expires_at": issued_at + CONSENT_RECEIPT_TTL_SECONDS,
        "receipt_id": secrets.token_urlsafe(16),
    }
    payload = _b64encode(json.dumps(claims, separators=(",", ":"), sort_keys=True).encode())
    signature = hmac.new(
        settings.consent_signing_secret.encode(), payload.encode("ascii"), hashlib.sha256
    ).digest()
    return f"{payload}.{_b64encode(signature)}"


def _decode_and_verify(receipt: str, settings: Settings, now: int | None = None) -> dict[str, Any] | None:
    try:
        payload, supplied_signature = receipt.split(".", 1)
        expected_signature = hmac.new(
            settings.consent_signing_secret.encode(), payload.encode("ascii"), hashlib.sha256
        ).digest()
        if not hmac.compare_digest(expected_signature, _b64decode(supplied_signature)):
            return None
        claims = json.loads(_b64decode(payload))
    except (ValueError, TypeError, UnicodeDecodeError, json.JSONDecodeError, binascii.Error):
        return None

    current_time = int(time.time()) if now is None else now
    if not isinstance(claims, dict):
        return None
    if (
        claims.get("v") != 1
        or claims.get("notice_version") != CONSENT_NOTICE_VERSION
        or claims.get("provider") not in {"gemini", "grok"}
        or not isinstance(claims.get("issued_at"), int)
        or not isinstance(claims.get("expires_at"), int)
        or not isinstance(claims.get("receipt_id"), str)
    ):
        return None
    if claims["issued_at"] > current_time + 60 or claims["expires_at"] <= current_time:
        return None

    receipt_id = claims["receipt_id"]
    with _revocation_lock:
        expired = [key for key, expiry in _revoked_receipts.items() if expiry <= current_time]
        for key in expired:
            _revoked_receipts.pop(key, None)
        if receipt_id in _revoked_receipts:
            return None
    return claims


def verify_consent_receipt(
    receipt: str | None,
    provider: ProviderName,
    settings: Settings,
    now: int | None = None,
) -> bool:
    if not receipt or len(receipt) > 2048:
        return False
    claims = _decode_and_verify(receipt, settings, now)
    return claims is not None and claims["provider"] == provider


def revoke_consent_receipt(receipt: str, settings: Settings, now: int | None = None) -> bool:
    claims = _decode_and_verify(receipt, settings, now)
    if claims is None:
        return False
    with _revocation_lock:
        _revoked_receipts[claims["receipt_id"]] = claims["expires_at"]
    return True
