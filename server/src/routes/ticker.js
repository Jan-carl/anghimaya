import { Router } from 'express';
import { asyncHandler, ApiError } from '../lib/http.js';
import { parseTicker } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { store } from '../store.js';

const router = Router();

/** GET /api/ticker — mga aktibong kagyat na ulat. */
router.get(
  '/',
  asyncHandler((_req, res) => {
    const data = store.listTicker();
    res.json({ data, meta: { total: data.length } });
  }),
);

/** POST /api/ticker */
router.post(
  '/',
  requireAuth,
  asyncHandler((req, res) => {
    const { message } = parseTicker(req.body);
    res.status(201).json({ data: store.createTicker(message) });
  }),
);

/** DELETE /api/ticker/:id */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler((req, res) => {
    if (!store.deleteTicker(req.params.id)) throw ApiError.notFound('Hindi natagpuan ang alert.');
    res.json({ success: true, id: req.params.id });
  }),
);

export default router;