# Privacy and data handling

## Current prototype inventory

| Data | Purpose | Location | Retention |
| --- | --- | --- | --- |
| Selected language | Localized UI and replies | App memory | Until app restarts |
| Text typed into chat | Produce a reply | App memory; scholarship matches are handled locally; other requests may use FastAPI | Not persisted by this project |
| Gemini API key and model | Gemini requests | Backend environment only | Not stored by mobile app |
| Grok API key and model | Optional fallback requests | Backend environment only | Not stored by mobile app |
| Consent receipt | Authorize one provider for the current chat | Chat-screen memory; revocation ID in backend process memory | App restart drops it; expires after one hour; backend restart invalidates it and clears revocation IDs |
| Audio, contacts, notifications, screen contents | Not collected | Not accessed | None |

The local mock path does not transmit text. Scholarship matches return a short reminder and links from the local allowlist; those questions do not reach the backend or an AI provider. If `EXPO_PUBLIC_API_BASE_URL` is configured, other chat text is sent to the configured backend. The backend also checks scholarship queries against its allowlist before provider routing. In mock mode other requests receive a fixture without calling an AI provider. In live mode, the current message and recent chat context are sent to Gemini only after the user agrees to a localized consent screen. Grok receives that text only after a recoverable Gemini failure and a separate Grok consent. History remains in app memory and is not persisted by this project.

## Provider consent and retention

Gemini and Grok require separate consent because they are different external services. The localized Grok disclosure explains that the same text may reach both providers after an ambiguous Gemini timeout. The Gemini adapter sends `store=false` to opt out of stored Interaction resources, but Google still processes requests under its applicable service terms. The Grok adapter sends `store=false` to avoid storing Responses for later retrieval; this does not disable xAI's separate audit retention. Never include API keys, passwords, OTPs, or authentication tokens in prompts.

As checked on October 28, 2026, Google's Interactions API stores requests by default; `store=false` opts out of storing Interaction resources. xAI documents default API request/response retention of 30 days; account-level Zero Data Retention changes this. Provider terms and account settings still apply. Verify them before live use.

## Consent receipts

Gemini and Grok require separate consent because they are different external services. After the user accepts a provider-specific disclosure, the app requests a signed, provider-scoped receipt from the backend. The backend checks this receipt before sending text to that provider; a client boolean alone no longer authorizes a call. Receipts are held in chat-screen memory, expire after one hour, and can be revoked. Clearing the chat, leaving the chat screen, or turning off Gemini consent also revokes its Grok receipt. The backend keeps revocation identifiers in process memory only; restarting it invalidates all receipts because its signing key is regenerated.

This receipt mechanism does not authenticate users. The consent-grant endpoint is available without an account, so an arbitrary API caller can request a receipt directly. The prototype API must remain on a trusted development network and must not be exposed publicly. Receipts and revocations are process-local; use one backend process only. A failed network request can prevent server-side revocation, though the app drops the receipt locally and it expires within one hour. Before production, the project needs an approved user/session identity and durable consent/revocation policy. Revocation prevents future requests using the receipt; it cannot recall content already sent to a provider or stop provider processing that has already started.
