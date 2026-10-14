/**
 * Malinis at modernong Section Header para sa Tanggapan ng Patnugutan
 * Kasama ang Oxford double rule ng client — maikling pulang stub sa ibaba ng
 * hairline, ang pinakkilalang sagisag ng pahayagan.
 */
export function SectionHead({ eyebrow, title, meta, action }) {
  return (
    <header className="portal-section-head">
      <div className="portal-section-head__content">
        {eyebrow ? <span className="portal-section-head__eyebrow">{eyebrow}</span> : null}
        <h2 className="portal-section-head__title">{title}</h2>
        {meta ? <p className="portal-section-head__meta">{meta}</p> : null}

        <div className="oxford" aria-hidden="true">
          <span className="oxford__thin" />
          <span className="oxford__thick" />
        </div>
      </div>

      {action ? (
        <div className="portal-section-head__action">{action}</div>
      ) : null}
    </header>
  );
}

export default SectionHead;