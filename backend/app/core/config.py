import os
import secrets
from dataclasses import dataclass, field


_PROCESS_CONSENT_SIGNING_SECRET = secrets.token_urlsafe(32)


def _read_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _read_timeout() -> int:
    try:
        return min(max(int(os.getenv("AI_REQUEST_TIMEOUT_SECONDS", "20")), 1), 60)
    except ValueError:
        return 20


@dataclass(frozen=True)
class Settings:
    mock_mode: bool
    gemini_api_key: str
    gemini_model: str
    request_timeout_seconds: int
    grok_api_key: str = ""
    grok_model: str = ""
    consent_signing_secret: str = field(default=_PROCESS_CONSENT_SIGNING_SECRET, repr=False)

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key and self.gemini_model)

    @property
    def gemini_available(self) -> bool:
        return self.gemini_configured and not self.mock_mode

    @property
    def grok_configured(self) -> bool:
        return bool(self.grok_api_key and self.grok_model)

    @property
    def grok_available(self) -> bool:
        return self.grok_configured and not self.mock_mode


def get_settings() -> Settings:
    return Settings(
        mock_mode=_read_bool("MOCK_MODE", True),
        gemini_api_key=os.getenv("GEMINI_API_KEY", "").strip(),
        gemini_model=os.getenv("GEMINI_MODEL", "").strip(),
        request_timeout_seconds=_read_timeout(),
        grok_api_key=os.getenv("GROK_API_KEY", "").strip(),
        grok_model=os.getenv("GROK_MODEL", "").strip(),
        # Consent is session-scoped in this prototype. A fresh key on restart
        # invalidates all outstanding receipts without adding persistent state.
        consent_signing_secret=_PROCESS_CONSENT_SIGNING_SECRET,
    )
