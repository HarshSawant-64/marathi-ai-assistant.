import time
from typing import Any

import httpx

from app.core.config import Settings
from app.core.redaction import redact_obvious_secrets
from app.models.schemas import ConversationMessage, LanguageCode
from app.providers.base import ProviderCallFailed, ProviderNotConfigured, ProviderResult
from app.providers.gemini import _system_instruction


def _extract_text(payload: Any) -> str | None:
    if not isinstance(payload, dict):
        return None

    direct_text = payload.get("output_text")
    if isinstance(direct_text, str) and direct_text.strip():
        return direct_text.strip()

    output = payload.get("output")
    if not isinstance(output, list):
        return None

    text_parts: list[str] = []
    for item in output:
        if not isinstance(item, dict) or item.get("type") != "message":
            continue
        if item.get("role") not in (None, "assistant"):
            continue
        content = item.get("content")
        if not isinstance(content, list):
            continue
        for block in content:
            if (
                isinstance(block, dict)
                and block.get("type") == "output_text"
                and isinstance(block.get("text"), str)
                and block["text"].strip()
            ):
                text_parts.append(block["text"].strip())
    return "\n".join(text_parts) or None


class GrokProvider:
    """Stateless Grok adapter; does not retry ambiguous failures."""

    _ENDPOINT = "https://api.x.ai/v1/responses"

    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        self._settings = settings
        self._client = client

    def _request(self, client: Any, body: dict[str, Any]) -> Any:
        return client.post(
            self._ENDPOINT,
            headers={
                "Authorization": f"Bearer {self._settings.grok_api_key}",
                "Content-Type": "application/json",
            },
            json=body,
        )

    def generate_reply(
        self,
        messages: list[ConversationMessage],
        language: LanguageCode,
    ) -> ProviderResult:
        if not self._settings.grok_configured:
            raise ProviderNotConfigured()

        clean_messages = [
            {"role": message.role, "content": redact_obvious_secrets(message.content)}
            for message in messages[-12:]
        ]
        body: dict[str, Any] = {
            "model": self._settings.grok_model,
            "input": [
                {"role": "system", "content": _system_instruction(language)},
                *clean_messages,
            ],
            "store": False,
        }
        started_at = time.monotonic()

        try:
            if self._client is None:
                with httpx.Client(timeout=self._settings.request_timeout_seconds) as client:
                    response = self._request(client, body)
            else:
                response = self._request(self._client, body)
            response.raise_for_status()
            payload = response.json()
        except httpx.TimeoutException:
            raise ProviderCallFailed(recoverable=True) from None
        except httpx.NetworkError:
            raise ProviderCallFailed(recoverable=True) from None
        except httpx.HTTPStatusError as error:
            status_code = error.response.status_code
            recoverable = status_code in {408, 429, 500, 502, 503, 504}
            raise ProviderCallFailed(status_code=status_code, recoverable=recoverable) from None
        except Exception:
            raise ProviderCallFailed() from None

        text = _extract_text(payload)
        if not text:
            raise ProviderCallFailed()

        request_id = payload.get("id") if isinstance(payload, dict) else None
        return ProviderResult(
            text=text,
            provider="grok",
            model=self._settings.grok_model,
            request_id=request_id if isinstance(request_id, str) else None,
            latency_ms=max(0, int((time.monotonic() - started_at) * 1000)),
        )
