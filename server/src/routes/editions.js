import { Router } from 'express';
import { asyncHandler, ApiError } from '../lib/http.js';
import { parseEdition } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { store } from '../store.js';

const router = Router();

/** GET /api/editions — digital na archive ng mga PDF. */
router.get(
  '/',
  asyncHandler((_req, res) => {
    const data = store.listEditions();
    res.json({ data, meta: { total: data.length } });
  }),
);

/** POST /api/editions */
router.post(
  '/',
  requireAuth,
  asyncHandler((req, res) => {
    res.status(201).json({ data: store.createEdition(parseEdition(req.body)) });
  }),
);

/** DELETE /api/editions/:id */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler((req, res) => {
    if (!store.deleteEdition(req.params.id)) throw ApiError.notFound('Hindi natagpuan ang edisyon.');
    res.json({ success: true, id: req.params.id });
  }),
);

export default router;