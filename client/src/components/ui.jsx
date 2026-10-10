/** Ibinabahaging ulo ng bawat seksyon — hango sa modernong Oxford Header ng thefrontman.ph */
export function SectionHead({ eyebrow, title, meta, action, seeAllHref, seeAllLabel = 'Tingnan lahat' }) {
  return (
    <header className="premium-section-header">
      <div className="premium-header-top">
        <div className="premium-title-container">
          {eyebrow ? <span className="premium-header-eyebrow">{eyebrow}</span> : null}
          <h2 className="premium-header-title">{title}</h2>
        </div>

        {action ? (
          action
        ) : seeAllHref ? (
          <a className="premium-see-all" href={seeAllHref}>
            {seeAllLabel} <span aria-hidden="true">→</span>
          </a>
        ) : meta ? (
          <span className="premium-header-meta">{meta}</span>
        ) : null}
      </div>

      <div className="premium-header-oxford" aria-hidden="true">
        <div className="premium-oxford-thick" />
        <div className="premium-oxford-thin" />
      </div>
    </header>
  );
}


/** May chip na "Walang laman" na estado — mas malinis kaysa sa alert(). */
export function EmptyState({ title, hint }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {hint ? <span>{hint}</span> : null}
    </div>
  );
}
