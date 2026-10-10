import { Router } from 'express';
import { asyncHandler, ApiError } from '../lib/http.js';
import { parseArticle, parseQuery } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { store } from '../store.js';

const router = Router();

/** GET /api/articles?type=&category=&lead=&limit=&q= */
router.get(
  '/',
  asyncHandler((req, res) => {
    const filter = parseQuery(req.query);
    const data = store.listArticles(filter);

    res.json({
      data,
      meta: { total: data.length, filters: filter },
    });
  }),
);

/** GET /api/articles/:idOrSlug */
router.get(
  '/:id',
  asyncHandler((req, res) => {
    const article = store.getArticle(req.params.id);
    if (!article) throw ApiError.notFound('Hindi natagpuan ang artikulong ihinahanap.');
    res.json({ data: article });
  }),
);

/** POST /api/articles */
router.post(
  '/',
  requireAuth,
  asyncHandler((req, res) => {
    res.status(201).json({ data: store.createArticle(parseArticle(req.body)) });
  }),
);

/** PUT /api/articles/:id */
router.put(
  '/:id',
  requireAuth,
  asyncHandler((req, res) => {
    const patch = parseArticle(req.body, { partial: true });
    if (!Object.keys(patch).length) throw ApiError.badRequest('Walang binagong field na ipinadala.');

    const article = store.updateArticle(req.params.id, patch);
    if (!article) throw ApiError.notFound('Hindi natagpuan ang artikulong ihinahanap.');

    res.json({ data: article });
  }),
);

/** DELETE /api/articles/:id */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler((req, res) => {
    if (!store.deleteArticle(req.params.id)) {
      throw ApiError.notFound('Hindi natagpuan ang artikulong ihinahanap.');
    }
    res.json({ success: true, id: req.params.id });
  }),
);

export default router;