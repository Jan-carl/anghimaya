import { useState, useEffect } from 'react';
import { scrollToTarget } from '../scene/scroll.js';

const SECTIONS = [
  { id: 'top-story', label: 'Pangunahing Balita' },
  { id: 'voices', label: 'Kolum at Opinyon' },
  { id: 'silakbo', label: 'Silakbo: Panitikan' },
  { id: 'editions', label: 'Mga Edisyon at PDF' },
  { id: 'masthead', label: 'Lupon ng mga Patnugot' },
];

export function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <footer className="tfm-footer">
      <div className="container tfm-footer__inner">
        <div className="tfm-footer__grid">
          {/* KOLUM 1: PUBLIKASYON AT IMPORMASYON */}
          <div className="tfm-footer__brand-col">
            <a
              href="#top"
              className="tfm-footer__logo"
              aria-label="Ang Himaya — Bumalik sa Itaas"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img src="/anghimayalogo.png" alt="" className="tfm-footer__logo-img" />
              <div className="tfm-footer__logo-text">
                <span className="tfm-footer__logo-sub">OPISYAL NA PAMAHAYAGANG MAG-AARAL · AY 2026–2027</span>
                <span className="tfm-footer__logo-main">ANG HIMAYA</span>
              </div>
            </a>

            <p className="tfm-footer__desc">
              “Pluma ng Katotohanan, Haligi ng Katapatan” — Ang Opisyal na Estudyanteng Pampahayagan ng Politeknikong Unibersidad ng Pilipinas – Kampus ng Lopez.
            </p>

            <a
              href="mailto:puplopezanghimaya@gmail.com"
              className="tfm-footer__editorial-link"
            >
              Makipag-ugnayan sa Patnugutan →
            </a>
          </div>

          {/* KOLUM 2: MGA SEKSYON */}
          <div className="tfm-footer__nav-col">
            <h5 className="tfm-footer__heading">MGA SEKSYON</h5>
            <ul className="tfm-footer__links">
              <li>
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Pangunahing Pahina
                </a>
              </li>
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToTarget(`#${sec.id}`);
                    }}
                  >
                    {sec.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* KOLUM 3: TANGGAPAN AT UGNAYAN */}
          <div className="tfm-footer__info-col">
            <h5 className="tfm-footer__heading">TANGGAPAN AT UGNAYAN</h5>
            <div className="tfm-footer__info-list">
              <div className="tfm-footer__info-item">
                <span className="tfm-footer__info-label">TANGGAPAN</span>
                <p className="tfm-footer__info-val">
                  Yumul St. Brgy. Burgos, 4316 Lopez, Quezon
                </p>
              </div>

              <div className="tfm-footer__info-item">
                <span className="tfm-footer__info-label">LIHAM AT AMBAG</span>
                <p className="tfm-footer__info-val">
                  <a href="mailto:puplopezanghimaya@gmail.com">puplopezanghimaya@gmail.com</a>
                </p>
              </div>

              <div className="tfm-footer__info-item">
                <span className="tfm-footer__info-label">PANLIPUNANG MIDYA</span>
                <p className="tfm-footer__info-val">
                  <a href="https://www.facebook.com/anghimaya" target="_blank" rel="noopener noreferrer">
                    facebook.com/anghimaya
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA BAR */}
        <div className="tfm-footer__bottom">
          <div className="tfm-footer__bottom-left">
            <span>
              © {new Date().getFullYear()} <strong>Ang Himaya</strong>. Lahat ng karapatan ay nakalaan.
            </span>
            <span className="tfm-footer__bottom-sep">·</span>
            <span>PUP Lopez Campus</span>
          </div>
          <span className="tfm-footer__motto">
            Pluma ng Katotohanan · Haligi ng Katapatan · Kasama ng Sambayanan
          </span>
        </div>
      </div>

      {/* FLOATING BACK TO TOP BUTTON */}
      <button
        type="button"
        className={`tfm-back-to-top ${showTop ? 'tfm-back-to-top--visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Bumalik sa itaas"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </footer>
  );
}

export default Footer;