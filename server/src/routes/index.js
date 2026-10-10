import fs from 'node:fs';
import { Router } from 'express';
import articles from './articles.js';
import ticker from './ticker.js';
import editions from './editions.js';
import uploads from './uploads.js';
import auth from './auth.js';
import { config } from '../config.js';
import { store } from '../store.js';

const router = Router();

/**
 * GET /api/health
 * Compatible sa portal.html: `database` at `cloudinary` ay nananatiling present.
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'himaya-api',
    version: '2.0.0',
    database: 'local_store',
    cloudinary: false,
    store: {
      articles: store.listArticles().length,
      ticker: store.listTicker().length,
      editions: store.listEditions().length,
    },
    uploadsReady: fs.existsSync(config.paths.uploads),
    uptime: Math.round(process.uptime()),
  });
});

router.use('/auth', auth);
router.use('/articles', articles);
router.use('/ticker', ticker);
router.use('/editions', editions);
router.use('/upload', uploads);

export default router;