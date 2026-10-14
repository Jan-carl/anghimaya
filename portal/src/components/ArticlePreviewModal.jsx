import { useEffect, useRef } from 'react';

export function ArticlePreviewModal({ article, onClose }) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!article) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);

    // Para hindi mag-scroll ang page sa likuran ng modal.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    boxRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      if (prevOverflow) {
        document.body.style.overflow = prevOverflow;
      } else {
        document.body.style.removeProperty('overflow');
      }
    };
  }, [article, onClose]);

  if (!article) return null;

  const paragraphs = String(article.body || '')
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const [first, ...rest] = paragraphs;
  const dropCap = first ? first.charAt(0) : '';
  const firstRemainder = first ? first.slice(1) : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <article
        className="modal-box reader-box"
        ref={boxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Preview: ${article.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="reader-bar">
          <div className="reader-bar__chips">
            <span className="chip chip--maroon chip--sm">{article.category || article.type}</span>
            {article.is_lead ? <span className="chip chip--lead chip--sm">★ Lead Story</span> : null}
          </div>

          <button
            type="button"
            className="btn btn--secondary btn--sm reader-close-btn"
            onClick={onClose}
            aria-label="Isara ang preview"
          >
            <span>Isara</span>
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Headline */}
        <h1 className="reader-title">{article.title}</h1>

        {/* Dek */}
        {article.deck ? <p className="reader-deck">{article.deck}</p> : null}

        {/* Byline */}
        <div className="reader-byline">
          <strong>Ni {article.author_name || 'Patnugutan ng Ang Himaya'}</strong>
          <span className="reader-byline__sep">·</span>
          <span>{article.author_role || 'Kawani'}</span>
          <span className="reader-byline__sep">·</span>
          <span>
            {new Date(article.published_at || article.created_at || Date.now()).toLocaleDateString(
              'tl-PH',
              { year: 'numeric', month: 'long', day: 'numeric' },
            )}
          </span>
          <span className="reader-byline__sep">·</span>
          <span>{article.read_time || '4 min pagbasa'}</span>
        </div>

        {/* Cover Image */}
        {article.cover_image_url ? (
          <figure className="reader-figure">
            <img src={article.cover_image_url} alt={article.image_caption || article.title} loading="lazy" />
            {article.image_caption ? <figcaption>{article.image_caption}</figcaption> : null}
          </figure>
        ) : null}

        {/* Pull Quote */}
        {article.pull_quote ? (
          <blockquote className="reader-quote">&ldquo;{article.pull_quote}&rdquo;</blockquote>
        ) : null}

        {/* Body — may drop cap sa unang talata */}
        <div className="reader-body">
          {first ? (
            <p>
              <span className="reader-drop-cap" aria-hidden="true">{dropCap}</span>
              {firstRemainder}
            </p>
          ) : null}
          {rest.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </article>
    </div>
  );
}

export default ArticlePreviewModal;