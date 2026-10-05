import { NextResponse } from 'next/server';

// GET /api/proxy-image?url=<encoded-url>
// Proxies an image through the server so the browser receives it as same-origin,
// avoiding cross-origin canvas taint when editing a photo from S3.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url || !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  const upstream = await fetch(url);
  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': contentType, 'cache-control': 'private, max-age=60' },
  });
}
