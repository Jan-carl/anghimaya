import { useState, useMemo } from 'react';
import { ArticleForm } from './ArticleForm.jsx';
import { ArticlePreviewModal } from './ArticlePreviewModal.jsx';
import { SectionHead } from './SectionHead.jsx';
import { Sheet } from './Sheet.jsx';
import { Reveal } from './Reveal.jsx';
import { portalApi } from '../lib/api.js';
import { useToast } from './Toast.jsx';

const FILTERS = [
  { id: 'all', label: 'Lahat' },
  { id: 'news', label: 'Balita' },
  { id: 'column', label: 'Kolum' },
  { id: 'editorial', label: 'Editoryal' },
  { id: 'feature', label: 'Lathalain' },
  { id: 'literary', label: 'Silakbo' },
  { id: 'lead', label: 'Lead' },
];

// Pinapigilan ang haba ng stagger para sa mahabang talaan.
const stagger = (idx) => Math.min(idx, 10) * 55;

export function ArticleManager({ articles = [], onRefresh }) {
  const { addToast } = useToast();
  const [editor, setEditor] = useState(null);
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const filtered = useMemo(() => {
    let list = articles;

    if (filter === 'lead') {
      list = list.filter((a) => a.is_lead);
    } else if (filter !== 'all') {
      list = list.filter((a) => a.type === filter);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((a) =>
        [a.title, a.deck, a.author_name, a.category, a.body].some((f) =>
          String(f || '').toLowerCase().includes(q),
        ),
      );
    }

    return list;
  }, [articles, filter, query]);

  const closeEditor = () => {
    setEditor(null);
    onRefresh?.();
  };

  const handleDelete = async (article) => {
    if (!window.confirm(`Burahin ang "${article.title}" sa pahayagan?`)) return;

    setDeletingId(article.id);
    try {
      await portalApi.deleteArticle(article.id);
      addToast('Nabura ang artikulo sa pahayagan.', 'success');
      onRefresh?.();
    } catch (err) {
      addToast(err.message || 'Nabigong burahin ang artikulo.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="portal-stack">
      <Reveal className="portal-panel">
        <SectionHead
          eyebrow="Talaan ng Nilalaman"
          title="Mga Artikulo"
          action={
            <span className="chip chip--sm">
              {filtered.length} / {articles.length} nailathala
            </span>
          }
        />

        <div className="roster-bar">
          <div className="roster-bar__search">
            <svg
              className="roster-bar__icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              className="form-input roster-bar__input"
              placeholder="Maghanap ng pamagat, may-akda, o paksa…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Maghanap sa mga artikulo"
            />
            {query ? (
              <button
                type="button"
                className="roster-bar__clear"
                onClick={() => setQuery('')}
                aria-label="Burahin ang paghahanap"
              >
                ✕
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className="btn btn--primary roster-bar__cta"
            onClick={() => setEditor({ article: null })}
          >
            <span aria-hidden="true">+</span>
            <span>Maglathala</span>
          </button>
        </div>

        <div className="filter-scroll" role="group" aria-label="Salain ayon sa uri">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`article-filter-btn ${filter === f.id ? 'active' : ''}`.trim()}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Reveal className="empty" variant="zoom">
            <div className="empty__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <strong>Walang artikulong tumugma</strong>
            <span>
              {articles.length === 0
                ? 'Wala pang artikulo. Pindutin ang “Maglathala” upang magsimulang mag-post.'
                : 'Subukang baguhin ang salitang hinahanap o piliin ang ibang kategorya.'}
            </span>
          </Reveal>
        ) : (
          <ul className="article-list">
            {filtered.map((art, idx) => (
              <Reveal
                as="li"
                key={art.id}
                className="article-card-item"
                delay={stagger(idx)}
              >
                <div className="article-card-thumb-wrap">
                  {art.cover_image_url ? (
                    <img
                      src={art.cover_image_url}
                      alt={art.title}
                      className="article-thumb"
                      loading="lazy"
                    />
                  ) : (
                    <div className="article-thumb article-thumb--placeholder" aria-hidden="true">
                      <span>HIMAYA</span>
                    </div>
                  )}
                </div>

                <div className="article-card-body">
                  <div className="article-card-meta">
                    <span className="chip chip--maroon chip--xs">
                      {art.category || art.type}
                    </span>
                    {art.is_lead ? (
                      <span className="chip chip--lead chip--xs">★ Lead Story</span>
                    ) : null}
                    <span className="article-card-date">
                      {new Date(art.published_at || art.created_at || Date.now()).toLocaleDateString(
                        'tl-PH',
                        { year: 'numeric', month: 'short', day: 'numeric' },
                      )}
                    </span>
                  </div>

                  <h3 className="article-card-title">{art.title}</h3>
                  <p className="article-card-byline">
                    Ni <strong>{art.author_name}</strong>
                    {art.author_role ? ` · ${art.author_role}` : ''}
                  </p>

                  <div className="article-card-actions">
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => setPreview(art)}
                    >
                      Basahin
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => setEditor({ article: art })}
                    >
                      I-edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger-subtle btn--sm"
                      onClick={() => handleDelete(art)}
                      disabled={deletingId === art.id}
                      aria-label={`Burahin ang "${art.title}"`}
                    >
                      {deletingId === art.id ? '…' : 'Burahin'}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </Reveal>

      <Sheet
        open={!!editor}
        onClose={closeEditor}
        labelledBy="article-sheet-title"
        eyebrow="Tanggapan ng Patnugutan"
        title={editor?.article ? 'I-edit ang Artikulo' : 'Maglathala ng Artikulo'}
        footer={
          <>
            <button
              type="submit"
              form="article-editor"
              className="btn btn--primary btn--tall"
            >
              {editor?.article ? 'I-save ang Pagbabago' : 'Ilathala sa Pahayagan'}
            </button>
            <button type="button" className="btn btn--secondary btn--tall" onClick={closeEditor}>
              Kanselahin
            </button>
          </>
        }
      >
        <ArticleForm
          formId="article-editor"
          initialData={editor?.article}
          onSaved={closeEditor}
        />
      </Sheet>

      {preview ? (
        <ArticlePreviewModal article={preview} onClose={() => setPreview(null)} />
      ) : null}
    </div>
  );
}

export default ArticleManager;