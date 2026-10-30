import unittest

from app.core.config import Settings
from app.core.consent import (
    CONSENT_RECEIPT_TTL_SECONDS,
    issue_consent_receipt,
    revoke_consent_receipt,
    verify_consent_receipt,
)


class ConsentReceiptTests(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = Settings(False, "", "", 20, consent_signing_secret="test-consent-secret")

    def test_receipt_is_signed_and_scoped_to_provider(self) -> None:
        receipt = issue_consent_receipt("gemini", self.settings, now=1000)

        self.assertTrue(verify_consent_receipt(receipt, "gemini", self.settings, now=1001))
        self.assertFalse(verify_consent_receipt(receipt, "grok", self.settings, now=1001))

    def test_receipt_expires_after_one_hour(self) -> None:
        receipt = issue_consent_receipt("gemini", self.settings, now=1000)

        self.assertTrue(
            verify_consent_receipt(
                receipt, "gemini", self.settings, now=1000 + CONSENT_RECEIPT_TTL_SECONDS - 1
            )
        )
        self.assertFalse(
            verify_consent_receipt(
                receipt, "gemini", self.settings, now=1000 + CONSENT_RECEIPT_TTL_SECONDS
            )
        )

    def test_tampered_receipt_is_rejected(self) -> None:
        receipt = issue_consent_receipt("gemini", self.settings, now=1000)
        payload, signature = receipt.split(".", 1)
        first = "A" if payload[0] != "A" else "B"
        tampered = f"{first}{payload[1:]}.{signature}"

        self.assertFalse(verify_consent_receipt(tampered, "gemini", self.settings, now=1001))

    def test_revocation_invalidates_receipt(self) -> None:
        receipt = issue_consent_receipt("grok", self.settings, now=1000)

        self.assertTrue(revoke_consent_receipt(receipt, self.settings, now=1001))
        self.assertFalse(verify_consent_receipt(receipt, "grok", self.settings, now=1002))


if __name__ == "__main__":
    unittest.main()
