'use strict';

const { env } = require('../../config/env');

/** Typed failure so the AI service can distinguish causes without leaking details. */
class AiProviderError extends Error {
  constructor(kind, message, meta) {
    super(message);
    this.kind = kind; // timeout | auth | quota | rate_limit | unavailable | malformed | empty | network
    this.meta = meta;
  }
}

function classifyStatus(status) {
  if (status === 401 || status === 403) return 'auth';
  if (status === 402) return 'quota';
  if (status === 429) return 'rate_limit';
  if (status >= 500) return 'unavailable';
  return 'unavailable';
}

/** POSTs JSON with a hard timeout. Never throws provider payloads upward. */
async function postJson(url, body, headers, timeoutMs = env.aiTimeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AiProviderError(
        classifyStatus(response.status),
        `Provider responded with status ${response.status}`,
        { status: response.status }
      );
    }

    const text = await response.text();
    if (!text || !text.trim()) {
      throw new AiProviderError('empty', 'Provider returned an empty response');
    }
    try {
      return JSON.parse(text);
    } catch (_err) {
      throw new AiProviderError('malformed', 'Provider returned non-JSON payload');
    }
  } catch (err) {
    if (err instanceof AiProviderError) throw err;
    if (err && err.name === 'AbortError') {
      throw new AiProviderError('timeout', 'Provider request timed out');
    }
    throw new AiProviderError('network', 'Provider request failed');
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { postJson, AiProviderError };
