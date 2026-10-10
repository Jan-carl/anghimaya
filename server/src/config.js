import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, '..');
const repoRoot = path.resolve(serverRoot, '..');

const int = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: int(process.env.PORT, 5000),
  host: process.env.HOST || '0.0.0.0',

  // Prefix ng lahat ng API routes.
  apiPrefix: '/api',

  // Origin ng Vite dev server (para sa CORS) — comma-separated list.
  clientOrigins: (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // Absolute base URL na ginagamit sa mga URL na ibinibigay ng API (hal. uploads).
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${int(process.env.PORT, 5000)}`).replace(/\/+$/, ''),

  paths: {
    serverRoot,
    repoRoot,
    data: path.join(serverRoot, 'data'),
    store: path.join(serverRoot, 'data', 'store.json'),
    uploads: path.resolve(process.env.UPLOAD_DIR || path.join(serverRoot, 'uploads')),
    clientDist: path.resolve(process.env.CLIENT_DIST || path.join(repoRoot, 'client', 'dist')),
  },

  uploads: {
    maxBytes: int(process.env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024),
    allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  },

  auth: {
    // Passcode ng Tanggapan ng Patnugutan (portal.html).
    passcode: process.env.PORTAL_PASSCODE || process.env.PORTAL_PASSWORD || 'himaya2026',
    emails: (process.env.PORTAL_EMAILS || process.env.PORTAL_EMAIL || 'puplopezanghimaya@gmail.com')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
    secret: process.env.PORTAL_SECRET || 'ang-himaya-dev-secret',
    ttlSeconds: int(process.env.PORTAL_TOKEN_TTL, 60 * 60 * 12),
  },
};

export const ARTICLE_TYPES = ['news', 'column', 'editorial', 'feature', 'literary'];