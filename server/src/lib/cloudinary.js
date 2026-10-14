import path from 'node:path';
import { config } from '../config.js';

const status = { available: false, error: null };

let clientPromise = null;

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  return Boolean(cloudName && apiKey && apiSecret);
}

export function cloudinaryStatus() {
  return { configured: isCloudinaryConfigured(), ...status };
}

async function getClient() {
  if (!isCloudinaryConfigured()) return null;
  if (clientPromise) return clientPromise;

  clientPromise = import('cloudinary')
    .then(({ v2 }) => {
      v2.config({
        cloud_name: config.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret,
        secure: true,
      });
      status.available = true;
      status.error = null;
      return v2;
    })
    .catch((err) => {
      status.available = false;
      status.error = err.message;
      console.warn('[cloudinary] Hindi ma-load ang "cloudinary" — lokal na disk storage ang gagamitin.');
      return null;
    });

  return clientPromise;
}

function sanitizeFolder(value) {
  return typeof value === 'string' ? value.replace(/[^a-z0-9-_]/gi, '') : '';
}

/**
 * I-upload ang buffer sa Cloudinary at ibalik ang parehong hugis ng local disk
 * (url / provider / filename / size) para hindi na basahin ang Tanggapan ng Patnugutan.
 */
export async function uploadImage(file, { folder = '' } = {}) {
  const cloudinary = await getClient();
  if (!cloudinary) throw new Error('Hindi available ang Cloudinary sa server.');

  const remotePath = [config.cloudinary.folder, sanitizeFolder(folder)].filter(Boolean);

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: remotePath,
        resource_type: 'image',
        unique_filename: true,
        overwrite: false,
      },
      (err, res) => (err ? reject(err) : resolve(res)),
    );
    stream.end(file.buffer);
  });

  return {
    url: result.secure_url,
    provider: 'cloudinary',
    filename: `${path.basename(result.public_id)}.${result.format}`,
    size: result.bytes ?? file.size,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}