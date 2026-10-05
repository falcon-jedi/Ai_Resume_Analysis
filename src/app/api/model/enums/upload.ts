// Accepted MIME types for resume profile photo uploads
export enum PhotoMimeType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
  GIF = 'image/gif',
  BMP = 'image/bmp',
  TIFF = 'image/tiff',
  HEIC = 'image/heic',
  HEIF = 'image/heif',
}

export const ACCEPTED_PHOTO_TYPES = Object.values(PhotoMimeType);

// 10 MB — enforced client-side before S3 pre-sign
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;

// MIME types we can pass directly to the S3 pre-signed PUT.
// HEIC/HEIF/BMP/TIFF are converted to JPEG by the canvas editor before upload.
export const S3_UPLOADABLE_TYPES: PhotoMimeType[] = [
  PhotoMimeType.JPEG,
  PhotoMimeType.PNG,
  PhotoMimeType.WEBP,
];
