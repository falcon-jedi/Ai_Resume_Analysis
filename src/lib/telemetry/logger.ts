/**
 * Structured, PII-redacting logger with automatic OTel trace correlation.
 *
 * Usage (in any server-side file):
 *
 *   import { logger } from '@/lib/telemetry/logger';
 *
 *   logger.info('ats.analyze.start', { userId, resumeFileName });
 *   logger.error('ats.analyze.failed', { userId, error: err.message });
 *
 * Extending to new routes (payments, auth, etc.):
 *   - Add `import { logger } from '@/lib/telemetry/logger';`
 *   - Replace `console.error(...)` with `logger.error('event.name', { ... })`
 *   - This file does NOT need to change — the logger is fully generic.
 *
 * Design:
 *   - Emits to OTel LoggerProvider (set up by instrumentation.ts) AND console.
 *   - OTel provider is resolved lazily from global — no circular initialisation.
 *   - Active trace/span IDs are injected automatically when inside an OTel span.
 *   - PII redaction runs before any field reaches the exporter or console.
 *   - Every emit is wrapped in try/catch — logger never throws or breaks the app.
 */

import { trace } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import type { Logger as OTelLogger, AnyValueMap } from '@opentelemetry/api-logs';

// ── PII redaction ─────────────────────────────────────────────────────────────

/**
 * Keys whose VALUES are replaced with "[REDACTED]" before any log is emitted.
 * This is the single place to add new sensitive field names.
 */
const REDACTED_KEYS = new Set([
  'resumeText',
  'jobDescription',
  'jobDescriptionText',
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'idToken',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
  'resumeFileBytes',
]);

function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(k)) {
      out[k] = '[REDACTED]';
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = redact(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ── OTel logger singleton ─────────────────────────────────────────────────────

// Type only — avoids importing the class at module load time.
type LoggerProvider = { getLogger(name: string): OTelLogger };

let _otelLogger: OTelLogger | null = null;

function getOtelLogger(): OTelLogger | null {
  if (_otelLogger) return _otelLogger;
  const g = global as typeof global & { __otelLoggerProvider?: LoggerProvider };
  if (!g.__otelLoggerProvider) return null;
  _otelLogger = g.__otelLoggerProvider.getLogger('resume-saas');
  return _otelLogger;
}

// ── Severity mapping ──────────────────────────────────────────────────────────

type Level = 'debug' | 'info' | 'warn' | 'error';

const SEVERITY: Record<Level, { number: SeverityNumber; text: string }> = {
  debug: { number: SeverityNumber.DEBUG, text: 'DEBUG' },
  info:  { number: SeverityNumber.INFO,  text: 'INFO'  },
  warn:  { number: SeverityNumber.WARN,  text: 'WARN'  },
  error: { number: SeverityNumber.ERROR, text: 'ERROR' },
};

// ── Core emit ─────────────────────────────────────────────────────────────────

function emit(level: Level, event: string, attrs: Record<string, unknown> = {}): void {
  try {
    const safe = redact(attrs);

    // Inject active trace/span IDs if inside an OTel-instrumented request span.
    const span = trace.getActiveSpan();
    const traceAttrs: Record<string, string> = {};
    if (span) {
      const ctx = span.spanContext();
      traceAttrs['trace.id'] = ctx.traceId;
      traceAttrs['span.id']  = ctx.spanId;
    }

    const otelLogger = getOtelLogger();
    if (otelLogger) {
      otelLogger.emit({
        severityNumber: SEVERITY[level].number,
        severityText:   SEVERITY[level].text,
        body:           event,
        attributes:     { ...(safe as AnyValueMap), ...traceAttrs },
        observedTimestamp: Date.now(),
      });
    }

    // Always mirror to console for readable local dev output.
    const extra = Object.keys(safe).length > 0 ? safe : undefined;
    switch (level) {
      case 'debug': console.debug(`[DEBUG] ${event}`, extra ?? ''); break;
      case 'info':  console.info (`[INFO]  ${event}`, extra ?? ''); break;
      case 'warn':  console.warn (`[WARN]  ${event}`, extra ?? ''); break;
      case 'error': console.error(`[ERROR] ${event}`, extra ?? ''); break;
    }
  } catch {
    // Swallow — telemetry must never crash application code.
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const logger = {
  debug: (event: string, attrs?: Record<string, unknown>) => emit('debug', event, attrs),
  info:  (event: string, attrs?: Record<string, unknown>) => emit('info',  event, attrs),
  warn:  (event: string, attrs?: Record<string, unknown>) => emit('warn',  event, attrs),
  error: (event: string, attrs?: Record<string, unknown>) => emit('error', event, attrs),
};
