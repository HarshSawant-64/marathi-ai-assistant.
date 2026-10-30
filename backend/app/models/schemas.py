from typing import Literal

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, field_validator, model_validator

LanguageCode = Literal["mr-IN", "hi-IN", "en-IN"]
ProviderName = Literal["gemini", "grok"]
CONSENT_NOTICE_VERSION = "v1"


class ConversationMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=1500)

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Message cannot be blank")
        return cleaned


class AssistantRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    messages: list[ConversationMessage] = Field(min_length=1, max_length=12)
    language: LanguageCode
    consent_receipts: dict[ProviderName, str] = Field(default_factory=dict, max_length=2)

    @model_validator(mode="after")
    def conversation_must_end_with_user_message(self) -> "AssistantRequest":
        if self.messages[-1].role != "user":
            raise ValueError("The final conversation message must be from the user")
        return self

    @field_validator("consent_receipts")
    @classmethod
    def consent_receipts_must_be_bounded(cls, value: dict[ProviderName, str]) -> dict[ProviderName, str]:
        if any(len(receipt) < 20 or len(receipt) > 2048 for receipt in value.values()):
            raise ValueError("Consent receipt is invalid")
        return value


class ConsentGrantRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    provider: ProviderName
    notice_version: Literal["v1"]


class ConsentGrantResponse(BaseModel):
    provider: ProviderName
    notice_version: Literal["v1"]
    consent_receipt: str
    expires_in_seconds: int


class ConsentRevokeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    consent_receipt: str = Field(min_length=20, max_length=2048)


class OfficialSourceReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=120)
    scope: Literal["india", "maharashtra"]
    url: AnyHttpUrl


class AssistantResponse(BaseModel):
    reply: str
    mode: Literal["mock", "live"] = "mock"
    provider: Literal["mock", "gemini", "grok"] = "mock"
    verified: Literal[False] = False
    model: str | None = None
    request_id: str | None = None
    latency_ms: int | None = None
    sources: list[OfficialSourceReference] = Field(default_factory=list, max_length=5)
