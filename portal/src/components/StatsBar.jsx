import { Reveal } from './Reveal.jsx';

export function StatsBar({ articles = [], ticker = [], editions = [] }) {
  const newsCount = articles.filter((a) => a.type === 'news').length;
  const columnCount = articles.filter((a) => a.type === 'column').length;
  const literaryCount = articles.filter((a) => a.type === 'literary').length;
  const leadStory = articles.find((a) => a.is_lead);

  return (
    <section className="portal-stats-grid" aria-label="Pangkalahatang Estadistika">
      <Reveal className="stat-card" delay={0}>
        <span className="stat-card__label">Kabuuang Artikulo</span>
        <div className="stat-card__value-row">
          <span className="stat-card__value">{articles.length}</span>
        </div>
        <span className="stat-card__sub">
          {newsCount} balita · {columnCount} kolum · {literaryCount} panitikan
        </span>
      </Reveal>

      <Reveal className="stat-card stat-card--lead" delay={70}>
        <span className="stat-card__label">Lead Spotlight</span>
        <div className="stat-card__value-row">
          <span className={`chip chip--sm ${leadStory ? 'chip--lead' : ''}`}>
            {leadStory ? '★ Naitakda' : 'Wala pa'}
          </span>
        </div>
        <span
          className="stat-card__sub stat-card__sub--truncate"
          title={leadStory?.title || 'Walang napiling lead story'}
        >
          {leadStory?.title || 'Pumili ng lead story sa talaan'}
        </span>
      </Reveal>

      <Reveal className="stat-card" delay={140}>
        <span className="stat-card__label">Kagyat na Ulat (Ticker)</span>
        <div className="stat-card__value-row">
          <span className="stat-card__value">{ticker.length}</span>
        </div>
        <span className="stat-card__sub">
          {ticker.length > 0 ? `${ticker.length} aktibong alert sa site` : 'Walang aktibong alert'}
        </span>
      </Reveal>

      <Reveal className="stat-card" delay={210}>
        <span className="stat-card__label">Digital Edisyon</span>
        <div className="stat-card__value-row">
          <span className="stat-card__value">{editions.length}</span>
        </div>
        <span className="stat-card__sub">Mga na-archive na PDF</span>
      </Reveal>
    </section>
  );
}

export default StatsBar;