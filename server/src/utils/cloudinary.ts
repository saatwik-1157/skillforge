/**
 * Cloudinary upload helper for user media (avatars, resource thumbnails, PDFs).
 * Accepts a Buffer (from multer memoryStorage) and streams it to Cloudinary.
 */
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { ApiError } from './ApiError';

const configured = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY);

if (configured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export function uploadBuffer(buffer: Buffer, folder = 'skillforge'): Promise<string> {
  if (!configured) throw ApiError.badRequest('File storage is not configured');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
