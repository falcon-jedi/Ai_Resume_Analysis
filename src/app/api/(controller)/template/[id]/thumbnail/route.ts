import path from 'path';
import { getTemplate, getTemplateBinary } from '@/app/service/resume/template.service';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const template = getTemplate(decodedId);

    const fileBuffer = await getTemplateBinary(template.thumbnailKey, template.thumbnailPath);
    const ext = path.extname(template.thumbnailPath).toLowerCase();
    const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

    return new Response(
      fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength,
      ) as ArrayBuffer,
      {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
    );
  } catch (err) {
    console.error('[GET /api/template/[id]/thumbnail]', err);
    return new Response('Error loading thumbnail', { status: 500 });
  }
}
