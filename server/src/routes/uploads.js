import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { Router } from 'express';
import multer from 'multer';
import { config } from '../config.js';
import { asyncHandler, ApiError } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';
import { isCloudinaryConfigured, uploadImage } from '../lib/cloudinary.js';

const router = Router();

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const useCloudinary = isCloudinaryConfigured();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.uploads.maxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!config.uploads.allowedMime.includes(file.mimetype)) {
      cb(ApiError.badRequest('Hindi suportado ang uri ng file. Gamitin ang JPG, PNG, WEBP, GIF, o AVIF.'));
      return;
    }
    cb(null, true);
  },
});

function buildFilename(file) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const id = crypto.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10);
  return `${stamp}-${id}${EXTENSIONS[file.mimetype] || path.extname(file.originalname) || '.bin'}`;
}

function saveToDisk(file, folder) {
  const filename = buildFilename(file);
  const target = path.join(config.paths.uploads, folder, filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, file.buffer);

  return {
    url: `${config.publicUrl}/uploads/${folder ? `${folder}/` : ''}${filename}`,
    provider: 'local',
    filename,
    size: file.size,
  };
}

/**
 * POST /api/upload — multipart/form-data, field: "image".
 * Cloudinary kapag naka-set ang CLOUDINARY_*; lokal na disk kung wala o kung nabigo.
 * Returns { url, provider: 'cloudinary' | 'local', filename, size }
 */
router.post(
  '/',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('Walang nakikitang file. Magpadala ng field na "image".');

    const folder = typeof req.body?.folder === 'string' ? req.body.folder.replace(/[^a-z0-9-_]/gi, '') : '';

    if (useCloudinary) {
      try {
        const uploaded = await uploadImage(req.file, { folder });
        return res.status(201).json(uploaded);
      } catch (err) {
        console.error('[upload] nabigo ang Cloudinary — lilipat sa lokal na disk:', err.message);
      }
    }

    return res.status(201).json(saveToDisk(req.file, folder));
  }),
);

export default router;