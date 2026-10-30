# ADR 0001: Prototype stack

- **Status:** Accepted for prototype phases B, C, and D.
- **Date:** 2026-10-28.

## Context

The project needs an Android-first, multilingual prototype with mock mode and a small replaceable backend. There are no files in the destination repository. The environment has Node.js 24 and Python 3.12, but no Android SDK/emulator.

## Decision

- Use React Native with Expo SDK 58 and JavaScript for the mobile client.
- Use Python 3.12 with FastAPI and Uvicorn for the backend.
- Keep navigation lightweight and use local fixtures so the app can open without provider credentials.
- Use Google's official `google-genai` SDK for the Gemini adapter and the Interactions API with `store=false`.
- Use xAI's Responses API for Grok fallback with `store=false`, separate localized consent, and no automatic retry.

Expo's SDK 58 reference lists React Native 0.88, React 19.3, Android API 36 target, and Node.js 22.13+ as the SDK minimum. This environment's Node version meets that minimum. Expo Go distribution may lag the newly released SDK, and local Android build tooling is not installed, so device verification remains pending.

FastAPI 0.162.0 and Uvicorn 0.54.0 are current stable releases checked on 2026-10-28. Their versions are pinned in `backend/pyproject.toml` for a repeatable prototype setup.

Google's `google-genai` 2.33.0 release is pinned in `backend/pyproject.toml`. The official SDK supports the Interactions API; Gemini model choice remains an environment setting so the owner can confirm availability for their account.

## Consequences

- The app can be extended for iOS while keeping Android as the first target.
- The current machine cannot build or launch an Android emulator until Android tooling is installed.
- SDK versions must be rechecked before a later upgrade; Expo package versions should remain aligned with the selected SDK.
- Mock mode has no AI cost or provider data transfer. Live Gemini sends chat text only after session consent. Grok fallback requires a recoverable Gemini failure and a separate consent. xAI's default audit retention still applies unless account-level Zero Data Retention is enabled.
