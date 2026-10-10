import { useEffect, useMemo, useState } from 'react';
import { api, fallback } from '../lib/api.js';
import { byNewest } from '../lib/format.js';

/**
 * Kinukuha ang lahat ng nilalaman mula sa API at nagsasara ng fallback
 * sa seed data. Ang unang paint ay may laman na agad — walang blink na
 * "walang laman" habang naghihintay ng network.
 */
export function useContent() {
  const [state, setState] = useState(() => ({
    articles: [...fallback.articles].sort(byNewest),
    ticker: fallback.ticker,
    editions: fallback.editions,
    status: 'ready',
    live: false,
  }));

  useEffect(() => {
    let alive = true;

    (async () => {
      const [articles, ticker, editions] = await Promise.all([
        api.articles().catch(() => null),
        api.ticker().catch(() => null),
        api.editions().catch(() => null),
      ]);

      if (!alive) return;

      setState((current) => ({
        articles: [...(articles ?? current.articles)].sort(byNewest),
        ticker: ticker ?? current.ticker,
        editions: editions ?? current.editions,
        status: 'ready',
        live: articles !== null,
      }));
    })();

    return () => {
      alive = false;
    };
  }, []);

  return useMemo(() => groupContent(state), [state]);
}

/** Hahatiin ang mga artikulo ayon sa kailangan ng bawat seksyon. */
function groupContent(state) {
  const { articles } = state;

  const lead = articles.find((a) => a.is_lead) ?? articles.find((a) => a.type === 'news');
  const news = articles.filter((a) => a.type === 'news' && a.id !== lead?.id);
  const columns = articles.filter((a) => a.type === 'column');
  const editorial = articles.find((a) => a.type === 'editorial');
  const feature = articles.find((a) => a.type === 'feature');
  const literary = articles.filter((a) => a.type === 'literary');

  return {
    ...state,
    lead,
    news,
    columns,
    editorial,
    feature,
    literary: {
      spotlight: literary[0],
      rest: literary.slice(1),
    },
  };
}