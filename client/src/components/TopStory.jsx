import { useState } from 'react';
import { Reveal } from './Reveal.jsx';
import { EmptyState, SectionHead } from './ui.jsx';
import { excerpt, initials, tagalogMonthYear } from '../lib/format.js';

/**
 * TopStory Component:
 * Authentic Broadsheet Front Page (Pangunahing Balita):
 * 1. Grand Headline Banner Lead Story (Weather Advisory Heat Index)
 * 2. Balanced 3-Column Uniform Broadsheet Grid with matching 16px/12px rounded corners
 * 3. "Lahat ng Balita" expands to show all current and future uploaded articles
 */
export function TopStory({ lead, news = [], onSelectArticle }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out self-referential about card from default news roll
  const campusNews = news.filter((a) => a.id !== 'about-ang-himaya-publication');
  const displayNews = campusNews.length > 0 ? campusNews : news;
  const visibleNews = isExpanded ? displayNews : displayNews.slice(0, 3);

  const toggleExpand = (e) => {
    e?.preventDefault();
    setIsExpanded((prev) => !prev);
  };

  return (
    <section className="section" id="top-story">
      <div className="container">
        <Reveal>
          <SectionHead
            eyebrow="BALITA"
            title="PANGUNAHING BALITA"
            action={
              <button
                type="button"
                className="premium-see-all btn-link"
                onClick={toggleExpand}
                aria-expanded={isExpanded}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {isExpanded ? 'Ipakita ang mas kaunti' : 'Lahat ng Balita'}{' '}
                <span aria-hidden="true">{isExpanded ? '↑' : '→'}</span>
              </button>
            }
          />
        </Reveal>

        {/* GRAND HEADLINE BANNER LEAD STORY (BROADSHEET HERO) */}
        {lead ? (
          <Reveal as="article" className="tfm-lead-broadsheet">
            <div className="tfm-lead-broadsheet__inner">
              {/* LEFT: EDITORIAL COPY & HEADLINE */}
              <div className="tfm-lead-broadsheet__content">
                <div className="tfm-meta">
                  <span className="tfm-category tfm-category--alert">
                    {lead.category || 'PANGUNAHING BALITA'}
                  </span>
                  <span className="tfm-meta__dot">·</span>
                  <span className="tfm-meta__time">
                    {tagalogMonthYear(lead.published_at)} · {lead.read_time || '2 min pagbasa'}
                  </span>
                </div>

                <h2 className="tfm-lead-broadsheet__headline">
                  <a
                    href="#top-story"
                    className="premium-underline"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle?.(lead);
                    }}
                  >
                    {lead.title}
                  </a>
                </h2>

                {lead.deck ? (
                  <p className="tfm-lead-broadsheet__deck">{lead.deck}</p>
                ) : null}

                <p className="tfm-lead-broadsheet__excerpt">
                  {excerpt(lead.body, 190)}
                </p>

                <div className="tfm-lead-broadsheet__footer">
                  <div className="byline">
                    <span className="avatar">{initials(lead.author_name)}</span>
                    <div>
                      <div className="byline__name">{lead.author_name}</div>
                      <div className="byline__role">{lead.author_role || 'Mga Tagapag-ulat ng Ang Himaya'}</div>
                    </div>
                  </div>

                  <a
                    href="#top-story"
                    className="btn btn--maroon btn--sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle?.(lead);
                    }}
                  >
                    Basahin ang buong ulat <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>

              {/* RIGHT: OFFICIAL ADVISORY MEDIA */}
              {lead.cover_image_url ? (
                <div className="tfm-lead-broadsheet__media-wrap">
                  <div
                    className="tfm-lead-broadsheet__media card-zoom"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectArticle?.(lead)}
                  >
                    <img
                      src={lead.cover_image_url}
                      alt={lead.title}
                      className="card-zoom-img"
                    />
                    <span className="tfm-lead-broadsheet__tag">PANGUNAHING ULAT</span>
                  </div>
                  {lead.image_caption ? (
                    <p className="tfm-lead-broadsheet__caption">{lead.image_caption}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Reveal>
        ) : (
          <EmptyState title="Wala pang pangunahing ulat." />
        )}

        {/* SECONDARY CAMPUS STORIES (BALANCED BROADSHEET GRID) */}
        {displayNews.length > 0 ? (
          <div className="tfm-news-broadsheet-wrap">
            <div className="tfm-news-broadsheet-header">
              <span className="tfm-news-broadsheet-eyebrow">
                {isExpanded
                  ? `LAHAT NG BALITA SA KAMPUS (${displayNews.length} NA ULAT)`
                  : 'KAGANAPAN NGAYON SA KAMPUS'}
              </span>
              <span className="tfm-news-broadsheet-rule" aria-hidden="true" />
            </div>

            <div className="tfm-news-broadsheet-grid">
              {visibleNews.map((article, idx) => (
                <Reveal
                  as="article"
                  className="tfm-broadsheet-card"
                  key={article.id}
                  delay={idx * 60}
                >
                  {article.cover_image_url ? (
                    <div
                      className="card-zoom tfm-broadsheet-card__img-wrap"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectArticle?.(article)}
                    >
                      <img
                        src={article.cover_image_url}
                        alt=""
                        className="card-zoom-img"
                      />
                    </div>
                  ) : null}

                  <div className="tfm-broadsheet-card__body">
                    <div className="tfm-meta">
                      <span className="tfm-category">{article.category || 'BALITA'}</span>
                      <span className="tfm-meta__dot">·</span>
                      <span className="tfm-meta__time">{article.read_time || '2 min pagbasa'}</span>
                    </div>

                    <h3 className="tfm-broadsheet-card__title">
                      <a
                        href="#top-story"
                        className="premium-underline"
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectArticle?.(article);
                        }}
                      >
                        {article.title}
                      </a>
                    </h3>

                    <p className="tfm-broadsheet-card__excerpt">
                      {excerpt(article.deck || article.body, 115)}
                    </p>

                    <div className="tfm-broadsheet-card__footer">
                      <span className="tfm-author">
                        {article.author_name?.includes(' at ') ? 'Nina ' : 'Ni '}
                        {article.author_name}
                      </span>
                      <a
                        href="#top-story"
                        className="tfm-read-more"
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectArticle?.(article);
                        }}
                      >
                        Basahin pa <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* EXPAND TOGGLE BAR (Kapag marami o may future uploads) */}
            {displayNews.length > 3 ? (
              <div className="tfm-news-expand-bar">
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={toggleExpand}
                >
                  {isExpanded
                    ? 'Itago ang Ibang Balita ↑'
                    : `Ipakita ang Lahat ng Balita (${displayNews.length}) →`}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default TopStory;