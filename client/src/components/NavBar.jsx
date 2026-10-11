import { useEffect, useMemo, useRef, useState } from 'react';
import { scrollToTarget, pauseLenis, resumeLenis } from '../scene/scroll.js';

const LINKS = [
  { id: 'top-story', label: 'Balita' },
  { id: 'voices', label: 'Kolum at Opinyon' },
  { id: 'silakbo', label: 'Silakbo' },
  { id: 'editions', label: 'Mga Edisyon' },
  { id: 'masthead', label: 'Patnugutan' },
];

const SECTION_IDS = [...LINKS.map((link) => link.id), 'subscribe'];

/**
 * Sticky na nababago anyo ng header: brand, mga seksyon, live na paghahanap.
 */
export function NavBar({ articles = [], onSelectArticle }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(SECTION_IDS[0]);
  const [hovered, setHovered] = useState(null);
  const [sliderPos, setSliderPos] = useState({ x: 0, width: 0, opacity: 0 });
  const searchRef = useRef(null);
  const navLinksRef = useRef(null);
  const navRef = useRef(null);

  const targetId = hovered || active;

  useEffect(() => {
    const updateSlider = () => {
      if (!navLinksRef.current) return;
      const targetEl = navLinksRef.current.querySelector(`.nav__link[data-id="${targetId}"]`);
      if (targetEl) {
        const containerRect = navLinksRef.current.getBoundingClientRect();
        const elRect = targetEl.getBoundingClientRect();
        const barWidth = Math.max(20, Math.round(elRect.width * 0.6));
        const x = (elRect.left - containerRect.left) + (elRect.width - barWidth) / 2;
        setSliderPos({ x, width: barWidth, opacity: 1 });
      } else {
        setSliderPos((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateSlider();
    window.addEventListener('resize', updateSlider);
    const timer = setTimeout(updateSlider, 60);
    return () => {
      window.removeEventListener('resize', updateSlider);
      clearTimeout(timer);
    };
  }, [targetId, menuOpen]);

  // Eksaktong taas ng header bilang --nav-h: ito ang pinagmamulungan ng
  // position:fixed ng mobile drawer at ng scroll-margin-top ng mga seksyon.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const apply = () => {
      const h = Math.round(nav.getBoundingClientRect().height);
      if (h > 0) document.documentElement.style.setProperty('--nav-h', h + 'px');
    };

    apply();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', apply);
      return () => window.removeEventListener('resize', apply);
    }

    const ro = new ResizeObserver(apply);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Kapag bukas ang menu, ihinto ang background smooth scroll nang malinis
  useEffect(() => {
    if (menuOpen) {
      pauseLenis();
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        if (prevOverflow) {
          document.body.style.overflow = prevOverflow;
        } else {
          document.body.style.removeProperty('overflow');
        }
        resumeLenis();
      };
    }
  }, [menuOpen]);

  // Scroll spy — itinatayo ang aktibong link batay sa pinakamalapit na seksyon.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    SECTION_IDS.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setQuery('');
        setMenuOpen(false);
      }
      if (event.key === '/' && document.activeElement !== searchRef.current) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];

    return articles
      .filter((article) =>
        [article.title, article.deck, article.author_name, article.category].some((field) =>
          String(field ?? '').toLowerCase().includes(needle),
        ),
      )
      .slice(0, 6);
  }, [articles, query]);

  const go = (id) => {
    setMenuOpen(false);
    resumeLenis();
    // Hintayin munang makasara ang mobile drawer (kasama ang pag-aalis ng overflow
    // lock sa body), tapos ISANG scroll lang. Ang dating dalawang sabay-sabay na
    // smooth scroll ay nagta-talon ng pahina sa iPhone.
    setTimeout(() => scrollToTarget(id === 'top' ? '#top' : `#${id}`), 30);
  };

  const pickResult = (article) => {
    setQuery('');
    setMenuOpen(false);
    if (onSelectArticle) {
      onSelectArticle(article);
    } else {
      const section = article.type === 'news' ? 'top-story' : article.type === 'literary' ? 'silakbo' : 'voices';
      scrollToTarget(`#${section}`);
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`nav ${scrolled ? 'nav--scrolled' : ''} ${menuOpen ? 'nav--open' : ''}`.trim()}
        data-open={menuOpen}
        id="site-nav"
      >
        <div className="container nav__inner">
        <a
          className="nav__brand"
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            go('top');
          }}
          aria-label="Ang Himaya — pangunahing pahina"
        >
          <img src="/anghimayalogo.png" alt="" aria-hidden="true" />
          <span className="nav__brand-text">
            <span className="nav__brand-name">Ang Himaya</span>
            <span className="nav__brand-tag">PUP Lopez Campus</span>
          </span>
        </a>

        <div
          className="nav__links"
          data-open={menuOpen}
          ref={navLinksRef}
          onMouseLeave={() => setHovered(null)}
        >
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              data-id={link.id}
              className={`nav__link ${active === link.id ? 'nav__link--active' : ''}`.trim()}
              onMouseEnter={() => setHovered(link.id)}
              onClick={(event) => {
                event.preventDefault();
                go(link.id);
              }}
            >
              {link.label}
            </a>
          ))}

          {/* ANIMATED MAGNETIC SLIDING UNDERLINE */}
          <span
            className="nav__slider"
            style={{
              transform: `translateX(${sliderPos.x}px)`,
              width: `${sliderPos.width}px`,
              opacity: sliderPos.opacity,
            }}
            aria-hidden="true"
          />

          <div className="nav__mobile-drawer-footer">
            <button
              type="button"
              className="btn btn--maroon btn--block"
              onClick={() => go('subscribe')}
            >
              Mag-subscribe sa Ang Himaya <span aria-hidden="true">→</span>
            </button>
            <p className="nav__mobile-tagline">
              Opisyal na Pamahayagang Mag-aaral ng PUP Lopez Campus
            </p>
          </div>
        </div>

        <div className="nav__actions">
          <div className="search">
            <svg className="search__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Maghanap…"
              aria-label="Maghanap ng mga artikulo"
            />

            {results.length > 0 ? (
              <div className="search-panel" role="listbox">
                <p className="search-panel__count">{results.length} na resulta</p>
                <ul>
                  {results.map((article) => (
                    <li key={article.id}>
                      <button type="button" onClick={() => pickResult(article)}>
                        <span className="chip chip--gold">{article.category || article.type}</span>
                        <span className="search-panel__title">{article.title}</span>
                        <span className="search-panel__author">{article.author_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {query.trim().length >= 2 && results.length === 0 ? (
              <div className="search-panel search-panel--empty" role="status">
                Walang artikulo na tumutugma sa “{query.trim()}”.
              </div>
            ) : null}
          </div>

          <button type="button" className="btn btn--maroon btn--sm" onClick={() => go('subscribe')}>
            Mag-subscribe <span aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            className="nav__toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="I-toggle ang menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar;