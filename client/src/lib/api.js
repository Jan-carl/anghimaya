export const fallback = {
  articles: [],
  ticker: [],
  editions: [],
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