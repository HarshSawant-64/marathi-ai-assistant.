# AwaazSetu

## Public prototype demo

Try the [AwaazSetu web demo](https://harshsawant-64.github.io/marathi-ai-assistant./). It runs in local mock mode and does not require provider credentials. New commits to `main` automatically rebuild and publish the web demo through GitHub Pages.

A Marathi-first text prototype for asking simple questions in Marathi, Hindi, or English. Gemini text support and a separately consented Grok fallback are implemented behind the backend, but mock mode is the default. Scholarship questions can surface curated official portal links; government document retrieval, speech recognition, speech synthesis, and phone assistance are not implemented.

## Current prototype

- Language onboarding for Marathi (`mr-IN`), Hindi (`hi-IN`), and Indian English (`en-IN`).
- Home, text chat, settings, and provider status screens.
- Local sample replies for offline UI work. Replies are marked as mock responses.
- Scholarship questions show a localized reminder and curated links to the National Scholarship Portal and MahaDBT.
- FastAPI health, status, and assistant endpoints.
- Optional Gemini text replies through the backend after provider-specific consent and a signed backend receipt.
- Optional Grok fallback only after a recoverable Gemini failure and a separate provider-specific consent receipt.
- In-app larger text and higher-contrast settings.
- No account, cloud history, microphone permission, or provider keys are needed for mock mode.

The project uses Expo SDK 58, JavaScript, React Native 0.88, Python 3.12, FastAPI, and Google's official `google-genai` SDK. Expo SDK 58 was released on October 15, 2026. Expo Go availability may lag the SDK release, and this workspace currently has no Android SDK/emulator installed. See [Expo's SDK 58 release notes](https://expo.dev/changelog/sdk-58).

## Run the mobile app

Requires Node.js 22.13 or later and npm. The app manifest pins the SDK family; install packages from the `mobile` directory:

```bash
cd mobile
npm install
npm start
```

Use an Expo-compatible device or development build. If using an Android emulator, configure the Android SDK and emulator first. For a physical device, both the device and development computer must be able to reach the same development network.

The app works without the backend by using local mock replies. To use the backend, copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_BASE_URL`. Use `http://10.0.2.2:8000` for the standard Android emulator host bridge. For a physical device on a trusted local network, use your computer's LAN address and start Uvicorn with `--host 0.0.0.0`; do not forward the port to the public internet.

## Run the backend

Requires Python 3.12 or later:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e .
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The development server binds to loopback by default. Do not expose this unauthenticated prototype server to the public internet.

To enable live providers, copy `backend/.env.example` to `backend/.env`, set `MOCK_MODE=false`, and add valid backend-only Gemini and Grok keys and model names. Check current model access, provider terms, data retention, and billing for both accounts before enabling them. Start Uvicorn with `--env-file .env`. The app asks separately before sending recent chat text to Gemini and before allowing Grok fallback. After each explicit choice, it gets a short-lived signed receipt from the backend. Do not put real keys in the example file, mobile app, or Git. Live API use may incur charges.

### Endpoints

- `GET /health` — basic service health.
- `GET /v1/status` — reports mode and integration availability without exposing keys.
- `POST /v1/consent/grant` — issues a provider-scoped, one-hour receipt after the consent UI action.
- `POST /v1/consent/revoke` — revokes a receipt for future requests.
- `POST /v1/assistant/reply` — returns official portal links for scholarship matches; other requests receive a localized mock reply in mock mode, or use Gemini after consent and may use Grok only after a recoverable Gemini failure with separate Grok consent.

Example request:

```json
{
  "messages": [
    {"role": "user", "content": "मला शिष्यवृत्तीबद्दल माहिती द्या"}
  ],
  "language": "mr-IN",
  "consent_receipts": {}
}
```

## Configuration and privacy

`backend/.env.example` lists provider setting names with empty credential values. The default is `MOCK_MODE=true`. The mobile app keeps chat history in memory and sends no provider data while in mock mode. Scholarship matches use a local source list and do not send the question to AI providers. Gemini requests use `store=false`; Google still processes the request under its terms. Grok requests use the Responses API with `store=false`, but xAI documents default API request/response retention of 30 days unless Zero Data Retention is enabled for the account team. Confirm account settings and current provider terms before enabling live use. A timeout may leave Gemini's result uncertain, so a consented fallback can cause both providers to process the same text and charge for it. The app does not persist conversation history.

Both consent screens are included, in Marathi, Hindi, and English. The 29 backend tests use stubs; no live provider call has been made. Consent receipts are held in app memory, provider-scoped, and expire after one hour. The backend has no authentication, so an unauthenticated caller can request a receipt directly. A receipt verifies that the backend issued a grant; it does not establish the identity of the person who accepted the disclosure. Keep this prototype backend on a trusted development network, use one backend process, and do not expose it publicly. A process restart invalidates receipts. See [Privacy](docs/PRIVACY.md), [Threat model](docs/THREAT_MODEL.md), [Accessibility](docs/ACCESSIBILITY.md), [Architecture](docs/ARCHITECTURE.md), [AI Provider Matrix](docs/AI_PROVIDER_MATRIX.md), and [Voice Architecture](docs/VOICE_ARCHITECTURE.md).

## Limitations

- Mock responses are demonstrations and must not be treated as official guidance.
- Scholarship lookup currently returns fixed official links and does not fetch or summarize scheme details. Confirm current eligibility, documents, and dates on the linked portal. See [Official scholarship sources](docs/OFFICIAL_SOURCES.md).
- Gemini replies are not verified and are not backed by a government knowledge base.
- Voice and microphone permission are not implemented.
- Speech-to-text and text-to-speech provider adapters are design-only; see [provider matrix](docs/AI_PROVIDER_MATRIX.md) and [voice architecture](docs/VOICE_ARCHITECTURE.md).
- No cross-app screen reading, accessibility service, overlay, or device actions are implemented.
- Device and Android build verification is pending because this workspace lacks Android tooling.

## Development phases

See [the roadmap](docs/ROADMAP.md) for the planned provider, voice, knowledge, and hardening phases. The add-on specification is included at [AI voice-engine add-on](docs/AWAAZSETU_AI_VOICE_ENGINE_ADDON.md). This prototype advances one phase at a time.
