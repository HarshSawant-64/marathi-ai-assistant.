import unittest

from fastapi.testclient import TestClient

from app.api.routes import assistant as assistant_routes
from app.api.routes import consent as consent_routes
from app.api.routes import status as status_routes
from app.core.config import Settings
from app.main import app
from app.providers.base import ProviderResult
from app.services.provider_router import ProviderRouter


class StubGemini:
    def __init__(self) -> None:
        self.called = False

    def generate_reply(self, messages, language):
        self.called = True
        return ProviderResult("Namaskar", "gemini", "test-model", "request-1", 1)


class AssistantApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.original_router = assistant_routes._provider_router
        self.client = TestClient(app)

    def tearDown(self) -> None:
        assistant_routes._provider_router = self.original_router
        self.client.close()

    def test_health_endpoint(self) -> None:
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_status_reports_fallback_readiness_without_exposing_credentials(self) -> None:
        original_get_settings = status_routes.get_settings
        status_routes.get_settings = lambda: Settings(
            False,
            "gemini-secret",
            "gemini-model",
            20,
            "grok-secret",
            "grok-model",
        )
        try:
            response = self.client.get("/v1/status")
        finally:
            status_routes.get_settings = original_get_settings

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["providers"]["gemini"]["available"])
        self.assertTrue(response.json()["providers"]["grok"]["available"])
        self.assertEqual(response.json()["providers"]["grok"]["role"], "fallback")
        self.assertNotIn("gemini-secret", response.text)
        self.assertNotIn("grok-secret", response.text)

    def test_mock_assistant_endpoint(self) -> None:
        assistant_routes._provider_router = ProviderRouter(
            Settings(True, "", "", 20)
        )

        response = self.client.post(
            "/v1/assistant/reply",
            json={
                "messages": [{"role": "user", "content": "नमस्कार"}],
                "language": "mr-IN",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["mode"], "mock")
        self.assertEqual(response.json()["provider"], "mock")

    def test_scholarship_endpoint_includes_curated_official_sources(self) -> None:
        provider = StubGemini()
        assistant_routes._provider_router = ProviderRouter(
            Settings(False, "test-key", "test-model", 20),
            gemini=provider,  # type: ignore[arg-type]
        )

        response = self.client.post(
            "/v1/assistant/reply",
            json={
                "messages": [{"role": "user", "content": "छात्रवृत्ति की जानकारी कहाँ मिलेगी?"}],
                "language": "hi-IN",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["mode"], "mock")
        self.assertEqual(len(response.json()["sources"]), 3)
        self.assertIn("scholarships.gov.in", response.json()["sources"][0]["url"])
        self.assertIn("छात्रवृत्ति की जानकारी", response.json()["reply"])
        self.assertFalse(provider.called)

    def test_live_endpoint_refuses_without_consent(self) -> None:
        provider = StubGemini()
        assistant_routes._provider_router = ProviderRouter(
            Settings(False, "test-key", "test-model", 20),  # type: ignore[arg-type]
            gemini=provider,  # type: ignore[arg-type]
        )

        response = self.client.post(
            "/v1/assistant/reply",
            json={
                "messages": [{"role": "user", "content": "Hello"}],
                "language": "en-IN",
                "consent_receipts": {},
            },
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["detail"]["code"], "provider_consent_required")
        self.assertFalse(provider.called)

    def test_signed_consent_receipt_authorizes_only_after_grant(self) -> None:
        provider = StubGemini()
        assistant_routes._provider_router = ProviderRouter(
            Settings(False, "test-key", "test-model", 20),
            gemini=provider,  # type: ignore[arg-type]
        )
        original_get_settings = consent_routes.get_settings
        consent_routes.get_settings = lambda: Settings(False, "test-key", "test-model", 20)

        try:
            grant = self.client.post(
                "/v1/consent/grant",
                json={"provider": "gemini", "notice_version": "v1"},
            )
            self.assertEqual(grant.status_code, 200)
            self.assertEqual(grant.headers.get("cache-control"), "no-store")
            receipt = grant.json()["consent_receipt"]

            reply = self.client.post(
                "/v1/assistant/reply",
                json={
                    "messages": [{"role": "user", "content": "Hello"}],
                    "language": "en-IN",
                    "consent_receipts": {"gemini": receipt},
                },
            )
            self.assertEqual(reply.status_code, 200)
            self.assertTrue(provider.called)

            revoked = self.client.post("/v1/consent/revoke", json={"consent_receipt": receipt})
            self.assertEqual(revoked.status_code, 200)
            self.assertTrue(revoked.json()["revoked"])

            denied = self.client.post(
                "/v1/assistant/reply",
                json={
                    "messages": [{"role": "user", "content": "Hello again"}],
                    "language": "en-IN",
                    "consent_receipts": {"gemini": receipt},
                },
            )
            self.assertEqual(denied.status_code, 403)
        finally:
            consent_routes.get_settings = original_get_settings

    def test_legacy_client_boolean_is_not_accepted_as_consent(self) -> None:
        response = self.client.post(
            "/v1/assistant/reply",
            json={
                "messages": [{"role": "user", "content": "Hello"}],
                "language": "en-IN",
                "consent_gemini": True,
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_consent_receipt_is_not_issued_in_mock_mode(self) -> None:
        original_get_settings = consent_routes.get_settings
        consent_routes.get_settings = lambda: Settings(True, "", "", 20)
        try:
            response = self.client.post(
                "/v1/consent/grant",
                json={"provider": "gemini", "notice_version": "v1"},
            )
        finally:
            consent_routes.get_settings = original_get_settings

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["detail"]["code"], "provider_not_available")

    def test_fallback_receipt_is_not_issued_without_primary_provider(self) -> None:
        original_get_settings = consent_routes.get_settings
        consent_routes.get_settings = lambda: Settings(
            False, "", "", 20, "grok-key", "grok-model"
        )
        try:
            response = self.client.post(
                "/v1/consent/grant",
                json={"provider": "grok", "notice_version": "v1"},
            )
        finally:
            consent_routes.get_settings = original_get_settings

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["detail"]["code"], "provider_not_available")

    def test_validation_error_does_not_echo_submitted_message(self) -> None:
        secret_marker = "private-user-marker-123"
        response = self.client.post(
            "/v1/assistant/reply",
            json={
                "messages": [{"role": "user", "content": secret_marker + ("x" * 1600)}],
                "language": "en-IN",
            },
        )

        self.assertEqual(response.status_code, 422)
        self.assertNotIn(secret_marker, response.text)


if __name__ == "__main__":
    unittest.main()
