import logging

from app.core.config import Settings
from app.core.consent import verify_consent_receipt
from app.core.redaction import redact_obvious_secrets
from app.models.schemas import AssistantRequest, AssistantResponse, ConversationMessage
from app.providers.base import (
    ProviderCallFailed,
    ProviderConsentRequired,
    ProviderNotConfigured,
    ProviderResult,
)
from app.providers.gemini import GeminiProvider
from app.providers.grok import GrokProvider
from app.services.mock_assistant import create_mock_reply
from app.services.official_source_finder import find_official_scholarship_sources

logger = logging.getLogger("awaazsetu.providers")


class ProviderRouter:
    def __init__(
        self,
        settings: Settings,
        gemini: GeminiProvider | None = None,
        grok: GrokProvider | None = None,
    ) -> None:
        self._settings = settings
        self._gemini = gemini or GeminiProvider(settings)
        self._grok = grok or GrokProvider(settings)

    def generate_reply(self, request: AssistantRequest) -> AssistantResponse:
        current_message = request.messages[-1].content
        source_response = find_official_scholarship_sources(current_message, request.language)
        if source_response is not None:
            return source_response

        if self._settings.mock_mode:
            return AssistantResponse(reply=create_mock_reply(current_message, request.language))

        if not self._settings.gemini_configured:
            raise ProviderNotConfigured()
        if not verify_consent_receipt(
            request.consent_receipts.get("gemini"), "gemini", self._settings
        ):
            raise ProviderConsentRequired()

        messages = [
            ConversationMessage(role=message.role, content=redact_obvious_secrets(message.content))
            for message in request.messages
        ]
        try:
            result: ProviderResult = self._gemini.generate_reply(messages, request.language)
        except ProviderCallFailed as error:
            logger.warning(
                "provider_call provider=gemini status=failure http_status=%s recoverable=%s",
                error.status_code,
                error.recoverable,
            )
            grok_consented = verify_consent_receipt(
                request.consent_receipts.get("grok"), "grok", self._settings
            )
            if not (error.recoverable and grok_consented and self._settings.grok_available):
                raise

            try:
                result = self._grok.generate_reply(messages, request.language)
            except ProviderCallFailed as fallback_error:
                logger.warning(
                    "provider_call provider=grok status=failure http_status=%s recoverable=%s",
                    fallback_error.status_code,
                    fallback_error.recoverable,
                )
                raise

            logger.info(
                "provider_call provider=grok status=success model=%s latency_ms=%s",
                result.model,
                result.latency_ms,
            )
            return AssistantResponse(
                reply=result.text,
                mode="live",
                provider="grok",
                verified=False,
                model=result.model,
                request_id=result.request_id,
                latency_ms=result.latency_ms,
            )

        logger.info(
            "provider_call provider=gemini status=success model=%s latency_ms=%s",
            result.model,
            result.latency_ms,
        )
        return AssistantResponse(
            reply=result.text,
            mode="live",
            provider="gemini",
            verified=False,
            model=result.model,
            request_id=result.request_id,
            latency_ms=result.latency_ms,
        )
