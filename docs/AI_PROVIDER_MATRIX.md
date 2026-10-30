# AI Provider Matrix

**Verified against official documentation:** October 29, 2026. Prices are provider list prices, not a quote for this project. The project has not verified access, billing, quotas, or account-level data settings. No live provider calls were made.

## Text generation

| Role | Candidate | Language status | Listed price | Data handling and limits |
|---|---|---|---|---|
| Primary | Google Gemini API, `gemini-3.8-flash` | Evaluate `mr-IN`, `hi-IN`, and `en-IN` with the project corpus; quality is not verified. | Through Dec. 31, 2026: $0.75/M input tokens and $3.75/M output tokens. Listed rates double from Jan. 1, 2027. Some model/account combinations have free quota. | Google says unpaid-service prompts and responses may be used to improve products and may be reviewed by people. Paid-service prompts and responses are not used for product improvement. Project adapter uses `store=false`; this does not replace review of account terms. [Pricing](https://ai.google.dev/gemini-api/docs/pricing), [terms](https://ai.google.dev/gemini-api/terms), [data retention](https://ai.google.dev/gemini-api/docs/zdr).
| Fallback | xAI API, `grok-4.6` | Test the project languages; no AwaazSetu evaluation exists yet. | Short-context list price: $2/M input, $0.50/M cached input, and $6/M output tokens. | xAI says API requests and responses are retained for 30 days by default and are not used for training without permission. Team-level Zero Data Retention is available. Project adapter uses `store=false`, which does not by itself change the account's audit-retention setting. [Pricing](https://docs.x.ai/developers/pricing), [security and retention](https://docs.x.ai/developers/faq/security).
| Optional offline | Ollama local model | No model selected or language-tested. | No per-request cloud API fee; device compute and model distribution costs apply. | Not implemented and not a required dependency. Keep disabled unless separately selected and tested.

### Example text costs

For an illustrative turn with 1,000 input tokens and 500 output tokens, list prices imply about **$0.002625** for Gemini 3.8 Flash through Dec. 31, 2026, then about **$0.00525** from Jan. 1, 2027. For Grok 4.6, the same turn is about **$0.005** at the listed short-context rates. Ten thousand turns at those exact token sizes would be about $26.25 or $50 respectively, before taxes and any other usage. Real conversations may use more or fewer tokens.

## Speech-to-text

| Role | Candidate | Language status | Listed price / access | Data handling and limits |
|---|---|---|---|---|
| Primary candidate | Sarvam Saaras v4, `saaras:v4` | 23 languages including Marathi, Hindi, and English; supports transcription, verbatim, transliteration, code-mixed, and translation output modes. | ₹30/audio hour, billed per second. Sarvam advertises ₹100 signup credits for new users; the project account is unknown. | The REST endpoint is limited to 30 seconds per request. Workspace data-retention and training controls exist; review actual settings and periods before use. [Models](https://docs.sarvam.ai/api/getting-started/models), [Saaras](https://docs.sarvam.ai/api/getting-started/models/saaras), [pricing](https://docs.sarvam.ai/api/getting-started/pricing), [account controls](https://docs.sarvam.ai/api/platform/faq).
| Backup candidate | Groq-hosted Whisper, `whisper-large-v3-turbo` | Provider docs say multilingual but do not establish Marathi accuracy. Benchmark all three target languages. | $0.04/audio hour; `whisper-large-v3` is listed at $0.111/hour. The documented minimum billed duration is 10 seconds. | Groq says inference inputs/outputs are not retained by default, with up to 30 days of limited reliability or abuse monitoring retention. Zero Data Retention is an account control. [STT docs and pricing](https://console.groq.com/docs/speech-to-text), [data controls](https://console.groq.com/docs/your-data).
| Optional offline | `whisper.cpp` with a selected multilingual Whisper model | Needs device and Marathi/code-mix evaluation. | No per-request API price; device compute, battery, app size, and model distribution apply. | Repository supports Android, iOS, macOS, Linux, and Windows. The code repository is MIT-licensed; review the selected model weights' terms separately. No model download or integration is included in this phase. [Project](https://github.com/ggml-org/whisper.cpp).
| Device-dependent fallback | OS speech recognition | Actual recognition languages vary by device, engine, and installed data. | No project-level API price assumed. | Must query actual device capability; Marathi support is not assumed.

## Text-to-speech

| Role | Candidate | Language status | Listed price / access | Data handling and limits |
|---|---|---|---|---|
| Primary candidate | Sarvam Bulbul v4 Flash, `bulbul:v4-flash` | Current recommended model; voices cover Marathi, Hindi, and English, with selected code-mixed voice options. | Current pricing page lists speech synthesis at ₹30/10,000 characters; confirm that tariff applies to v4 before budgeting. New-user credits, if available, are shared across Sarvam APIs. | REST input limit is 2,500 characters. Review workspace retention and training controls. [Models](https://docs.sarvam.ai/api/getting-started/models), [Bulbul](https://docs.sarvam.ai/api/getting-started/models/bulbul), [pricing](https://docs.sarvam.ai/api/getting-started/pricing).
| Backup candidate | Gemini `gemini-3.8-flash-lite-tts` | Official docs list Marathi, Hindi, and English support. Quality and code-switching need testing. | Through Dec. 31, 2026: $0.50/M text input tokens and $6/M audio output tokens, equivalent to about $0.0015 per 10 seconds of output audio plus text input. Listed rates double from Jan. 1, 2027. Free quota is account/model dependent. | On the free tier, content may be used to improve Google products; paid tier has different data-use terms. [TTS guide](https://ai.google.dev/gemini-api/docs/speech-generation), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [terms](https://ai.google.dev/gemini-api/terms).
| Graceful device fallback | Android TextToSpeech, iOS AVSpeechSynthesizer, and supported browser speech synthesis | Query real device voices; no language or quality parity is guaranteed. | No project API fee; a third-party installed engine may have its own behavior. | Use only a voice reported as available by the platform. Android exposes voice and locale checks through its TTS API. [Android TTS](https://developer.android.com/reference/android/speech/tts/TextToSpeech).

## Selection rule

These are candidates, not implemented integrations or claims that a provider is best. Select defaults only after evaluating the same purpose-written Marathi, Hindi, English, and code-mixed samples. Recheck model IDs, billing, quotas, privacy controls, and commercial terms when implementation begins. Keep provider credentials on the backend and keep mock mode as the default.
