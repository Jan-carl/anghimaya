import { useState, useRef } from 'react';
import { SectionHead } from './SectionHead.jsx';
import { Sheet } from './Sheet.jsx';
import { Reveal } from './Reveal.jsx';
import { portalApi } from '../lib/api.js';
import { useToast } from './Toast.jsx';

const BLANK = {
  volume: 'Tomo XXVII',
  issue: 'Unang Isyu',
  title: '',
  theme: '',
  year: new Date().getFullYear(),
  pages: 16,
  cover_image_url: '',
  pdf_url: '',
  description: '',
};

const stagger = (idx) => Math.min(idx, 10) * 60;

export function EditionManager({ editions = [], onRefresh }) {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [formData, setFormData] = useState(BLANK);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const closeComposer = () => {
    setComposerOpen(false);
    setFormData(BLANK);
  };

  const handleCoverUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await portalApi.uploadImage(file, 'editions');
      if (res?.url) {
        setFormData((prev) => ({ ...prev, cover_image_url: res.url }));
        addToast('Matagumpay na na-upload ang pabalat.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Nabigo ang pag-upload ng cover.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      await portalApi.createEdition({
        ...formData,
        year: Number(formData.year) || new Date().getFullYear(),
        pages: Number(formData.pages) || 16,
      });
      addToast('Naidagdag ang opisyal na edisyon.', 'success');
      closeComposer();
      onRefresh?.();
    } catch (err) {
      addToast(err.message || 'Nabigong lumikha ng edisyon.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, theme) => {
    if (!window.confirm(`Burahin ang edisyong "${theme}"?`)) return;

    setDeletingId(id);
    try {
      await portalApi.deleteEdition(id);
      addToast('Nabura ang edisyon sa digital archive.', 'success');
      onRefresh?.();
    } catch (err) {
      addToast(err.message || 'Nabigong burahin ang edisyon.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="portal-stack">
      <Reveal className="portal-panel">
        <SectionHead
          eyebrow="Opisyal na Archive"
          title="Mga Edisyon"
          action={
            <div className="section-head-actions">
              <span className="chip chip--sm">{editions.length} naka-archive</span>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => setComposerOpen(true)}
              >
                <span aria-hidden="true">+</span>
                <span>Bagong Edisyon</span>
              </button>
            </div>
          }
        />

        {editions.length === 0 ? (
          <Reveal className="empty" variant="zoom">
            <div className="empty__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <strong>Wala pang edisyon</strong>
            <span>Pindutin ang “Bagong Edisyon” upang mag-archive ng PDF copy ng pahayagan.</span>
          </Reveal>
        ) : (
          <ul className="edition-grid">
            {editions.map((ed, idx) => (
              <Reveal
                as="li"
                key={ed.id}
                className="edition-card"
                delay={stagger(idx)}
              >
                <div
                  className={`edition-card__media ${
                    ed.cover_image_url ? '' : 'edition-card__media--empty'
                  }`}
                >
                  {ed.cover_image_url ? (
                    <img src={ed.cover_image_url} alt={ed.theme || 'Pabalat ng Edisyon'} loading="lazy" />
                  ) : (
                    <div className="edition-card__placeholder">
                      <span>ANG HIMAYA</span>
                    </div>
                  )}
                </div>

                <div className="edition-card__body">
                  <div className="edition-card__meta">
                    <span className="chip chip--maroon chip--xs">{ed.volume}</span>
                    <span className="chip chip--xs">{ed.year}</span>
                  </div>

                  <h3 className="edition-card__title">{ed.theme || 'Walang Pamagat'}</h3>
                  {ed.issue ? <p className="edition-card__issue">{ed.issue}</p> : null}

                  <div className="edition-card__actions">
                    {ed.pdf_url ? (
                      <a
                        href={ed.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--secondary btn--sm"
                      >
                        PDF ↗
                      </a>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn--danger-subtle btn--sm"
                      onClick={() => handleDelete(ed.id, ed.theme)}
                      disabled={deletingId === ed.id}
                      aria-label={`Burahin ang edisyong "${ed.theme}"`}
                    >
                      {deletingId === ed.id ? '…' : 'Burahin'}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </Reveal>

      <Sheet
        open={composerOpen}
        onClose={closeComposer}
        labelledBy="edition-sheet-title"
        eyebrow="Digital Archive"
        title="Magdagdag ng Edisyon"
        footer={
          <>
            <button type="submit" form="edition-editor" className="btn btn--primary btn--tall">
              {saving ? 'Ipinapasok…' : 'Ilathala ang Edisyon'}
            </button>
            <button type="button" className="btn btn--secondary btn--tall" onClick={closeComposer}>
              Kanselahin
            </button>
          </>
        }
      >
        <form id="edition-editor" onSubmit={handleSubmit}>
          <div className="form-grid form-grid--2">
            <div className="form-group">
              <label className="form-label" htmlFor="ed-volume">
                Tomo
              </label>
              <input
                id="ed-volume"
                type="text"
                className="form-input"
                placeholder="Tomo XXVII"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ed-issue">
                Isyu
              </label>
              <input
                id="ed-issue"
                type="text"
                className="form-input"
                placeholder="Unang Isyu"
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ed-theme">
              Tema
            </label>
            <input
              id="ed-theme"
              type="text"
              className="form-input"
              placeholder="Halimbawa: Silakbo ng Paninindigan"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              required
            />
          </div>

          <div className="form-grid form-grid--2">
            <div className="form-group">
              <label className="form-label" htmlFor="ed-year">
                Taon
              </label>
              <input
                id="ed-year"
                type="number"
                className="form-input"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ed-pages">
                Pahina
              </label>
              <input
                id="ed-pages"
                type="number"
                className="form-input"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <span className="form-label">Pabalat</span>
            <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="visually-hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]);
                }}
              />
              <div className="dropzone-text">
                {uploading ? 'Ipinapadala…' : 'I-tap para mag-upload ng pabalat'}
              </div>
              {formData.cover_image_url ? (
                <div className="dropzone-preview-wrap" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={formData.cover_image_url}
                    alt=""
                    className="dropzone-preview dropzone-preview--sm"
                  />
                </div>
              ) : null}
            </div>

            <div className="dropzone-url">
              <input
                type="url"
                className="form-input"
                placeholder="o mag-paste ng cover URL"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ed-pdf">
              Link ng PDF
            </label>
            <input
              id="ed-pdf"
              type="text"
              className="form-input"
              placeholder="https://… o /assets/editions/tomo27.pdf"
              value={formData.pdf_url}
              onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ed-desc">
              Paliwanag
            </label>
            <textarea
              id="ed-desc"
              className="form-textarea"
              placeholder="Maikling buod ng nilalaman ng edisyong ito…"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Sheet>
    </div>
  );
}

export default EditionManager;