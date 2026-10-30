from dataclasses import dataclass


@dataclass(frozen=True)
class ProviderResult:
    text: str
    provider: str
    model: str
    request_id: str | None
    latency_ms: int


class ProviderError(Exception):
    """A normalized provider failure safe to handle without exposing raw details."""


class ProviderNotConfigured(ProviderError):
    pass


class ProviderConsentRequired(ProviderError):
    pass


class ProviderCallFailed(ProviderError):
    def __init__(self, status_code: int | None = None, recoverable: bool = False) -> None:
        super().__init__("Provider call failed")
        self.status_code = status_code
        self.recoverable = recoverable
