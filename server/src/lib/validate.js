import { ApiError } from './http.js';
import { ARTICLE_TYPES } from '../config.js';

const isStr = (v) => typeof v === 'string';
const trimmed = (v) => (isStr(v) ? v.trim() : '');
const asBool = (v, fallback = false) => {
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v === 'boolean') return v;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
};
const asNumber = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function slugify(input) {
  return trimmed(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

/** Parse + i-validate ang body ng artikulo. `partial` ay para sa PUT. */
export function parseArticle(body = {}, { partial = false } = {}) {
  const errors = [];
  const out = {};

  const requireString = (key, { max = 400, min = 1 } = {}) => {
    const value = trimmed(body[key]);
    if (!value) {
      if (!partial) errors.push(`Kinakailangan ang "${key}".`);
      return undefined;
    }
    if (value.length < min) errors.push(`Hindi sapat ang haba ng "${key}".`);
    if (value.length > max) errors.push(`Hindi maaaring lumampas sa ${max} na karakter ang "${key}".`);
    return value;
  };

  const optionalString = (key, { max = 400 } = {}) => {
    if (body[key] === undefined) return undefined;
    const value = trimmed(body[key]);
    if (value.length > max) errors.push(`Hindi maaaring lumampas sa ${max} na karakter ang "${key}".`);
    return value;
  };

  if (!partial || body.title !== undefined) out.title = requireString('title', { max: 220 });
  if (!partial || body.body !== undefined) out.body = requireString('body', { max: 20000 });

  if (!partial || body.type !== undefined) {
    const type = trimmed(body.type) || 'news';
    if (!ARTICLE_TYPES.includes(type)) {
      errors.push(`Hindi valid ang "type". Pinapayagan: ${ARTICLE_TYPES.join(', ')}.`);
    } else {
      out.type = type;
    }
  }

  for (const key of ['category', 'deck', 'author_name', 'author_role', 'cover_image_url', 'image_caption', 'column_name', 'pull_quote', 'read_time']) {
    const value = optionalString(key, { max: key === 'deck' || key === 'pull_quote' ? 600 : 300 });
    if (value !== undefined) out[key] = value;
  }

  if (body.is_lead !== undefined) out.is_lead = asBool(body.is_lead);
  if (body.is_published !== undefined) out.is_published = asBool(body.is_published, true);
  if (body.published_at !== undefined) {
    const date = new Date(body.published_at);
    if (Number.isNaN(date.getTime())) errors.push('Hindi valid ang "published_at".');
    else out.published_at = date.toISOString();
  }

  const slugSource = body.slug ?? out.title;
  if (slugSource !== undefined) {
    const slug = slugify(slugSource);
    if (slug) out.slug = slug;
  }

  if (errors.length) throw ApiError.badRequest('Hindi wasto ang ipinadalang artikulo.', errors);
  return out;
}

export function parseTicker(body = {}) {
  const message = trimmed(body.message);
  const errors = [];
  if (!message) errors.push('Kinakailangan ang "message".');
  if (message.length > 280) errors.push('Hindi maaaring lumampas sa 280 na karakter ang mensahe.');
  if (errors.length) throw ApiError.badRequest('Hindi wasto ang ipinadalang mensahe.', errors);
  return { message };
}

export function parseEdition(body = {}, { partial = false } = {}) {
  const errors = [];
  const out = {};

  if (!partial || body.volume !== undefined) {
    const volume = trimmed(body.volume);
    if (!volume && !partial) errors.push('Kinakailangan ang "volume".');
    if (volume) out.volume = volume;
  }
  if (!partial || body.theme !== undefined) {
    const theme = trimmed(body.theme);
    if (!theme && !partial) errors.push('Kinakailangan ang "theme".');
    if (theme) out.theme = theme;
  }

  for (const key of ['title', 'issue', 'description', 'cover_image_url', 'pdf_url']) {
    if (body[key] === undefined) continue;
    const value = trimmed(body[key]);
    if (value.length > 400) errors.push(`Hindi maaaring lumampas sa 400 na karakter ang "${key}".`);
    out[key] = value;
  }

  if (body.pages !== undefined) out.pages = Math.max(1, asNumber(body.pages, 16));
  if (body.year !== undefined) out.year = asNumber(body.year, new Date().getFullYear());
  if (body.published_year !== undefined) out.published_year = asNumber(body.published_year, undefined);

  if (errors.length) throw ApiError.badRequest('Hindi wasto ang ipinadalang edisyon.', errors);
  return out;
}

export function parseQuery(query = {}) {
  const type = trimmed(query.type);
  const category = trimmed(query.category);
  const lead = trimmed(query.lead);

  return {
    type: ARTICLE_TYPES.includes(type) ? type : undefined,
    category: category || undefined,
    is_lead: lead === '' ? undefined : asBool(lead),
    limit: Math.min(Math.max(asNumber(query.limit, 0), 0) || 0, 100),
    q: trimmed(query.q).toLowerCase(),
  };
}