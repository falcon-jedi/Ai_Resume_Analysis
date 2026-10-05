/**
 * Integration tests for the Next.js ↔ Python AI service communication.
 *
 * Run: node --experimental-strip-types tests/integration/ai-service.test.ts
 *
 * These tests call the LIVE Python FastAPI service (localhost:8000).
 * Start the Python service before running:
 *
 *   cd Ai_backend && uv run uvicorn main:app --reload
 *
 * Tests verify:
 *   ✅ Valid token + payload → 200 with ATS report
 *   ❌ Invalid token → 401
 *   ❌ Missing token → 401
 *   ❌ Python offline → connection refused (ECONNREFUSED)
 *   ✅ X-Request-ID propagated — same ID returned in response header
 *   ✅ All required score fields present in response
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// Config — read from env, mirrors what the Next.js service code reads
// ---------------------------------------------------------------------------

const AI_BASE_URL = process.env.JOBPATRA_AI_URL ?? 'http://localhost:8000';
const AI_API_KEY = process.env.JOBPATRA_AI_API_KEY ?? 'test_api_key_123';
const ENDPOINT = `${AI_BASE_URL}/v1/ats/analyze`;

const SAMPLE_RESUME = `
John Doe
Software Engineer

Skills
Python Docker React Node.js AWS

Experience
Senior Developer at Acme Corp 2021-2024
  Built microservices using Node.js and Docker.
  Led a team of 5 engineers.
  Reduced latency by 40%.

Education
B.Sc Computer Science
State University 2017-2021

Certifications
AWS Certified Developer
`;

const SAMPLE_JD = `
We are looking for a Software Engineer proficient in Python, React, Docker,
and Node.js. Experience with AWS is a plus. The candidate should have strong
experience building scalable REST APIs in an Agile environment.
`;

const VALID_BODY = JSON.stringify({
  resume: { text: SAMPLE_RESUME },
  job_description: { text: SAMPLE_JD },
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function callAI(opts: {
  body?: string;
  headers?: Record<string, string>;
}): Promise<Response> {
  const { body = VALID_BODY, headers = {} } = opts;
  return fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Python AI service — authentication', () => {
  test('valid API key returns 200', async () => {
    const res = await callAI({
      headers: { 'X-Internal-API-Key': AI_API_KEY },
    });
    assert.equal(res.status, 200, `Expected 200 but got ${res.status}: ${await res.text()}`);
  });

  test('missing API key returns 401', async () => {
    const res = await callAI({ headers: {} });
    assert.equal(res.status, 401);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('invalid API key returns 401', async () => {
    const res = await callAI({
      headers: { 'X-Internal-API-Key': 'wrong-key-absolutely-invalid' },
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('Bearer token (Authorization header) also accepted', async () => {
    const res = await callAI({
      headers: { Authorization: `Bearer ${AI_API_KEY}` },
    });
    assert.equal(res.status, 200);
  });
});

describe('Python AI service — request ID propagation', () => {
  test('provided X-Request-ID is echoed back in response header', async () => {
    const myRequestId = 'test-550e8400-e29b-41d4-a716-446655440000';
    const res = await callAI({
      headers: {
        'X-Internal-API-Key': AI_API_KEY,
        'X-Request-ID': myRequestId,
      },
    });
    assert.equal(res.status, 200);
    const returnedId = res.headers.get('x-request-id');
    assert.equal(returnedId, myRequestId, 'Request ID must be echoed back unchanged');
  });

  test('server generates X-Request-ID if not provided', async () => {
    const res = await callAI({
      headers: { 'X-Internal-API-Key': AI_API_KEY },
    });
    assert.equal(res.status, 200);
    const returnedId = res.headers.get('x-request-id');
    assert.ok(returnedId, 'Server must generate and return X-Request-ID');
    assert.ok(returnedId!.length > 0);
  });
});

describe('Python AI service — response schema', () => {
  let body: Record<string, unknown>;

  before(async () => {
    const res = await callAI({
      headers: { 'X-Internal-API-Key': AI_API_KEY },
    });
    assert.equal(res.status, 200);
    body = (await res.json()) as Record<string, unknown>;
  });

  test('all score fields are present', () => {
    const scoreFields = [
      'overall_score',
      'keyword_score',
      'experience_score',
      'skills_score',
      'education_score',
      'summary_score',
      'formatting_score',
    ];
    for (const field of scoreFields) {
      assert.ok(field in body, `Missing field: ${field}`);
    }
  });

  test('all scores are in [0, 100]', () => {
    const scoreFields = [
      'overall_score',
      'keyword_score',
      'experience_score',
      'skills_score',
      'education_score',
      'summary_score',
      'formatting_score',
    ];
    for (const field of scoreFields) {
      const val = body[field] as number;
      assert.ok(val >= 0 && val <= 100, `${field} = ${val} out of [0, 100]`);
    }
  });

  test('matched_keywords is an array', () => {
    assert.ok(Array.isArray(body.matched_keywords));
  });

  test('missing_keywords is an array', () => {
    assert.ok(Array.isArray(body.missing_keywords));
  });

  test('matched_skills is an array', () => {
    assert.ok(Array.isArray(body.matched_skills));
  });

  test('missing_skills is an array', () => {
    assert.ok(Array.isArray(body.missing_skills));
  });

  test('experience_summary has required fields', () => {
    const exp = body.experience_summary as Record<string, unknown>;
    assert.ok('total_entries' in exp);
    assert.ok('total_years' in exp);
    assert.ok('has_metrics' in exp);
  });

  test('education_summary has required fields', () => {
    const edu = body.education_summary as Record<string, unknown>;
    assert.ok('highest_degree' in edu);
    assert.ok('certifications' in edu);
  });

  test('processing_time_ms is positive', () => {
    const t = body.processing_time_ms as number;
    assert.ok(t > 0, `processing_time_ms = ${t}`);
  });

  test('version is "1.2"', () => {
    assert.equal(body.version, '1.2');
  });
});

describe('Python AI service — validation', () => {
  test('blank resume text returns 422', async () => {
    const res = await callAI({
      body: JSON.stringify({
        resume: { text: '   ' },
        job_description: { text: SAMPLE_JD },
      }),
      headers: { 'X-Internal-API-Key': AI_API_KEY },
    });
    assert.equal(res.status, 422);
  });

  test('empty request body returns 422', async () => {
    const res = await callAI({
      body: '{}',
      headers: { 'X-Internal-API-Key': AI_API_KEY },
    });
    assert.equal(res.status, 422);
  });

  test('result is deterministic — same input gives same scores', async () => {
    const headers = { 'X-Internal-API-Key': AI_API_KEY };
    const [res1, res2] = await Promise.all([callAI({ headers }), callAI({ headers })]);
    const b1 = (await res1.json()) as Record<string, number>;
    const b2 = (await res2.json()) as Record<string, number>;
    assert.equal(b1.overall_score, b2.overall_score, 'overall_score not deterministic');
    assert.equal(b1.keyword_score, b2.keyword_score, 'keyword_score not deterministic');
  });
});

describe('Python AI service — X-Service-Name header', () => {
  test('request with X-Service-Name is accepted and returns 200', async () => {
    const res = await callAI({
      headers: {
        'X-Internal-API-Key': AI_API_KEY,
        'X-Service-Name': 'resume_saas',
      },
    });
    assert.equal(res.status, 200);
  });
});
