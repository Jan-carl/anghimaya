import { useEffect, useRef } from 'react';

/**
 * Bottom sheet sa mobile, centered dialog sa desktop.
 * Always gives the primary action a sticky footer within thumb reach.
 */
export function Sheet({ open, onClose, title, eyebrow, children, footer, labelledBy }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (prevOverflow) {
        document.body.style.overflow = prevOverflow;
      } else {
        document.body.style.removeProperty('overflow');
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__grip" aria-hidden="true" />

        <header className="sheet__head">
          <div className="sheet__titles">
            {eyebrow ? <span className="sheet__eyebrow">{eyebrow}</span> : null}
            <h2 className="sheet__title" id={labelledBy}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="sheet__close"
            onClick={onClose}
            aria-label="Isara"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="sheet__body">{children}</div>

        {footer ? <footer className="sheet__foot">{footer}</footer> : null}
      </div>
    </div>
  );
}