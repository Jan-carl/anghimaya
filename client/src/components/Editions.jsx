import { useState } from 'react';
import { Reveal } from './Reveal.jsx';
import { EmptyState, SectionHead } from './ui.jsx';

const SYMBOLS = ['ᜑ', '✦', 'ᜋ', 'ᜊ', '✧'];

/**
 * Mga Edisyon: Hango sa modernong archive / publication grid ng thefrontman.ph
 * - Oxford Header ("MGA EDISYON" na may see-all at double rule)
 * - 3-Column Modern Cards na may cover graphics, volume badge, at download actions
 */
export function Editions({ editions = [] }) {
  const [notice, setNotice] = useState('');

  const openEdition = (edition) => {
    if (edition.pdf_url && edition.pdf_url !== '#') {
      window.open(edition.pdf_url, '_blank', 'noopener');
      return;
    }
    setNotice(`Binubuksan ang digital PDF viewer para sa ${edition.volume}…`);
    window.setTimeout(() => setNotice(''), 3000);
  };

  return (
    <section className="section" id="editions">
      <div className="container">
        <Reveal>
          <SectionHead
            eyebrow="DIGITAL ARCHIVE"
            title="MGA OPISYAL NA EDISYON"
            seeAllHref="#editions"
            seeAllLabel="BUONG ARCHIVE"
          />
        </Reveal>

        {editions.length === 0 ? (
          <EmptyState title="Wala pang naitalang edisyon." />
        ) : (
          <div className="tfm-grid-3">
            {editions.map((edition, idx) => (
              <Reveal as="article" className="tfm-card tfm-edition-card" key={edition.id} delay={idx * 80}>
                <div className="card-zoom tfm-edition-card__cover">
                  <div className="tfm-edition-card__symbol" aria-hidden="true">
                    {SYMBOLS[idx % SYMBOLS.length]}
                  </div>
                  <div className="tfm-edition-card__cover-text">
                    <span className="tfm-edition-card__sub">ANG HIMAYA</span>
                    <span className="tfm-edition-card__vol">{edition.volume}</span>
                    {edition.theme ? <span className="tfm-edition-card__theme">“{edition.theme}”</span> : null}
                  </div>
                  <span className="tfm-card__column-badge">{edition.year || '2026'}</span>
                </div>

                <div className="tfm-card__body">
                  <div className="tfm-meta">
                    <span className="tfm-category">OPISYAL NA ISYU</span>
                    <span className="tfm-meta__dot">·</span>
                    <span className="tfm-meta__time">{edition.pages ?? 16} pahina</span>
                  </div>

                  <h3 className="tfm-card__title">
                    <a href="#editions" className="premium-underline" onClick={(e) => { e.preventDefault(); openEdition(edition); }}>
                      {edition.volume} {edition.theme ? `— ${edition.theme}` : ''}
                    </a>
                  </h3>

                  <p className="tfm-card__excerpt">
                    {edition.description || `Opisyal na kopya ng pahayagan ng PUP Lopez para sa taong panuruan ${edition.year || 2026}.`}
                  </p>

                  <div className="tfm-edition-card__actions">
                    <button type="button" className="btn btn--maroon btn--sm" onClick={() => openEdition(edition)}>
                      Basahin Online <span aria-hidden="true">→</span>
                    </button>
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => openEdition(edition)}>
                      I-download ang PDF <span aria-hidden="true">↓</span>
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {notice ? (
          <div className="tfm-notice-pill" role="status">
            <span>ℹ️</span> {notice}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default Editions;