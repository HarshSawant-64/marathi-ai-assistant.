import unittest
from types import SimpleNamespace

from app.core.config import Settings
from app.core.consent import issue_consent_receipt
from app.models.schemas import AssistantRequest, ConversationMessage, LanguageCode
from app.providers.base import (
    ProviderCallFailed,
    ProviderConsentRequired,
    ProviderNotConfigured,
    ProviderResult,
)
from app.providers.gemini import GeminiProvider
from app.providers.grok import GrokProvider
from app.services.provider_router import ProviderRouter


def make_request(
    messages: list[dict[str, str]] | None = None,
    language: LanguageCode = "mr-IN",
    consent_gemini: bool = False,
    consent_grok: bool = False,
) -> AssistantRequest:
    settings = live_settings()
    receipts = {}
    if consent_gemini:
        receipts["gemini"] = issue_consent_receipt("gemini", settings)
    if consent_grok:
        receipts["grok"] = issue_consent_receipt("grok", settings)
    return AssistantRequest(
        messages=messages or [{"role": "user", "content": "नमस्कार"}],
        language=language,
        consent_receipts=receipts,
    )


def live_settings(
    *,
    api_key: str = "test-key",
    model: str = "test-model",
    mock_mode: bool = False,
    grok_api_key: str = "",
    grok_model: str = "",
) -> Settings:
    return Settings(
        mock_mode=mock_mode,
        gemini_api_key=api_key,
        gemini_model=model,
        request_timeout_seconds=20,
        grok_api_key=grok_api_key,
        grok_model=grok_model,
    )


class StubGemini:
    def __init__(self) -> None:
        self.calls: list[tuple[list[ConversationMessage], LanguageCode]] = []

    def generate_reply(
        self,
        messages: list[ConversationMessage],
        language: LanguageCode,
    ) -> ProviderResult:
        self.calls.append((messages, language))
        return ProviderResult(
            text="नमस्कार, मी मदत करू शकतो.",
            provider="gemini",
            model="test-model",
            request_id="request-123",
            latency_ms=15,
        )


class FailingGemini:
    def __init__(self, error: ProviderCallFailed) -> None:
        self.error = error
        self.calls = 0

    def generate_reply(self, messages, language) -> ProviderResult:
        self.calls += 1
        raise self.error


class StubGrok:
    def __init__(self) -> None:
        self.calls: list[tuple[list[ConversationMessage], LanguageCode]] = []

    def generate_reply(self, messages, language) -> ProviderResult:
        self.calls.append((messages, language))
        return ProviderResult("Grok reply", "grok", "grok-test", "grok-request", 22)


class FakeHttpResponse:
    status_code = 200

    def __init__(self, payload: dict[str, object]) -> None:
        self.payload = payload

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict[str, object]:
        return self.payload


class FakeGrokHttpClient:
    def __init__(self, payload: dict[str, object]) -> None:
        self.payload = payload
        self.request: dict[str, object] | None = None

    def post(self, url: str, **kwargs: object) -> FakeHttpResponse:
        self.request = {"url": url, **kwargs}
        return FakeHttpResponse(self.payload)


class ProviderRouterTests(unittest.TestCase):
    def test_scholarship_queries_return_local_official_sources_in_all_languages(self) -> None:
        cases = (
            ("मला शिष्यवृत्तीची माहिती द्या", "mr-IN", "शिष्यवृत्तीची माहिती"),
            ("मुझे छात्रवृत्ति की जानकारी दें", "hi-IN", "छात्रवृत्ति की जानकारी"),
            ("Where can I find scholarship information?", "en-IN", "scholarship information"),
        )

        for query, language, localized_reply in cases:
            with self.subTest(language=language):
                gemini = StubGemini()
                grok = StubGrok()
                router = ProviderRouter(live_settings(), gemini=gemini, grok=grok)  # type: ignore[arg-type]

                response = router.generate_reply(
                    make_request(
                        messages=[{"role": "user", "content": query}],
                        language=language,  # type: ignore[arg-type]
                        consent_gemini=False,
                    )
                )

                self.assertEqual(response.mode, "mock")
                self.assertEqual(response.provider, "mock")
                self.assertIn(localized_reply, response.reply)
                self.assertEqual(len(response.sources), 3)
                self.assertEqual(
                    [source.scope for source in response.sources],
                    ["india", "maharashtra", "maharashtra"],
                )
                allowed_hosts = {
                    "scholarships.gov.in",
                    "mahadbt2.maharashtra.gov.in",
                    "mahadbt.maharashtra.gov.in",
                }
                for source in response.sources:
                    self.assertEqual(source.url.scheme, "https")
                    self.assertIn(source.url.host, allowed_hosts)
                self.assertEqual(gemini.calls, [])
                self.assertEqual(grok.calls, [])

    def test_unrelated_query_does_not_return_scholarship_sources(self) -> None:
        router = ProviderRouter(live_settings(mock_mode=True))
        for message in ("How do I cook rice?", "I need inspiration for a school project"):
            with self.subTest(message=message):
                response = router.generate_reply(
                    make_request(messages=[{"role": "user", "content": message}], language="en-IN")
                )

                self.assertEqual(response.sources, [])
                self.assertEqual(response.provider, "mock")

    def test_mock_mode_does_not_call_gemini(self) -> None:
        provider = StubGemini()
        router = ProviderRouter(live_settings(mock_mode=True), gemini=provider)  # type: ignore[arg-type]

        response = router.generate_reply(make_request())

        self.assertEqual(response.mode, "mock")
        self.assertEqual(response.provider, "mock")
        self.assertEqual(provider.calls, [])

    def test_live_mode_requires_gemini_consent(self) -> None:
        provider = StubGemini()
        router = ProviderRouter(live_settings(), gemini=provider)  # type: ignore[arg-type]

        with self.assertRaises(ProviderConsentRequired):
            router.generate_reply(make_request(consent_gemini=False))

        self.assertEqual(provider.calls, [])

    def test_gemini_receipt_cannot_authorize_grok(self) -> None:
        gemini = FailingGemini(ProviderCallFailed(status_code=503, recoverable=True))
        grok = StubGrok()
        router = ProviderRouter(
            live_settings(grok_api_key="grok-key", grok_model="grok-test"),
            gemini=gemini,
            grok=grok,
        )  # type: ignore[arg-type]

        with self.assertRaises(ProviderCallFailed):
            router.generate_reply(make_request(consent_gemini=True, consent_grok=False))

        self.assertEqual(grok.calls, [])

    def test_live_mode_rejects_missing_provider_configuration(self) -> None:
        router = ProviderRouter(live_settings(api_key="", model=""))

        with self.assertRaises(ProviderNotConfigured):
            router.generate_reply(make_request(consent_gemini=True))

    def test_live_reply_is_normalized_and_obvious_secrets_are_redacted(self) -> None:
        provider = StubGemini()
        router = ProviderRouter(live_settings(), gemini=provider)  # type: ignore[arg-type]
        request = make_request(
            messages=[
                {"role": "user", "content": "माझा ईमेल harsh@example.com आहे; OTP: 123456"},
            ],
            consent_gemini=True,
        )

        response = router.generate_reply(request)

        self.assertEqual(response.mode, "live")
        self.assertEqual(response.provider, "gemini")
        self.assertFalse(response.verified)
        self.assertEqual(response.request_id, "request-123")
        sent_text = provider.calls[0][0][0].content
        self.assertNotIn("harsh@example.com", sent_text)
        self.assertNotIn("123456", sent_text)

    def test_gemini_adapter_uses_interactions_without_storing_history(self) -> None:
        interactions = SimpleNamespace()
        captured: dict[str, object] = {}

        def create(**kwargs: object) -> SimpleNamespace:
            captured.update(kwargs)
            return SimpleNamespace(output_text="नमस्कार.", id="interaction-1")

        interactions.create = create
        provider = GeminiProvider(live_settings(), client=SimpleNamespace(interactions=interactions))

        result = provider.generate_reply(
            [ConversationMessage(role="user", content="नमस्कार")],
            "mr-IN",
        )

        self.assertEqual(result.text, "नमस्कार.")
        self.assertEqual(result.request_id, "interaction-1")
        self.assertEqual(captured["store"], False)
        self.assertEqual(captured["model"], "test-model")
        self.assertIn("Marathi", str(captured["system_instruction"]))
        self.assertIn("नमस्कार", str(captured["input"]))

    def test_empty_gemini_output_is_normalized_as_failure(self) -> None:
        interactions = SimpleNamespace(create=lambda **_kwargs: SimpleNamespace(output_text="  ", id="x"))
        provider = GeminiProvider(live_settings(), client=SimpleNamespace(interactions=interactions))

        with self.assertRaises(ProviderCallFailed):
            provider.generate_reply([ConversationMessage(role="user", content="नमस्कार")], "mr-IN")

    def test_gemini_transport_timeout_is_marked_recoverable(self) -> None:
        class APITimeoutError(Exception):
            pass

        def timeout(**_kwargs: object) -> None:
            raise APITimeoutError("private transport detail")

        interactions = SimpleNamespace(create=timeout)
        provider = GeminiProvider(live_settings(), client=SimpleNamespace(interactions=interactions))

        with self.assertRaises(ProviderCallFailed) as raised:
            provider.generate_reply([ConversationMessage(role="user", content="Hello")], "en-IN")

        self.assertTrue(raised.exception.recoverable)
        self.assertNotIn("private transport detail", str(raised.exception))

    def test_recoverable_gemini_failure_uses_grok_only_with_separate_consent(self) -> None:
        gemini = FailingGemini(ProviderCallFailed(status_code=503, recoverable=True))
        grok = StubGrok()
        settings = live_settings(grok_api_key="grok-key", grok_model="grok-test")
        router = ProviderRouter(settings, gemini=gemini, grok=grok)  # type: ignore[arg-type]

        with self.assertRaises(ProviderCallFailed):
            router.generate_reply(make_request(consent_gemini=True, consent_grok=False))
        self.assertEqual(grok.calls, [])

        response = router.generate_reply(make_request(consent_gemini=True, consent_grok=True))
        self.assertEqual(response.provider, "grok")
        self.assertEqual(response.reply, "Grok reply")
        self.assertEqual(response.request_id, "grok-request")
        self.assertEqual(len(grok.calls), 1)

    def test_nonrecoverable_gemini_failure_never_uses_grok(self) -> None:
        gemini = FailingGemini(ProviderCallFailed(status_code=401, recoverable=False))
        grok = StubGrok()
        router = ProviderRouter(
            live_settings(grok_api_key="grok-key", grok_model="grok-test"),
            gemini=gemini,
            grok=grok,
        )  # type: ignore[arg-type]

        with self.assertRaises(ProviderCallFailed):
            router.generate_reply(make_request(consent_gemini=True, consent_grok=True))

        self.assertEqual(grok.calls, [])

    def test_unconfigured_grok_is_never_called_even_with_consent(self) -> None:
        gemini = FailingGemini(ProviderCallFailed(status_code=503, recoverable=True))
        grok = StubGrok()
        router = ProviderRouter(live_settings(), gemini=gemini, grok=grok)  # type: ignore[arg-type]

        with self.assertRaises(ProviderCallFailed):
            router.generate_reply(make_request(consent_gemini=True, consent_grok=True))

        self.assertEqual(grok.calls, [])

    def test_grok_adapter_sends_redacted_context_without_storing_response(self) -> None:
        client = FakeGrokHttpClient({
            "id": "grok-response-1",
            "output": [{
                "type": "message",
                "role": "assistant",
                "content": [{"type": "output_text", "text": "Namaskar."}],
            }],
        })
        provider = GrokProvider(
            live_settings(grok_api_key="grok-secret", grok_model="grok-test"),
            client=client,
        )

        result = provider.generate_reply(
            [ConversationMessage(role="user", content="Email harsh@example.com, OTP 123456")],
            "en-IN",
        )

        self.assertEqual(result.text, "Namaskar.")
        self.assertEqual(result.request_id, "grok-response-1")
        assert client.request is not None
        self.assertEqual(client.request["url"], "https://api.x.ai/v1/responses")
        self.assertEqual(client.request["headers"]["Authorization"], "Bearer grok-secret")  # type: ignore[index]
        body = client.request["json"]
        self.assertEqual(body["store"], False)  # type: ignore[index]
        user_input = body["input"][1]["content"]  # type: ignore[index]
        self.assertNotIn("harsh@example.com", user_input)
        self.assertNotIn("123456", user_input)

    def test_empty_grok_output_is_a_normalized_failure(self) -> None:
        client = FakeGrokHttpClient({"id": "grok-empty", "output": []})
        provider = GrokProvider(
            live_settings(grok_api_key="grok-secret", grok_model="grok-test"),
            client=client,
        )

        with self.assertRaises(ProviderCallFailed):
            provider.generate_reply([ConversationMessage(role="user", content="Hello")], "en-IN")


if __name__ == "__main__":
    unittest.main()
