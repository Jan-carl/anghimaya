import fs from 'node:fs';
import { Router } from 'express';
import articles from './articles.js';
import ticker from './ticker.js';
import editions from './editions.js';
import uploads from './uploads.js';
import auth from './auth.js';
import { config } from '../config.js';
import { store, syncStatus, syncNow } from '../store.js';
import { asyncHandler } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';
import { isCloudinaryConfigured, cloudinaryStatus } from '../lib/cloudinary.js';

const router = Router();

/**
 * GET /api/health
 * Compatible sa portal.html: `database` at `cloudinary` ay nananatiling present.
 */
router.get('/health', (_req, res) => {
  const supabase = syncStatus();

  res.json({
    status: 'ok',
    service: 'himaya-api',
    version: '2.0.0',
    database: supabase.connected ? 'supabase' : 'local_store',
    cloudinary: isCloudinaryConfigured(),
    store: {
      articles: store.listArticles().length,
      ticker: store.listTicker().length,
      editions: store.listEditions().length,
    },
    providers: {
      database: supabase.connected ? 'supabase' : 'local_store',
      uploads: isCloudinaryConfigured() ? 'cloudinary' : 'local',
      supabase,
      cloudinary: cloudinaryStatus(),
    },
    uploadsReady: fs.existsSync(config.paths.uploads),
    uptime: Math.round(process.uptime()),
  });
});

/** POST /api/health/sync — pinipilit ang pag-sunod ng lokal na store papunta sa Supabase. */
router.post(
  '/health/sync',
  requireAuth,
  asyncHandler(async (_req, res) => {
    await syncNow();
    res.json({ success: true, supabase: syncStatus() });
  }),
);

router.use('/auth', auth);
router.use('/articles', articles);
router.use('/ticker', ticker);
router.use('/editions', editions);
router.use('/upload', uploads);

export default router;