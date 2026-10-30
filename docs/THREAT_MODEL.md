# Threat model

## Assets

- User-entered text and selected language.
- Gemini and Grok credentials.
- Session-scoped provider consent choices.
- Accuracy and trust signals shown alongside public-service information.

## Trust boundaries

- The mobile client is not trusted to protect provider keys or enforce backend authorization.
- The backend validates all client fields and does not accept arbitrary provider names or model actions.
- External provider services are separate data processors. Fallback crosses another data-sharing boundary.
- Model output, retrieved documents, and user-entered text are untrusted content.

## Current phase mitigations

- Mock mode is the default and makes no external AI calls.
- Scholarship matches use a local allowlist and return only curated HTTPS government links. The matching query is not sent to AI providers; users must verify current scheme details on the linked portal.
- The app does not accept a destination URL from the user or from model output. Only the curated source links are opened from the source list.
- Live Gemini calls require configured backend credentials and explicit provider-specific consent.
- The mobile app displays a localized disclosure before the current message and recent chat context can reach Gemini, followed by a separate Grok fallback consent when Grok is configured. Consent lasts only for the open chat and can be revoked.
- Gemini requests use `store=false` to opt out of stored Interaction resources.
- Grok fallback uses xAI's Responses API with `store=false`, does not retry, and can run only after a recoverable Gemini failure with Grok consent.
- The backend accepts only the three supported language codes and a bounded text length.
- The API returns no credential values or provider secrets.
- Obvious email, Indian mobile-number, card-number, password, and OTP patterns are redacted before Gemini and Grok calls. Redaction is best-effort and not complete.
- The README binds the development server to loopback and warns against public exposure.
- No raw audio, conversation database, account system, or cross-app access exists.
- The UI labels replies as mock and public information as unverified.

## Risks before live providers

- A user may include passwords, one-time codes, or identifying details in free text. Redaction and warnings are best-effort; do not claim they catch every secret.
- A Gemini timeout can have an ambiguous outcome. Sending the same text to Grok may duplicate processing and charges. Only one Grok fallback is attempted, and the consent screen discloses this behavior.
- xAI documents 30-day default API request/response retention for auditing. `store=false` controls stored Responses behavior and is not a substitute for confirming account-level retention settings. The Grok consent screen explains the retention before fallback is enabled.
- Unauthenticated endpoints can be abused if exposed beyond local development. Add appropriate access controls and rate limits before shared or public deployment.
- Official portals can change their links and content. The source list needs periodic owner review, and the current finder does not validate live page content or guarantee that a page is available.
- A generated answer can be wrong. Do not claim a government benefit, deadline, eligibility rule, or task completion without verified official sources.

## Explicitly out of scope

No accessibility service, overlay, background listening, arbitrary screen capture, cross-app clicking, credential handling, payments, calls, messages, account changes, or government form submissions.
