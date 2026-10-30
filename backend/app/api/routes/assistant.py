from fastapi import APIRouter
from fastapi import HTTPException

from app.core.config import get_settings
from app.models.schemas import AssistantRequest, AssistantResponse
from app.providers.base import ProviderCallFailed, ProviderConsentRequired, ProviderNotConfigured
from app.services.provider_router import ProviderRouter

router = APIRouter(prefix="/assistant", tags=["assistant"])
_provider_router = ProviderRouter(get_settings())


@router.post("/reply", response_model=AssistantResponse)
def assistant_reply(request: AssistantRequest) -> AssistantResponse:
    try:
        return _provider_router.generate_reply(request)
    except ProviderConsentRequired:
        raise HTTPException(status_code=403, detail={"code": "provider_consent_required"}) from None
    except ProviderNotConfigured:
        raise HTTPException(status_code=503, detail={"code": "provider_not_configured"}) from None
    except ProviderCallFailed:
        raise HTTPException(status_code=502, detail={"code": "provider_request_failed"}) from None
