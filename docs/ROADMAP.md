# Roadmap

## Phase B — clickable shell and mock mode (complete)

- Language onboarding for Marathi, Hindi, and English.
- Home, text chat, settings, and provider-status screens.
- Local fixture replies plus an optional FastAPI health, status, and mock assistant API.
- Mock mode works without provider credentials.

## Phase C — Gemini text provider (complete)

- Gemini adapter uses Google's official Python SDK and Interactions API with `store=false`.
- Add localized Gemini consent before sending current and recent chat text; provider calls require a signed, provider-scoped session receipt.
- Validate inputs, redact obvious secrets, use bounded timeouts, record privacy-safe metadata, and return safe errors.
- Keep mock mode available without credentials.
- Verify provider behavior with stubbed tests. A live provider call still needs project credentials and owner review of terms and billing.

## Phase D — Grok fallback (complete with stubbed tests)

- Added a Grok adapter using xAI's Responses API with `store=false` and bounded timeouts.
- Grok runs only after a recoverable Gemini failure, when configured, and after separate localized user consent.
- No automatic provider retries; consent and retention notes cover possible duplicate processing after an ambiguous timeout.
- Provider success and live account behavior still need verification with owner credentials and account review.

## Phase E — prototype review (complete)

- Reviewed onboarding, home, settings, service status, and sample chat replies in Marathi, Hindi, and English on the web build.
- Verified provider paths with stubbed tests; all 17 backend tests pass. See [Prototype review](PROTOTYPE_REVIEW.md) for coverage and limitations.
- Recommendation: design curated official-source retrieval and complete device/accessibility checks before considering voice or production deployment. Keep the current prototype guide-only for sensitive tasks.

## Phase F — scholarship source finder (in progress)

- MVP implemented: matching Marathi, Hindi, and English scholarship questions return localized, conservative guidance and an allowlisted list of official portals before any AI-provider consent or call.
- The current slice returns links only; it does not copy eligibility, award, document, or deadline claims into the app. Users must confirm current details on the linked portal.
- Full document retrieval, content freshness handling, and summaries tied to specific source passages remain to be designed. See [Official scholarship sources](OFFICIAL_SOURCES.md) for the catalog and review rules.

## Later work

Push-to-talk STT/TTS, full official-document retrieval, user accounts (only if needed), broader accessibility/device testing, and production deployment require separate design and review. Sensitive tasks remain guide-only.

## AI voice-engine add-on phases

These labels are scoped to the attached AI voice-engine add-on; they do not replace the existing prototype phase labels above.

- **Add-on Phase A — audit and design: complete.** Current implementation and official provider documentation were reviewed. No project code or live providers were changed in that phase.
- **Add-on Phase B — stable text engine: complete for the current prototype.** Existing Gemini-primary/Grok-fallback routing is preserved. Provider consent now uses signed, provider-scoped, one-hour receipts with revocation; the backend still has no identity/authentication, so this is not production consent enforcement. All 29 backend tests pass using stubs; no provider calls were made.
- **Add-on Phase C — voice interaction shell and STT: planned.** Add push-to-talk, temporary audio handling, transcript review/edit, cancellation, and one selected STT adapter after Marathi/Hindi/English evaluation.
- **Add-on Phase D — spoken answers: planned.** Add user-initiated playback, TTS adapter, stop/replay controls, and tested device fallback.
- **Add-on Phase E — provider backups and resilience: planned.** Add speech backups only after the primary integration and separate provider consent are tested.
- **Add-on Phase F — knowledge and quality: planned.** Extend the existing scholarship link finder only after official-source retrieval, citations, freshness, and evaluation rules are designed.

No speech provider credentials have been configured or used. The provider matrix and evaluation plan are in [AI Provider Matrix](AI_PROVIDER_MATRIX.md) and [AI Evaluation](AI_EVALUATION.md); the proposed data flow is in [Voice Architecture](VOICE_ARCHITECTURE.md).
