/**
 * Node.js-only OpenTelemetry initialisation.
 *
 * This file is ONLY imported from instrumentation.ts when NEXT_RUNTIME === 'nodejs'.
 * Turbopack therefore never includes it in the Edge bundle and never validates it
 * against Edge Runtime constraints — so process.on / NodeSDK / all Node APIs are safe here.
 *
 * Local dev:  OTEL_EXPORTER_OTLP_ENDPOINT → Grafana Cloud directly
 * Production: set OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318 — zero code change
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'resume-saas';

if (!endpoint) {
  console.warn('[otel] OTEL_EXPORTER_OTLP_ENDPOINT not set — telemetry disabled');
} else {
  try {
    // Parse "Key=Value,Key2=Value2" header string from env.
    const rawHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS ?? '';
    const parsedHeaders: Record<string, string> = {};
    rawHeaders.split(',').forEach((pair) => {
      const idx = pair.indexOf('=');
      if (idx > 0) {
        parsedHeaders[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
      }
    });

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '0.0.0',
      'deployment.environment': process.env.NODE_ENV ?? 'development',
    });

    // ── Logs ──────────────────────────────────────────────────────────────────
    const logExporter = new OTLPLogExporter({
      url: `${endpoint}/v1/logs`,
      headers: parsedHeaders,
    });

    // BatchLogRecordProcessor: buffers and flushes in background — zero per-request latency.
    const loggerProvider = new LoggerProvider({
      resource,
      processors: [new BatchLogRecordProcessor({ exporter: logExporter })],
    });

    // Singleton on global — survives Next.js hot-reloads; picked up lazily by logger.ts.
    const g = global as typeof global & { __otelLoggerProvider?: typeof loggerProvider };
    if (!g.__otelLoggerProvider) {
      g.__otelLoggerProvider = loggerProvider;
    }

    // ── Traces ────────────────────────────────────────────────────────────────
    const traceExporter = new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
      headers: parsedHeaders,
    });

    const sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // fs is extremely noisy in Next.js (every static file read).
          '@opentelemetry/instrumentation-fs': { enabled: false },
          // Skip internal Next.js asset serving and health checks.
          '@opentelemetry/instrumentation-http': {
            ignoreIncomingRequestHook: (req) => {
              const url = (req as { url?: string }).url ?? '';
              return url.startsWith('/_next') || url === '/api/health';
            },
          },
        }),
      ],
    });

    sdk.start();

    // Graceful shutdown on SIGTERM (Docker stop / process manager).
    // Safe here — this file is never bundled for Edge.
    process.on('SIGTERM', () => {
      sdk
        .shutdown()
        .then(() => loggerProvider.shutdown())
        .catch((e) => console.error('[otel] shutdown error:', e));
    });

    console.info(`[otel] Telemetry started → ${endpoint} (service: ${serviceName})`);
  } catch (err) {
    console.error('[otel] Failed to initialise — telemetry disabled:', err);
  }
}
