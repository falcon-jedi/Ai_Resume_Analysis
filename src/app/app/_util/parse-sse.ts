'use client';

/**
 * Shared SSE parser utility for AI streaming responses.
 *
 * Wire format consumed:
 *   data: {"token": "<text>"}   — one token event
 *   data: [DONE]                — stream complete
 *   event: error
 *   data: {"code":"...","message":"..."}  — error event
 */

export type SSEEvent = { isDone: boolean; token?: string; error?: string };

/**
 * Parse a raw SSE text chunk into an array of structured events.
 * Safe to call with partial chunks — incomplete events (no trailing \n\n)
 * are simply ignored and should be retained in the caller's buffer.
 */
export function parseSSEChunk(raw: string): SSEEvent[] {
  const results: SSEEvent[] = [];
  const blocks = raw.split(/\n\n/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n');
    let dataLine = '';
    let eventType = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLine = line.slice(5).trim();
      }
    }

    if (!dataLine) continue;

    if (dataLine === '[DONE]') {
      results.push({ isDone: true });
      continue;
    }

    if (eventType === 'error') {
      try {
        const parsed = JSON.parse(dataLine);
        results.push({ isDone: false, error: parsed.message ?? 'AI service error' });
      } catch {
        results.push({ isDone: false, error: 'AI service error' });
      }
      continue;
    }

    try {
      const parsed = JSON.parse(dataLine);
      if (typeof parsed.token === 'string') {
        results.push({ isDone: false, token: parsed.token });
      }
    } catch {
      // Ignore unparseable chunks
    }
  }

  return results;
}
