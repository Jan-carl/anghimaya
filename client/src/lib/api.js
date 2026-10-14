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

const fetchJson = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : null;
  } catch {
    return null;
  }
};

export const api = {
  articles: async () => (await fetchJson('/api/articles')) ?? fallback.articles,
  ticker: async () => (await fetchJson('/api/ticker')) ?? fallback.ticker,
  editions: async () => (await fetchJson('/api/editions')) ?? fallback.editions,
};