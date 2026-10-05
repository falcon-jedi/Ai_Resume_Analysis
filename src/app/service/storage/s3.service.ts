import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';
import { PhotoMimeType } from '@/app/api/model/enums/upload';
import type { PresignedUrlRequestDTO } from '@/app/api/model/request/upload';
import type { PresignedUrlResponseDTO, PresignedPhotoUrl } from '@/app/api/model/response/upload';

export { PhotoMimeType };
export type { PresignedUrlRequestDTO, PresignedUrlResponseDTO, PresignedPhotoUrl };

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;
const PUBLIC_URL = process.env.AWS_S3_PUBLIC_URL!;

const EXT_MAP: Record<string, string> = {
  [PhotoMimeType.JPEG]: 'jpg',
  [PhotoMimeType.PNG]: 'png',
  [PhotoMimeType.WEBP]: 'webp',
};

/**
 * Returns a 5-minute pre-signed PUT URL for uploading a resume profile photo.
 * Key: resume_picture/{resumeId}/avatar.{ext} — always overwrites the previous photo.
 */
export async function getResumePhotoPresignedUrl(
  resumeId: string,
  contentType: PhotoMimeType | string,
): Promise<PresignedPhotoUrl> {
  const ext = EXT_MAP[contentType] ?? 'jpg';
  const key = `resume_picture/${resumeId}/avatar.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60 s — browser PUT starts immediately
  const publicUrl = `${PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl };
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC S3 HELPERS — used by template seed and server-side template fetching
// ─────────────────────────────────────────────────────────────────────────────

/** Upload a buffer or string to S3 with a given content-type. */
export async function putObject(
  key: string,
  body: Buffer | string,
  contentType: string,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/** Download an S3 object and return its full content as a Buffer. */
export async function getObject(key: string): Promise<Buffer> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const stream = res.Body as Readable;
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/** Returns true if the key exists in S3 (HeadObject). */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Lists all object keys under a prefix (handles pagination).
 * ponytail: single page (1000 objects max); upgrade path is to loop on ContinuationToken.
 */
export async function listObjects(prefix: string): Promise<string[]> {
  const res = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }));
  return (res.Contents ?? []).map((obj) => obj.Key!).filter(Boolean);
}
