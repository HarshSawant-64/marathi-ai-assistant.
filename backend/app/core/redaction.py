import re

_SECRET_ASSIGNMENT = re.compile(
    r"\b(?:otp|one[- ]?time password|verification code|password|passcode|pin)\b\s*[:=]?\s*[\w-]{4,20}",
    re.IGNORECASE,
)
_EMAIL = re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
_INDIAN_MOBILE = re.compile(r"(?<!\d)(?:\+?91[ -]?)?[6-9]\d{9}(?!\d)")
_CARD_NUMBER = re.compile(r"(?<!\d)(?:\d[ -]?){13,19}(?!\d)")


def redact_obvious_secrets(text: str) -> str:
    redacted = _SECRET_ASSIGNMENT.sub("[redacted]", text)
    redacted = _EMAIL.sub("[redacted email]", redacted)
    redacted = _INDIAN_MOBILE.sub("[redacted phone]", redacted)
    redacted = _CARD_NUMBER.sub("[redacted number]", redacted)
    return redacted
