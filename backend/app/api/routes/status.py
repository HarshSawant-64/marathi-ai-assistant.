from fastapi import APIRouter

from app.core.config import get_settings
from app.core.consent import CONSENT_RECEIPT_TTL_SECONDS
from app.models.schemas import CONSENT_NOTICE_VERSION

router = APIRouter(prefix="/status", tags=["status"])


@router.get("")
def provider_status() -> dict[str, object]:
    """Report integration state without exposing environment values."""
    settings = get_settings()
    mode = "live" if settings.gemini_available else "mock" if settings.mock_mode else "unavailable"
    return {
        "mode": mode,
        "assistant_endpoint": "available",
        "consent": {
            "receipt_version": CONSENT_NOTICE_VERSION,
            "receipt_ttl_seconds": CONSENT_RECEIPT_TTL_SECONDS,
            "session_storage": "client_memory_only",
        },
        "providers": {
            "gemini": {
                "implemented": True,
                "configured": settings.gemini_configured,
                "available": settings.gemini_available,
                "role": "primary",
            },
            "grok": {
                "implemented": True,
                "configured": settings.grok_configured,
                "available": settings.grok_available and settings.gemini_available,
                "role": "fallback",
            },
        },
    }
