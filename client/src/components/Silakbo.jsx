import { Reveal } from './Reveal.jsx';
import { EmptyState, SectionHead } from './ui.jsx';
import { excerpt } from '../lib/format.js';

/**
 * Silakbo (Panitikan) Section: Hango sa LiterarySection ng thefrontman.ph:
 * - Oxford Header ("SINING AT AKDA" / "SILAKBO: PANITIKAN" may see-all at oxford double rule)
 * - Spotlight Card sa kaliwa (58%): Malaking larawan (card-zoom), floating meta capsule,
 *   bold title, excerpt ng tula/prosa, at "Basahin ang akda →"
 * - Vertical Stack sa kanan (42%): Mga siksik na horizontal cards na may thumbnail,
 *   kategorya, pamagat, excerpt, at may-akda
 */
export function Silakbo({ spotlight, rest = [], onSelectArticle }) {
  return (
    <section className="section" id="silakbo">
      <div className="container">
        <Reveal>
          <SectionHead
            eyebrow="SINING AT AKDA"
            title="SILAKBO: PANITIKAN"
            seeAllHref="#silakbo"
            seeAllLabel="LAHAT NG AKDA"
          />
        </Reveal>

        {!spotlight ? (
          <EmptyState title="Wala pang akda sa Silakbo." />
        ) : (
          <div className="tfm-literary-grid">
            {/* KALIWA: MALAKING SPOTLIGHT CARD */}
            <Reveal as="article" className="tfm-card tfm-spotlight-card">
              {spotlight.cover_image_url ? (
                <div
                  className="card-zoom tfm-spotlight-card__img-wrap"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectArticle?.(spotlight)}
                >
                  <img src={spotlight.cover_image_url} alt="" className="card-zoom-img" />
                  <div className="tfm-floating-capsule">
                    <span className="tfm-floating-category">SILAKBO</span>
                    <span className="tfm-floating-dot" />
                    <span className="tfm-floating-time">{spotlight.read_time || '3 min pagbasa'}</span>
                  </div>
                </div>
              ) : null}

              <div className="tfm-card__body tfm-spotlight-card__body">
                <h3 className="tfm-spotlight-card__title">
                  <a
                    href="#silakbo"
                    className="premium-underline"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle?.(spotlight);
                    }}
                  >
                    {spotlight.title}
                  </a>
                </h3>

                {spotlight.deck ? (
                  <p className="tfm-spotlight-card__deck">{spotlight.deck}</p>
                ) : null}

                <div className="tfm-spotlight-card__verse">
                  {spotlight.body.split('\n\n').slice(0, 2).map((stanza, i) => (
                    <p key={i}>{stanza}</p>
                  ))}
                </div>

                <div className="tfm-spotlight-card__footer">
                  <div className="tfm-author-col">
                    <span className="tfm-author">Akda ni <strong>{spotlight.author_name}</strong></span>
                    <span className="tfm-author__role">{spotlight.author_role}</span>
                  </div>

                  <a
                    href="#silakbo"
                    className="btn btn--maroon btn--sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle?.(spotlight);
                    }}
                  >
                    Basahin ang akda <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* KANAN: STACK NG MGA MALIKHAING AKDA */}
            <div className="tfm-literary-stack">
              {rest.length === 0 ? (
                <Reveal as="article" className="tfm-card tfm-stack-card">
                  <div className="tfm-card__body">
                    <h4 className="tfm-card__title">Karagdagang Akda</h4>
                    <p className="tfm-card__excerpt">
                      Bukas ang pahina ng Silakbo para sa lahat ng mag-aaral ng PUP Lopez.
                    </p>
                  </div>
                </Reveal>
              ) : (
                rest.map((piece, idx) => (
                  <Reveal as="article" className="tfm-card tfm-stack-card" key={piece.id} delay={idx * 80}>
                    {piece.cover_image_url ? (
                      <div
                        className="card-zoom tfm-stack-card__thumb"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onSelectArticle?.(piece)}
                      >
                        <img src={piece.cover_image_url} alt="" className="card-zoom-img" />
                      </div>
                    ) : null}

                    <div className="tfm-stack-card__content">
                      <div className="tfm-meta">
                        <span className="tfm-category">{piece.category || 'PANITIKAN'}</span>
                        <span className="tfm-meta__dot">·</span>
                        <span className="tfm-meta__time">{piece.read_time || '2 min pagbasa'}</span>
                      </div>

                      <h4 className="tfm-stack-card__title">
                        <a
                          href="#silakbo"
                          className="premium-underline"
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectArticle?.(piece);
                          }}
                        >
                          {piece.title}
                        </a>
                      </h4>

                      <p className="tfm-card__excerpt tfm-stack-card__excerpt">
                        {excerpt(piece.deck || piece.body, 90)}
                      </p>

                      <div className="tfm-stack-card__footer">
                        <span className="tfm-author">Ni {piece.author_name}</span>
                        <a
                          href="#silakbo"
                          className="tfm-read-more"
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectArticle?.(piece);
                          }}
                        >
                          Basahin <span aria-hidden="true">→</span>
                        </a>
                      </div>
                    </div>
                  </Reveal>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Silakbo;