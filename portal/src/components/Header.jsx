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

        {user ? (
          <div className="portal-header-actions">
            <button
              type="button"
              className="btn btn--danger-subtle btn--sm"
              onClick={onLogout}
              title="Mag-logout sa portal"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Header;