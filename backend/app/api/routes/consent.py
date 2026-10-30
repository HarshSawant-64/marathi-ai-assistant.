from fastapi import APIRouter, HTTPException, Response

from app.core.config import get_settings
from app.core.consent import (
    CONSENT_RECEIPT_TTL_SECONDS,
    issue_consent_receipt,
    revoke_consent_receipt,
)
from app.models.schemas import ConsentGrantRequest, ConsentGrantResponse, ConsentRevokeRequest

router = APIRouter(prefix="/consent", tags=["consent"])


@router.post("/grant", response_model=ConsentGrantResponse)
def grant_provider_consent(
    request: ConsentGrantRequest, response: Response
) -> ConsentGrantResponse:
    """Issue a signed, short-lived receipt after the consent UI's explicit action."""
    settings = get_settings()
    available = (
        settings.gemini_available
        if request.provider == "gemini"
        else settings.grok_available and settings.gemini_available
    )
    if not available:
        raise HTTPException(status_code=503, detail={"code": "provider_not_available"})
    response.headers["Cache-Control"] = "no-store"
    return ConsentGrantResponse(
        provider=request.provider,
        notice_version=request.notice_version,
        consent_receipt=issue_consent_receipt(request.provider, settings),
        expires_in_seconds=CONSENT_RECEIPT_TTL_SECONDS,
    )


@router.post("/revoke")
def revoke_provider_consent(request: ConsentRevokeRequest) -> dict[str, bool]:
    settings = get_settings()
    return {"revoked": revoke_consent_receipt(request.consent_receipt, settings)}
