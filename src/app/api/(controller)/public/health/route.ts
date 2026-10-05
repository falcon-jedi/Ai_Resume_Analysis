import { NextResponse } from 'next/server';

// GET /api/public/health
// Lightweight liveness probe — no DB, no S3, no external calls.
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
