interface ApiErrorBody {
  success: false;
  message?: string;
  errors?: Record<string, string[]>;
  retryAfter?: number;
}

export class RateLimitError extends Error {
  retryAfter: number;
  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export type ApiFetchOptions = Omit<RequestInit, 'credentials'>;

export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { headers: callerHeaders, ...restOptions } = options;

  const response = await fetch(url, {
    // ── Defaults every call must have ─────────────────────────────────────────
    credentials: 'include', // send HTTP-only session cookie on every request
    // Resume/profile data is edited in-place. Never let a browser HTTP cache
    // return an older version after a successful save.
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json', // overridable by callerHeaders
      ...callerHeaders,
    },
    // ── Spread the rest (method, body, cache, signal, …) ─────────────────────
    ...restOptions,
  });

  // Parse JSON once, regardless of success or failure.
  // The backend always returns JSON, even for errors.
  const data = (await response.json()) as T | ApiErrorBody;

  if (!response.ok) {
    // Attempt to extract a human-readable message from the backend body.
    const errorBody = data as ApiErrorBody;
    const message =
      errorBody?.message ?? `Request failed with status ${response.status} ${response.statusText}`;

    if (errorBody?.errors) {
      console.error('[API Validation Errors]', errorBody.errors);
    }

    if (response.status === 429) {
      throw new RateLimitError(message, errorBody?.retryAfter ?? 60);
    }

    throw new Error(message);
  }

  return data as T;
}
