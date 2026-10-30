import { createMockReply, findOfficialSourceReply } from './mockAssistant';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export const hasBackendUrl = Boolean(API_BASE_URL);

function wait(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Request cancelled.'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    function abort() {
      clearTimeout(timer);
      reject(new Error('Request cancelled.'));
    }
    signal?.addEventListener('abort', abort, { once: true });
  });
}

export async function requestConsentGrant(provider) {
  if (!API_BASE_URL) {
    throw new Error('Consent receipts require the configured backend.');
  }

  const response = await fetch(`${API_BASE_URL}/v1/consent/grant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, notice_version: 'v1' }),
  });
  if (!response.ok) {
    throw new Error('Could not record provider consent.');
  }
  return response.json();
}

export async function revokeConsentReceipt(consentReceipt) {
  if (!API_BASE_URL || !consentReceipt) return;
  const response = await fetch(`${API_BASE_URL}/v1/consent/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ consent_receipt: consentReceipt }),
  });
  if (!response.ok) {
    throw new Error('Could not revoke provider consent.');
  }
}

export async function requestReply(messages, language, consentReceipts = {}, signal) {
  const currentMessage = messages[messages.length - 1]?.content || '';
  if (!API_BASE_URL) {
    await wait(350, signal);
    const officialSourceReply = findOfficialSourceReply(currentMessage, language);
    return {
      reply: officialSourceReply?.reply || createMockReply(currentMessage, language),
      mode: 'mock',
      provider: 'mock',
      sources: officialSourceReply?.sources || [],
    };
  }

  const controller = new AbortController();
  const abortRequest = () => controller.abort();
  signal?.addEventListener('abort', abortRequest, { once: true });
  // Two provider calls may run sequentially when the user has opted in to fallback.
  const timeout = setTimeout(() => controller.abort(), 125000);

  try {
    const response = await fetch(`${API_BASE_URL}/v1/assistant/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        language,
        consent_receipts: consentReceipts,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const code = errorBody?.detail?.code;
      const error = new Error('Assistant endpoint returned an error.');
      error.code = typeof code === 'string' ? code : 'assistant_request_failed';
      throw error;
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortRequest);
  }
}

export async function requestProviderStatus() {
  if (!API_BASE_URL) {
    return {
      mode: 'mock',
      assistant_endpoint: 'local fixture',
      providers: {
        gemini: { implemented: true, configured: false, available: false, role: 'primary' },
        grok: { implemented: true, configured: false, available: false, role: 'fallback' },
      },
    };
  }

  const response = await fetch(`${API_BASE_URL}/v1/status`);
  if (!response.ok) {
    throw new Error('Status endpoint returned an error.');
  }
  return response.json();
}
