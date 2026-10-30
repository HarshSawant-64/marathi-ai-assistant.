# AI and Voice Evaluation Plan

**Status:** No new provider evaluation has been run. The current project has stubbed provider tests; there are no measured live-provider or speech-quality results in this document.

## Test data

Use purpose-written, non-personal examples in Marathi (`mr-IN`), Hindi (`hi-IN`), Indian English (`en-IN`), and natural Marathi-English code-switching. Do not send real user conversations to benchmark providers. Store expected transcripts and answer rubrics in test fixtures without personal data.

Cover:

- Common everyday questions in each target language.
- Regional phrasing, code-switching, names, dates, numerals, currency, and technical words.
- Quiet and moderately noisy speech, varied speaking speeds, silence, and short clipped utterances.
- Short and long assistant answers, ambiguous questions, and unanswerable questions.
- Government questions with missing or conflicting official sources; answers must not invent eligibility, amounts, or deadlines.
- Timeout, rate limit, invalid credentials, malformed response, provider unavailable, consent denied, request cancellation, and network loss.
- TTS pronunciation and intelligibility for Devanagari, names, numerals, dates, currency, and mixed-language text.

## Measurements

For each run record:

- Date, platform/device/OS, provider, exact model ID, and configuration.
- Completion rate, latency, safe error category, and estimated cost.
- STT word error rate (WER) when a reference transcript exists, plus script and language preservation.
- TTS intelligibility and naturalness (human ratings from Marathi/Hindi/English speakers using the same 1–5 rubric), playback stop behavior, and answer/audio alignment.
- Sample count, corpus limitations, and known failure cases.

Do not infer that a model is best from marketing pages or a tiny sample. Report language-specific results and do not claim a language/provider path works until that path has been tested on target devices.

## Acceptance criteria by phase

### Text engine

- Mock mode works with no provider credentials and marks replies as mock.
- Gemini is attempted first only after a valid Gemini receipt.
- Grok runs only after a recoverable Gemini error, with Grok configured and a separate valid Grok receipt.
- Invalid, expired, revoked, and wrong-provider receipts do not authorize calls.
- Authentication/configuration failures do not trigger fallback or unbounded retries.
- Provider status, validation errors, and logs expose no secrets or full conversation text.

### Speech phases

- Recording requires a user action and permission; stop/cancel works immediately in the UI.
- Transcript can be reviewed and edited before LLM submission.
- Temporary audio is removed on success, error, timeout, and cancellation.
- Marathi, Hindi, and English are evaluated independently, including code-switching and noisy samples.
- TTS playback can be stopped; failed synthesis leaves the readable answer available.
- Voice fallback and platform support are reported only for the devices actually tested.

No API credentials or live requests are needed to run the Phase B consent and routing tests. Live provider quality evaluations require separate account, terms, and cost review.
