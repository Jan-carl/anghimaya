import { useEffect, useState } from 'react';

/**
 * Sticky na glass nav — pareho sa `.nav` ng client front-end:
 * puting translucent bar + inset na pulang linya sa itaas at
 * mas matinding estado pag na-scroll.
 *
 * Isang account lang ang ginagamit, kaya walang badge ng status o role —
 * branding sa kaliwa, logout sa kanan.
 */
export function Header({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const websiteUrl = typeof window !== 'undefined' && window.location.port === '5174'
    ? 'http://localhost:5173/'
    : '/';

  return (
    <header className={`portal-header ${scrolled ? 'portal-header--scrolled' : ''}`.trim()}>
      <div className="portal-container portal-header-inner">
        <div className="portal-brand">
          <img
            src="./anghimayalogo.png"
            alt="Ang Himaya Sagisag"
            className="portal-brand-emblem"
          />
          <div className="portal-brand-text">
            <span className="portal-brand-name">Ang Himaya Portal</span>
            <span className="portal-brand-sub">Tanggapan ng Patnugutan</span>
          </div>
        </div>

        <div className="portal-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--subtle btn--sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            title="Buksan ang aktwal na website sa bagong tab"
          >
            <span>Tingnan ang Website</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          {user ? (
            <button
              type="button"
              className="btn btn--danger-subtle btn--sm"
              onClick={onLogout}
              title="Mag-logout sa portal"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Header;