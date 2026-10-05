/**
 * AI Service HTTP Client — reusable, authenticated client for the
 * JobPatra AI microservice (Python FastAPI).
 *
 * Every request automatically includes:
 *   - X-Internal-API-Key  (service-to-service auth)
 *   - X-Request-ID        (distributed tracing)
 *   - X-Service-Name      (caller identification)
 *   - Content-Type        (application/json)
 *
 * This module is the ONLY place that fetches from the AI service.
 * No other module should call fetch() against JOBPATRA_AI_URL directly.
 *
 * Server-side only — never import this from client components.
 */

import { randomUUID } from 'crypto';
import type { ApiFetchOptions } from '@/app/api/client/_utils/api-client';

export type { ApiFetchOptions };

// ---------------------------------------------------------------------------
// Configuration (read once at module level)
// ---------------------------------------------------------------------------

const AI_BASE_URL = process.env.JOBPATRA_AI_URL;
const AI_API_KEY = process.env.JOBPATRA_AI_API_KEY;

const SERVICE_NAME = 'resume_saas';
const DEFAULT_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIClientOptions {
  /** Override the timeout (ms). Default: 30 000. */
  timeoutMs?: number;
  /** Caller-supplied request ID (reuse from upstream). */
  requestId?: string;
}

export interface AIRequestConfig {
  /** HTTP method — defaults to POST. */
  method?: string;
  /** JSON-serialisable request body. */
  body?: unknown;
  /** Extra headers (merged with defaults). */
  headers?: Record<string, string>;
  /** Optional abort signal matching client ApiFetchOptions. */
  signal?: AbortSignal;
}

/** Standardised error returned by the Python microservice. */
export interface AIErrorBody {
  error: {
    code: string;
    message: string;
  };
}

/** Error thrown when the AI service returns a non-2xx status. */
export class AIServiceError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId: string,
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a request to the AI microservice and return the parsed JSON body.
 *
 * @param path  - API path, e.g. `/v1/ats/analyze`
 * @param config - method, body, extra headers
 * @param options - timeout override, caller request ID
 *
 * @throws AIServiceError on non-2xx responses
 * @throws Error on network failures or timeouts
 */
export async function aiRequest<T>(
  path: string,
  config: AIRequestConfig = {},
  options: AIClientOptions = {},
): Promise<{ data: T; requestId: string }> {
  _assertConfigured();

  const { method = 'POST', body, headers: extraHeaders } = config;
  const requestId = options.requestId ?? randomUUID();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const url = `${AI_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Internal-API-Key': AI_API_KEY!,
    'X-Request-ID': requestId,
    'X-Service-Name': SERVICE_NAME,
    ...extraHeaders,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = config.signal
    ? AbortSignal.any([controller.signal, config.signal])
    : controller.signal;

  console.log(`[AI Client] [${requestId.slice(0, 8)}] ${method} ${path}`);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as AIErrorBody | null;
      const code = errorBody?.error?.code ?? 'UNKNOWN_ERROR';
      const message = errorBody?.error?.message ?? `AI service returned ${response.status}`;

      console.error(
        `[AI Client] [${requestId.slice(0, 8)}] ${method} ${path} → ${response.status}: ${message}`,
      );

      throw new AIServiceError(response.status, code, message, requestId);
    }

    const data = (await response.json()) as T;

    console.log(`[AI Client] [${requestId.slice(0, 8)}] ${method} ${path} → ${response.status} OK`);

    return { data, requestId };
  } catch (err) {
    clearTimeout(timer);

    if (err instanceof AIServiceError) {
      throw err;
    }

    // AbortController timeout
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error(
        `[AI Client] [${requestId.slice(0, 8)}] ${method} ${path} → TIMEOUT (${timeoutMs}ms)`,
      );
      throw new AIServiceError(
        504,
        'AI_TIMEOUT',
        `AI service did not respond within ${timeoutMs}ms`,
        requestId,
      );
    }

    // Network error (service offline, DNS failure, etc.)
    console.error(`[AI Client] [${requestId.slice(0, 8)}] ${method} ${path} → NETWORK ERROR:`, err);
    throw new AIServiceError(503, 'AI_UNAVAILABLE', 'AI service is unavailable', requestId);
  } finally {
    clearTimeout(timer);
  }
}

// [ignoring loop detection]
/**
 * Send a request to the AI microservice and return the raw response body stream.
 */
export async function aiRequestStream(
  path: string,
  config: AIRequestConfig = {},
  options: AIClientOptions = {},
): Promise<{ stream: ReadableStream<Uint8Array>; requestId: string }> {
  _assertConfigured();

  const { method = 'POST', body, headers: extraHeaders } = config;
  const requestId = options.requestId ?? randomUUID();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const url = `${AI_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Internal-API-Key': AI_API_KEY!,
    'X-Request-ID': requestId,
    'X-Service-Name': SERVICE_NAME,
    Accept: 'text/event-stream',
    ...extraHeaders,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = config.signal
    ? AbortSignal.any([controller.signal, config.signal])
    : controller.signal;

  console.log(`[AI Client Stream] [${requestId.slice(0, 8)}] ${method} ${path}`);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as AIErrorBody | null;
      const code = errorBody?.error?.code ?? 'UNKNOWN_ERROR';
      const message = errorBody?.error?.message ?? `AI service returned ${response.status}`;
      throw new AIServiceError(response.status, code, message, requestId);
    }

    if (!response.body) {
      throw new AIServiceError(
        500,
        'NO_STREAM_BODY',
        'No response stream body from AI service',
        requestId,
      );
    }

    clearTimeout(timer);
    return { stream: response.body, requestId };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError(
        504,
        'AI_TIMEOUT',
        `AI service did not respond within ${timeoutMs}ms`,
        requestId,
      );
    }
    throw new AIServiceError(503, 'AI_UNAVAILABLE', 'AI service is unavailable', requestId);
  }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function _assertConfigured(): void {
  if (!AI_BASE_URL) {
    throw new Error('JOBPATRA_AI_URL is not set. Add it to your .env file.');
  }
  if (!AI_API_KEY) {
    throw new Error('JOBPATRA_AI_API_KEY is not set. Add it to your .env file.');
  }
}
