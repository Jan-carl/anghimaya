import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, '..');
const repoRoot = path.resolve(serverRoot, '..');

dotenv.config({ path: path.join(serverRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env') });

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
  clientOrigins: (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174')
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
    portalDist: path.resolve(process.env.PORTAL_DIST || path.join(repoRoot, 'portal', 'dist')),
  },

  uploads: {
    maxBytes: int(process.env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024),
    allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    // Kapag naka-set ang Cloudinary, dito napupunta ang upload. Kapag wala, lokal na disk.
    provider: process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local',
  },

  // Lahat ng key ay server-side lamang — huwag ilagay ang mga ito sa client/ o portal/.
  supabase: {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey:
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '',
    // Service-role key: lumalaktaw sa RLS ng schema.sql. Kung wala, gagamitin ang anonKey.
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '',
    schema: process.env.SUPABASE_SCHEMA || 'public',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'ang-himaya',
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