import { Reveal } from './Reveal.jsx';
import { EmptyState, SectionHead } from './ui.jsx';
import { excerpt, tagalogMonthYear } from '../lib/format.js';

/**
 * Kolum at Opinyon: Hango sa modernong "COLUMN" at "COMMENTARY" grids ng The Frontman.
 * - Oxford Header ("KOLUM AT OPINYON" na may see-all link at oxford double rule)
 * - Spotlight Editorial Card: Opisyal na tindig ng Lupon ng Patnugutan
 * - 3-Column Modern Grid: Bawat kolum ay may cover image (card-zoom), category pill,
 *   bold title na may premium underline, excerpt, at "Basahin pa.. →"
 */
export function Voices({ editorial, columns = [], feature, onSelectArticle }) {
  return (
    <section className="section" id="voices">
      <div className="container">
        <Reveal>
          <SectionHead
            eyebrow="TINIG AT PANININDIGAN"
            title="KOLUM AT OPINYON"
            seeAllHref="#voices"
            seeAllLabel="LAHAT NG KOLUM"
          />
        </Reveal>

        {/* OPISYAL NA EDITORYAL SPOTLIGHT (Editorial Stance ng thefrontman.ph) */}
        {editorial ? (
          <Reveal as="article" className="tfm-editorial-spotlight">
            <div className="tfm-editorial-spotlight__banner">
              {editorial.cover_image_url ? (
                <div
                  className="card-zoom tfm-editorial-spotlight__img-wrap"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectArticle?.(editorial)}
                >
                  <img src={editorial.cover_image_url} alt="" className="card-zoom-img" />
                </div>
              ) : null}

              <div className="tfm-editorial-spotlight__content">
                <div className="tfm-meta">
                  <span className="tfm-category tfm-category--gold">EDITORYAL</span>
                  <span className="tfm-meta__dot">·</span>
                  <span className="tfm-meta__time">
                    {tagalogMonthYear(editorial.published_at)} · {editorial.read_time}
                  </span>
                </div>

                <h3 className="tfm-editorial-spotlight__title">
                  <a
                    href="#voices"
                    className="premium-underline"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle?.(editorial);
                    }}
                  >
                    {editorial.title}
                  </a>
                </h3>

                {editorial.pull_quote ? (
                  <blockquote className="tfm-editorial-spotlight__quote">
                    “{editorial.pull_quote}”
                  </blockquote>
                ) : null}

                <p className="tfm-card__excerpt">{excerpt(editorial.body, 220)}</p>

                <div className="tfm-editorial-spotlight__foot">
                  <div className="tfm-editorial-seal">
                    <img src="/anghimayalogo.png" alt="" />
                    <div>
                      <strong>{editorial.author_name || 'Lupon ng Patnugutan'}</strong>
                      <span>Tanggapan ng Patnugutan</span>
                    </div>
                  </div>

                  <a
                    href="#voices"
                    className="btn btn--gold btn--sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle?.(editorial);
                    }}
                  >
                    Basahin ang buong tindig <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        ) : null}

        {/* 3-COLUMN UNIFORM GRID (Kung may karagdagang kolum o lathalain) */}
        {columns.length > 0 || feature ? (
          <div className="tfm-grid-3">
            {columns.map((column, idx) => (
              <Reveal as="article" className="tfm-card tfm-grid-card" key={column.id} delay={idx * 70}>
                {column.cover_image_url ? (
                  <div
                    className="card-zoom tfm-grid-card__img-wrap"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectArticle?.(column)}
                  >
                    <img src={column.cover_image_url} alt="" className="card-zoom-img" />
                    {column.column_name ? (
                      <span className="tfm-card__column-badge">{column.column_name}</span>
                    ) : null}
                  </div>
                ) : null}

                <div className="tfm-card__body">
                  <div className="tfm-meta">
                    <span className="tfm-category">KOLUM</span>
                    <span className="tfm-meta__dot">·</span>
                    <span className="tfm-meta__time">{column.read_time}</span>
                  </div>

                  <h3 className="tfm-card__title">
                    <a
                      href="#voices"
                      className="premium-underline"
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectArticle?.(column);
                      }}
                    >
                      {column.title}
                    </a>
                  </h3>

                  <p className="tfm-card__excerpt">{excerpt(column.deck || column.body, 120)}</p>

                  <div className="tfm-card__footer">
                    <div className="tfm-author-col">
                      <span className="tfm-author">Ni {column.author_name}</span>
                      <span className="tfm-author__role">{column.author_role}</span>
                    </div>
                    <a
                      href="#voices"
                      className="tfm-read-more"
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectArticle?.(column);
                      }}
                    >
                      Basahin pa <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}

          {/* LATHALAIN CARD (Kung may feature article) */}
          {feature ? (
            <Reveal as="article" className="tfm-card tfm-grid-card tfm-grid-card--feature" delay={columns.length * 70}>
              {feature.cover_image_url ? (
                <div
                  className="card-zoom tfm-grid-card__img-wrap"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectArticle?.(feature)}
                >
                  <img src={feature.cover_image_url} alt="" className="card-zoom-img" />
                  <span className="tfm-card__column-badge">LATHALAIN</span>
                </div>
              ) : null}

              <div className="tfm-card__body">
                <div className="tfm-meta">
                  <span className="tfm-category tfm-category--gold">TAMPOK NA LATHALAIN</span>
                  <span className="tfm-meta__dot">·</span>
                  <span className="tfm-meta__time">{feature.read_time}</span>
                </div>

                <h3 className="tfm-card__title">
                  <a
                    href="#voices"
                    className="premium-underline"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle?.(feature);
                    }}
                  >
                    {feature.title}
                  </a>
                </h3>

                <p className="tfm-card__excerpt">{excerpt(feature.deck || feature.body, 120)}</p>

                <div className="tfm-card__footer">
                  <div className="tfm-author-col">
                    <span className="tfm-author">Ni {feature.author_name}</span>
                    <span className="tfm-author__role">{feature.author_role}</span>
                  </div>
                  <a
                    href="#voices"
                    className="tfm-read-more"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle?.(feature);
                    }}
                  >
                    Basahin pa <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      ) : null}
    </div>
    </section>
  );
}

export default Voices;