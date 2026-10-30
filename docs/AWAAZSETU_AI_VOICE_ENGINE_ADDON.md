# AwaazSetu — Multi-Provider AI, Speech and Voice Engine Add-on

**Document type:** Add-on specification for Codex  
**Project:** AwaazSetu (working name)  
**Use with:** `PROJECT_BLUEPRINT.md` and `PROTOTYPE_GEMINI_GROK_PROMPT.md`  
**Purpose:** Extend the existing project with a provider-neutral AI answer engine, multilingual speech recognition, natural text-to-speech, resilient fallbacks, and cross-platform support without replacing existing work.

> **Instruction precedence:** Read the two existing project documents first. This file adds requirements for the AI and voice modules. It does not cancel the existing privacy, safety, accessibility, JavaScript, incremental-development, or prototype-first rules. If requirements conflict, explain the conflict and ask before making a destructive or architectural change.

---

## 1. Product outcome

Build a useful Marathi-first assistant that lets a user:

1. Type or speak a question in Marathi (`mr-IN`), Hindi (`hi-IN`), or Indian English (`en-IN`).
2. Receive a clear answer in the selected language, including natural code-switching where appropriate.
3. Read the answer and optionally hear it spoken aloud.
4. Stop recording or audio playback, retry, switch to text-only mode, and see useful errors.
5. Ask general questions, while receiving stronger sourcing and uncertainty handling for government schemes, public services, deadlines, eligibility, and other time-sensitive claims.
6. Continue using the app if a provider is unavailable, out of quota, unconfigured, or not consented to.

Do not promise that any model can answer every question correctly. The app should answer general questions where appropriate, acknowledge uncertainty, and use verified retrieval for authoritative public-service information.

## 2. First task: inspect, do not immediately code

Codex must start by:

1. Inspecting the repository, current branch, working tree, existing source files, package managers, tests, and current project state.
2. Reading `PROJECT_BLUEPRINT.md` and `PROTOTYPE_GEMINI_GROK_PROMPT.md` in full. If filenames differ, locate the equivalent files rather than assuming they are absent.
3. Identifying what is already implemented, what is mocked, and what is missing. Do not replace working features just to match this document.
4. Checking current official documentation, current model identifiers, supported languages, API limits, pricing/free-credit conditions, SDK compatibility, and data-handling terms before choosing any provider.
5. Producing a short implementation plan, architecture diagram, file-change list, environment requirements, provider matrix, risks, and test plan.
6. Beginning with **Phase A only** and waiting for approval before implementation. If the user has already approved a phase in the active Codex session, follow that approval without asking twice.

Do not claim that a provider is free, available, configured, or tested unless verified. Free tiers and introductory credits change; enforce configurable limits and never assume unlimited free usage.

## 3. Provider strategy: adapters, not hard-coded vendors

Implement interfaces so providers can be replaced without rewriting the UI or business logic.

### 3.1 Text answer / LLM providers

Use this default order, subject to the repository's existing Gemini/Grok prototype requirements and current official documentation:

1. **Primary: Google Gemini API** — choose a currently supported, cost-appropriate text model with confirmed access on the project's account.
2. **Secondary: xAI Grok API** — use only if configured and the user has separately consented to sending the request to xAI.
3. **Optional third: local model through Ollama** — only as an explicit optional local-development/offline profile when installed and tested. It must not be a hard dependency on every device.
4. **Optional future adapter: an Indian-language model/provider such as Sarvam** — evaluate using measured Marathi/Hindi quality, documented cost, access, privacy terms, and supported model capabilities. Do not add it merely to increase the provider count.

Do not invent model IDs. Store model names in environment configuration and validate them against current official documentation. Prefer the lowest-cost currently available model that passes a documented quality test set; allow configuration to select a stronger model for harder questions.

The router should:
- Call the primary provider first.
- Apply bounded timeouts and at most a small configurable number of retries for transient errors.
- Fall back only on recoverable errors such as timeouts, temporary server errors, or rate limits, and only if the fallback is configured and consented to.
- Not retry endlessly or blindly fall back on invalid requests, policy refusals, malformed client input, or authentication/configuration errors.
- Avoid duplicate expensive requests where possible.
- Return a normalized response with answer text, provider, configured model ID, latency, status, optional request ID, and source metadata.
- Expose safe operational status but never expose API keys or raw provider error bodies to the client.
- Log provider, status category, latency, and correlation ID only; do not log full prompts, transcripts, audio, or completions by default.

**Data-sharing boundary:** Gemini, xAI, and other providers are separate recipients. Before sending data to a provider, show a clear, localized explanation and record consent according to the project's consent design. Fallback to a second vendor is prohibited if that vendor's consent is absent. Provide a text-only/local mode where practical.

### 3.2 Speech-to-text (STT)

Build an `STTProvider` interface. Candidate adapters to evaluate:

- **Marathi/Indian-language cloud candidate:** Sarvam Saaras, using the currently recommended supported version and documented Marathi/Hindi/English language codes.
- **Cloud backup candidate:** Groq-hosted Whisper multilingual model, if the current API account, model, terms, and budget permit it. Treat it as potentially paid; do not label it free.
- **Local/offline candidate:** `whisper.cpp` where feasible on supported native platforms. It is open source and has platform support, but model size, performance, device battery, package size, and Marathi accuracy must be benchmarked. Do not download a large model silently.
- **OS-native speech recognition:** optional adapter/fallback only where the target OS and runtime expose suitable language support. Check actual Marathi availability on the current device; never assume it.

Initial recommendation: evaluate Sarvam for Marathi quality and Groq/Whisper or local Whisper as alternatives. Select the primary only after running the same real test corpus across providers. Keep provider selection configurable.

STT requirements:
- Push-to-talk only by default; no always-on or background microphone monitoring.
- Ask for microphone permission only when the user initiates recording.
- Display a visible recording indicator, elapsed time if useful, stop button, and cancel action.
- Support `mr-IN`, `hi-IN`, and `en-IN`; pass a language hint when supported.
- Handle Marathi-English code-mixing, names, numbers, noisy audio, silence, long recordings, and recognition errors.
- Use documented audio formats and enforce file size/duration limits.
- Never retain raw audio by default. Delete temporary audio files after processing.
- Let the user review/edit the transcript before submitting it to an external LLM, particularly when recognition confidence is low.
- Do not silently translate a Marathi transcript to English unless the user requested it or a documented provider limitation requires it and the UI discloses the transformation.

### 3.3 Text-to-speech (TTS)

Build a `TTSProvider` interface. Candidate adapters to evaluate:

- **Natural Indian-language voice candidate:** Sarvam Bulbul, selecting the current supported version and a verified Marathi/Hindi/English voice.
- **Alternative cloud candidate:** Gemini TTS if current official documentation confirms the needed language and voice quality; verify availability, quotas, and pricing rather than assuming.
- **System-native fallback:** Android TextToSpeech, iOS AVSpeechSynthesizer, and Web Speech Synthesis for supported web contexts. Check actual installed voices and language coverage. These are graceful fallbacks, not a guarantee of equivalent naturalness or Marathi pronunciation.
- **Optional local TTS:** only after checking current maintained open-source models, license, Marathi coverage, device performance, and install size. Do not assume a generic offline TTS engine supports Marathi well.

TTS requirements:
- Speak the answer in the selected language; support Marathi-English and Hindi-English mixed text as well as each provider allows.
- Provide play, pause/resume where supported, stop, replay, and speech-speed controls where supported.
- Split long answers into safe chunks within provider limits while preserving sentence boundaries.
- Handle Devanagari, numerals, dates, currency, abbreviations, and common English technical words.
- Never play audio automatically before user consent/settings permit it. Provide a visible playback indicator.
- Do not store generated audio by default. Cache only if there is a clear user benefit, a documented retention rule, and a delete path.
- If TTS fails, keep the answer visible and show a localized non-blocking message.
- Never claim “human-like” or “best voice” until tested with Marathi speakers and a defined evaluation.

### 3.4 Optional real-time speech-to-speech

Do not make live speech-to-speech a blocker for the first prototype. It may be evaluated after the separate STT → LLM → TTS pipeline works. A real-time audio model is a different integration from transcription plus TTS and may have different free-tier, consent, latency, and language constraints. Document the trade-offs and obtain approval before adding it.

---

## 4. Suggested module boundaries

Adapt these names to the current repository rather than creating duplicate layers.

### Backend (FastAPI, Python)

- `app/services/assistant.py` — orchestrates request, safety context, retrieval, and response.
- `app/services/providers/base.py` — provider contracts and normalized result/error types.
- `app/services/providers/gemini.py` — Gemini adapter.
- `app/services/providers/grok.py` — xAI adapter.
- `app/services/providers/ollama.py` — optional local adapter, only if approved.
- `app/services/provider_router.py` — routing, consent enforcement, bounded retry/fallback.
- `app/services/speech/base.py` — STT/TTS interfaces.
- `app/services/speech/stt_router.py` — STT selection and safe fallback.
- `app/services/speech/tts_router.py` — TTS selection and safe fallback.
- `app/services/speech/providers/` — separate provider adapters.
- `app/services/language.py` — language registry and language behavior.
- `app/services/retrieval.py` — official-source retrieval; only if the existing project has or is ready for it.
- `app/core/config.py` — validated configuration.
- `app/core/security.py` — input validation, redaction, rate limits, consent checks.
- `app/api/routes/assistant.py` — text assistant endpoint.
- `app/api/routes/speech.py` — STT/TTS endpoints where needed.
- `app/api/routes/health.py` — liveness and readiness, without secret leakage.
- `tests/` — adapter, routing, consent, fallback, and API tests.

### Mobile client (React Native + Expo, JavaScript, unless the existing repository proves a different approved stack)

- Keep the UI separate from provider implementations.
- `src/features/conversation/` — messages, text entry, loading/error states.
- `src/features/voice/` — push-to-talk, transcript review, playback controls.
- `src/features/language/` — language selection and translations.
- `src/features/settings/` — provider consent, voice preference, privacy settings.
- `src/services/api/` — backend API client.
- `src/services/speech/` — client-side recording/playback and platform adapter boundaries.
- `src/config/languages.js` — language registry.
- `src/security/` — consent state and safe display helpers.
- `tests/` — UI and behavior tests.

Use JavaScript for the mobile client, consistent with the original blueprint. Use a native Kotlin/Swift module only if a necessary feature cannot be supported safely through the selected framework, and explain why first. Do not add a second backend framework or microservice without a clear need.

---

## 5. Cross-platform support

“Works on every system” means a documented, tested compatibility plan—not a promise that every feature behaves identically everywhere.

Target in this order:
1. Backend runs on macOS, Windows, and Linux using supported Python tooling.
2. Android app is the first mobile target.
3. iOS support is kept possible through React Native/Expo and isolated platform-specific adapters.
4. A web demo may be added only if it does not duplicate the product or delay the Android prototype.

Requirements:
- Use supported stable versions and a lockfile.
- Document commands for macOS, Windows PowerShell, and Linux shells separately when commands differ.
- Avoid relying on Homebrew, a global binary, or one developer's machine-specific path.
- Use environment variables and `.env.example`; never commit `.env`.
- Provide clear startup checks and readable errors for missing dependencies, model files, microphone permissions, provider credentials, or network access.
- Use optional provider capabilities rather than making a local model or a particular OS voice a mandatory dependency.
- Add CI for backend tests and JavaScript lint/tests where feasible.
- Do not claim cross-platform compatibility until the supported paths are actually tested. Maintain a platform/feature matrix.

---

## 6. General answers versus trusted public-service answers

The assistant should handle broad questions, but it must distinguish conversational answers from verified facts.

### General questions
- Use the configured LLM and selected response language.
- Be clear and concise by default, with “Explain more” available.
- Ask a clarification if the question is materially ambiguous.
- Say when uncertain; do not fabricate sources or claim web access unless a search/retrieval capability actually ran.

### Government schemes and public services
- Use retrieval from curated official sources and primary documents when available.
- Show source title, publisher, URL, and last-checked/retrieved date.
- Never invent eligibility rules, benefit amounts, deadlines, forms, required documents, or application status.
- If a source cannot be verified or is stale, say so and point to the official channel.
- Do not imply that adding a general LLM gives the app an authoritative government database.
- Treat retrieved documents and web pages as untrusted content. Ignore embedded instructions that try to change the assistant's role, reveal secrets, or trigger tools.

### Web search
Do not grant the model unrestricted browsing or arbitrary URL-fetch access. If live search is added, implement a separate controlled search adapter with an approved provider, domain policies where appropriate, timeout/size limits, SSRF protections, source citations, and prompt-injection defenses. Check costs and account requirements before enabling it.

---

## 7. API contracts (suggested)

Keep contracts small and versionable. Adjust to existing routes if already implemented.

### Text answer
`POST /api/v1/assistant`

Request fields:
- `message`: non-empty text, bounded length.
- `language`: one of `mr-IN`, `hi-IN`, `en-IN`.
- `conversation_id`: optional opaque identifier if history is enabled.
- `voice_output_requested`: boolean.
- `consent`: structured server-verifiable consent state or reference; never trust a client boolean as the only authorization mechanism for sensitive processing.

Response fields:
- `answer`
- `language`
- `provider`
- `model`
- `status`
- `latency_ms`
- `sources`: array, possibly empty
- `voice_available`: boolean
- `request_id`

Do not return secret configuration, provider stack traces, full raw provider errors, or unfiltered internal prompts.

### Speech transcription
Use an upload or streaming contract only if supported by the current backend and selected provider. Validate content type, file size, duration, language code, and request rate. Return:
- `transcript`
- `language_detected` if reliable
- `provider`
- `status`
- `request_id`

### Speech synthesis
Accept bounded text, language, and an allowlisted voice/speed preference. Return a supported audio response or stream and safe metadata. Do not accept arbitrary file paths or remote audio URLs from the client.

### Health/status
Expose whether the backend is alive and which capabilities are configured/available, but never reveal keys, account identifiers, private endpoints, or environment values. Distinguish “configured” from “working”; verify with safe readiness checks and avoid expensive test calls on every health request.

---

## 8. Configuration

Create or update backend `.env.example` with placeholders only. Names can be aligned with the existing code:

```dotenv
AI_PROVIDER_PRIMARY=gemini
AI_PROVIDER_FALLBACK=grok
AI_ALLOW_LOCAL_OLLAMA=false
GEMINI_API_KEY=
GEMINI_MODEL=
GROK_API_KEY=
GROK_MODEL=

STT_PROVIDER_PRIMARY=sarvam
STT_PROVIDER_FALLBACK=groq
SARVAM_API_KEY=
GROQ_API_KEY=
STT_MODEL=
STT_MAX_AUDIO_SECONDS=120
STT_MAX_UPLOAD_MB=20

TTS_PROVIDER_PRIMARY=sarvam
TTS_PROVIDER_FALLBACK=system
TTS_PROVIDER=
TTS_MODEL=
SARVAM_TTS_MODEL=

AI_REQUEST_TIMEOUT_SECONDS=20
AI_MAX_RETRIES=1
AI_MAX_OUTPUT_TOKENS=
RATE_LIMIT_PER_MINUTE=
```

Only include variables the implementation actually uses. Remove duplicates and unused placeholders. Never put keys in mobile configuration, source files, test snapshots, logs, screenshots, issue reports, or Git history. Validate required settings on startup without printing values. If a key is absent, report which provider is unconfigured and continue with mock/text-only/local fallback where safe.

---

## 9. Consent, privacy, and security

All requirements in the original blueprint remain mandatory.

- Explicitly disclose that text/audio may leave the device and which provider(s) may receive it.
- Obtain separate, clear consent for each external provider, including fallback providers. Consent must be revocable.
- Do not send passwords, OTPs, API keys, auth tokens, payment details, or unnecessary identifiers to an LLM.
- Redact obvious secrets as defense in depth; do not claim redaction is perfect.
- Never record continuously in the background by default.
- No raw audio retention by default. Delete temporary files on success, error, timeout, and cancellation.
- Avoid storing conversation history unless needed and consented to. Provide deletion if history is stored.
- Do not log prompts, transcripts, audio, or completions by default.
- Use HTTPS outside local development, request size limits, rate limiting, timeouts, strict validation, and safe errors.
- Protect against prompt injection and malicious retrieved documents.
- The model must not execute arbitrary code, shell commands, SQL, or device actions.
- Any future phone action must use a strict allowlist, schema validation, permission checks, and user confirmation. Sensitive banking, payment, identity, OTP, communication, account changes, and government submissions remain guide-only.
- Keep the assistant useful without voice permissions and without external AI credentials.

---

## 10. Evaluation plan: measure instead of guessing

Create a small evaluation set with consented or purpose-written examples in Marathi, Hindi, and English. Include natural Marathi-English code-switching. Do not include real personal data.

Evaluate at least:
- Common questions in each language.
- Regional vocabulary and everyday conversational phrasing.
- Names, dates, numbers, currency, and technical terms.
- Marathi speech in quiet and moderately noisy conditions.
- Code-switching and mixed scripts.
- Short and long answers.
- Incorrect, ambiguous, and unanswerable questions.
- Government questions with missing or conflicting official sources.
- Provider timeout, rate limit, invalid key, malformed response, cancellation, and network loss.
- TTS pronunciation, intelligibility, naturalness, latency, and whether speech matches the displayed answer.

Record:
- Provider and model IDs tested.
- Date and device/OS.
- Success rate, latency, error category, and estimated cost.
- STT word error rate where reference transcripts exist.
- Human-rated Marathi intelligibility/naturalness using a simple documented rubric.
- Known weaknesses and test sample limitations.

Do not claim a model is “best” based on marketing copy. Select defaults from the actual tests. Do not send user data to third-party benchmark services.

---

## 11. Phased delivery

### Phase A — Audit and design (do this first)
- Inspect existing repository and both source documents.
- Check current official provider documentation, model IDs, language coverage, prices, quotas, free credits, privacy terms, and platform support.
- Produce provider comparison table and architecture/data-flow diagram.
- Identify existing code to reuse and files to change.
- State assumptions, risks, missing credentials, costs, and exact acceptance criteria.
- **Do not edit source files until the plan is approved.**

### Phase B — Stable text engine
- Implement/complete provider-neutral LLM interface.
- Keep Gemini primary and Grok secondary as required by the existing prototype prompt.
- Add explicit consent, timeout, bounded retry, fallback, safe error mapping, and mock mode.
- Keep local Ollama optional.
- Test without credentials and with mocked provider responses.

### Phase C — Voice interaction shell
- Add push-to-talk UX, recording/processing states, editable transcript, cancel, and text fallback.
- Implement STT interface and one provider adapter.
- Verify Marathi/Hindi/English behavior on actual test samples.
- Do not add always-on listening.

### Phase D — Spoken answers
- Add TTS interface, one natural Indian-language voice provider, and system-native fallback.
- Add stop/replay and graceful failure.
- Verify that the spoken language and displayed response are aligned.

### Phase E — Backup providers and resilience
- Add the STT/TTS backups only after primary integration is tested.
- Add provider status without exposing secrets.
- Test all failure and consent scenarios.
- Verify no unintended duplicate requests and no infinite retry loops.

### Phase F — Knowledge and quality
- Connect curated official sources and retrieval if not already implemented.
- Add citations/freshness metadata and abstention behavior for unsupported official claims.
- Run language, speech, accessibility, privacy, and regression tests.
- Update docs with known limitations and cost implications.

Do not skip phases or silently implement everything at once. Ask for approval at each phase boundary unless the user explicitly authorized a larger scope.

---

## 12. Acceptance criteria

The add-on is reviewable only when the relevant implemented phases pass these checks:

1. Text mode works without microphone permission.
2. Mock mode works without API keys and clearly identifies mock responses.
3. Gemini is attempted first when configured and consented to.
4. Grok fallback occurs only for approved recoverable failures, when configured and separately consented to.
5. Missing fallback credentials do not break the primary provider.
6. Authentication/configuration errors do not cause endless retries or inappropriate fallback.
7. Provider keys never appear in client bundles, API responses, logs, screenshots, or committed files.
8. Speech recording starts only after a user action and can be stopped/cancelled.
9. A failed STT/TTS request leaves the user able to continue in text mode.
10. Marathi, Hindi, and English are tested independently; no language is claimed supported until the actual provider/device path is tested.
11. TTS playback can be stopped, and long answers are chunked safely.
12. Raw audio is not stored by default and temporary files are cleaned up on error/cancellation.
13. Provider fallback respects per-provider consent.
14. Government/public-service answers cite real retrieved official sources when available and abstain when not verified.
15. Automated tests cover success, timeout, rate limit, invalid credentials, malformed output, provider unavailable, consent denied, missing backup, and language selection.
16. Platform support claims match the tests actually run.
17. Documentation distinguishes implemented, mocked, optional, unavailable, and unverified features.
18. No existing working feature or user file was overwritten without approval.

---

## 13. Documentation deliverables

Create/update these files without deleting or overwriting the original two project documents:

- `docs/AI_PROVIDER_MATRIX.md` — provider, capability, languages, model ID, cost/free tier, limitations, official links, verification date.
- `docs/VOICE_ARCHITECTURE.md` — STT/LLM/TTS data flow and platform adapters.
- `docs/AI_EVALUATION.md` — test corpus format, scoring rubric, measured results, limitations.
- `docs/PRIVACY.md` — update the existing privacy document with provider consent and audio handling.
- `docs/ARCHITECTURE.md` — update existing architecture only where necessary.
- `docs/ROADMAP.md` — update status and phase acceptance criteria.
- `.env.example` — placeholders only.
- Tests for provider routing, consent, speech adapter behavior, timeouts, and fallbacks.
- `README.md` — setup on macOS, Windows, and Linux; supported language/provider matrix; commands; limitations; and cost warnings.

At the end of every work session, report:
- Goal and phase
- What was inspected
- Decisions and rationale
- Files changed
- Commands actually run
- Test results actually observed
- Provider/configuration status without revealing secrets
- Cost/data-sharing implications
- Known limitations
- Next smallest step

Never claim code was tested, deployed, secure, free, or cross-platform unless the relevant checks support that claim.

---

## 14. Official documentation to verify during Phase A

Use official documentation as the source of truth and re-check it at implementation time; pages, models, prices, quotas, and free credits can change.

- Google Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Google Gemini speech generation: https://ai.google.dev/gemini-api/docs/speech-generation
- xAI API pricing: https://docs.x.ai/developers/pricing
- Groq speech-to-text docs: https://console.groq.com/docs/speech-to-text
- Sarvam model list: https://docs.sarvam.ai/api/getting-started/models
- Sarvam pricing: https://docs.sarvam.ai/api/getting-started/pricing
- Sarvam rate limits/credits: https://docs.sarvam.ai/api/getting-started/ratelimits
- Sarvam speech-to-text guide: https://docs.sarvam.ai/api-reference-docs/building-for-india
- Sarvam text-to-speech REST API: https://docs.sarvam.ai/api/api-guides-tutorials/text-to-speech/rest-api
- `whisper.cpp` supported platforms and native examples: https://github.com/ggml-org/whisper.cpp

These links are candidates for research, not a guarantee that each service is free or suitable. Verify access, pricing, language support, license, data handling, and the actual project account before enabling a provider.

---

## 15. Start instruction for Codex

**Start with Phase A only.**

Read `PROJECT_BLUEPRINT.md`, `PROTOTYPE_GEMINI_GROK_PROMPT.md`, and this add-on fully. Inspect the existing repository and environment before proposing changes. Research the official provider docs listed above and any better verified options. Present:

1. A concise summary of the current project state.
2. A provider matrix for LLM, STT, and TTS with primary, backup, optional offline path, supported languages, actual free-tier/paid status, privacy considerations, and official links.
3. A Mermaid architecture/data-flow diagram.
4. A list of existing files to preserve and exact files proposed for Phase B.
5. Risks, unknowns, required credentials, estimated usage costs, and consent boundaries.
6. A test and acceptance plan.

Do not edit source code, install packages, create accounts, call paid APIs, or modify existing files in Phase A. Wait for approval before Phase B.
