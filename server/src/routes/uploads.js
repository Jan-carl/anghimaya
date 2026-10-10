import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { Router } from 'express';
import multer from 'multer';
import { config } from '../config.js';
import { asyncHandler, ApiError } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(config.paths.uploads, { recursive: true });
    cb(null, config.paths.uploads);
  },
  filename: (_req, file, cb) => {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const id = crypto.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10);
    cb(null, `${stamp}-${id}${EXTENSIONS[file.mimetype] || path.extname(file.originalname) || '.bin'}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.uploads.maxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!config.uploads.allowedMime.includes(file.mimetype)) {
      cb(ApiError.badRequest('Hindi suportado ang uri ng file. Gamitin ang JPG, PNG, WEBP, GIF, o AVIF.'));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /api/upload — multipart/form-data, field: "image".
 * Returns { url, provider: 'local', filename, size }
 */
router.post(
  '/',
  requireAuth,
  upload.single('image'),
  asyncHandler((req, res) => {
    if (!req.file) throw ApiError.badRequest('Walang nakikitang file. Magpadala ng field na "image".');

    const folder = typeof req.body?.folder === 'string' ? req.body.folder.replace(/[^a-z0-9-_]/gi, '') : '';
    const relative = `${folder ? `${folder}/` : ''}${req.file.filename}`;
    const diskPath = path.join(config.paths.uploads, folder, req.file.filename);

    // Ilipat sa sub-folder kapag may ibinigay na "folder".
    if (folder) {
      fs.mkdirSync(path.dirname(diskPath), { recursive: true });
      fs.renameSync(req.file.path, diskPath);
    }

    res.status(201).json({
      url: `${config.publicUrl}/uploads/${relative}`,
      provider: 'local',
      filename: req.file.filename,
      size: req.file.size,
    });
  }),
);

export default router;