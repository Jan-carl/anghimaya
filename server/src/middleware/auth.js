import { ApiError } from '../lib/http.js';
import { readBearer, verifyToken } from '../lib/token.js';

/**
 * Protektong route. Tinatanggap ang `Authorization: Bearer <token>`
 * o ang `x-himaya-token` header, at ang `?token=` para sa mga link lamang.
 */
export function requireAuth(req, _res, next) {
  const token =
    readBearer(req) ||
    (typeof req.get('x-himaya-token') === 'string' ? req.get('x-himaya-token').trim() : null) ||
    (typeof req.query?.token === 'string' ? req.query.token.trim() : null);

  const session = token ? verifyToken(token) : null;
  if (!session) return next(ApiError.unauthorized('Ang session ay walang-bisa o nawalan na ng bisa.'));

  req.session = session;
  next();
}