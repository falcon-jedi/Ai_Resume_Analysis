/**
 * Next.js instrumentation entry point.
 *
 * This file is analyzed by Turbopack for ALL runtimes (Node.js + Edge).
 * It must contain ZERO Node.js-only APIs.
 *
 * All OpenTelemetry code lives in instrumentation.node.ts, which is only
 * imported when NEXT_RUNTIME === 'nodejs'. Turbopack statically excludes
 * instrumentation.node.ts from the Edge bundle entirely, so process.on /
 * NodeSDK / etc. are never flagged as Edge-incompatible.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node');
  }
}
