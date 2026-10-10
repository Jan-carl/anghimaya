import crypto from 'node:crypto';
import { config } from '../config.js';

const b64url = (input) => Buffer.from(input).toString('base64url');

function sign(payloadB64) {
  return crypto.createHmac('sha256', config.auth.secret).update(payloadB64).digest('base64url');
}

/**
 * Stateless na session token para sa Tanggapan ng Patnugutan.
 * Format: <base64url payload>.<hmac sha256>
 */
export function issueToken(user, ttlSeconds = config.auth.ttlSeconds) {
  const payload = {
    sub: user.email,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;

  const [payloadB64, signature] = token.split('.');
  const expected = sign(payloadB64);

  const a = Buffer.from(signature ?? '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readBearer(req) {
  const header = req.get('authorization') || req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token.trim() : null;
}