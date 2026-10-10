/**
 * Maliit na HTTP helpers: uniform na error shape + async wrapper para sa Express 5+.
 */

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    if (details) this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Kailangan ng wastong token upang magpatuloy.') {
    return new ApiError(401, message);
  }

  static notFound(message = 'Hindi natagpuan ang hiniling na talaan.') {
    return new ApiError(404, message);
  }
}

/** Wrap sa Express handler para ma-catch ang rejections bilang middleware errors. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export function sendData(res, data, meta) {
  return res.json(meta ? { data, meta } : { data });
}

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Hindi natagpuan ang ruta: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars -- kinakailangan ng Express ang 4-arg signature.
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const payload = {
    error: status === 500 ? 'May naganap na hindi inaasahang error sa server.' : err.message,
  };

  if (err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    console.error('[api] error:', err);
    payload.debug = err.message;
  }

  // Multer errors (hal. MALTER_INVALID_FIELD_SIZE) ay may sariling code.
  if (err.code === 'LIMIT_FILE_SIZE') {
    payload.error = 'Sobrang laki ng file. Ang limitasyon ay 5 MB.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    payload.error = 'Hindi inaasahan ang field na ito. Gumamit ng "image".';
  }

  res.status(status).json(payload);
}