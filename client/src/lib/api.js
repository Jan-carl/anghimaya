import seed from '../data/seed.json';

/**
 * 100% Static Demo Client para sa Ang Himaya:
 * Ganap na tinanggal ang koneksyon sa backend alinsunod sa kahilingan ng user.
 * Direktang nagbabasa mula sa seed.json upang maging Vercel-ready nang walang
 * server dependency, mabagal na timeout, o network failures.
 */
export const fallback = {
  articles: seed.articles ?? [],
  ticker: seed.ticker_alerts ?? [],
  editions: seed.editions ?? [],
};

export const api = {
  articles: async () => fallback.articles,
  ticker: async () => fallback.ticker,
  editions: async () => fallback.editions,
};