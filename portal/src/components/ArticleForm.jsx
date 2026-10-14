import { useState, useEffect, useRef } from 'react';
import { portalApi } from '../lib/api.js';
import { useToast } from './Toast.jsx';

const ARTICLE_TYPES = [
  { id: 'news', label: 'Balita', defaultCategory: 'Pangunahing Balita' },
  { id: 'column', label: 'Kolum', defaultCategory: 'Kolum' },
  { id: 'editorial', label: 'Editoryal', defaultCategory: 'Editoryal' },
  { id: 'feature', label: 'Lathalain', defaultCategory: 'Lathalain' },
  { id: 'literary', label: 'Silakbo', defaultCategory: 'Panitikan' },
];

const BLANK_FORM = {
  type: 'news',
  category: 'Pangunahing Balita',
  title: '',
  deck: '',
  column_name: '',
  pull_quote: '',
  author_name: '',
  author_role: '',
  cover_image_url: '',
  image_caption: '',
  body: '',
  is_lead: false,
};

/**
 * Walang sariling panel o submit bar — ang Sheet ang nag-aalaga ng chrome at
 * ng pangunahing tugon, para nasa ilalim ng daloy ang mga button sa mobile.
 */
export function ArticleForm({ formId, initialData = null, onSaved }) {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(BLANK_FORM);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialData) {
      setFormData(BLANK_FORM);
      return;
    }
    setFormData({
      type: initialData.type || 'news',
      category: initialData.category || 'Pangunahing Balita',
      title: initialData.title || '',
      deck: initialData.deck || '',
      column_name: initialData.column_name || '',
      pull_quote: initialData.pull_quote || '',
      author_name: initialData.author_name || '',
      author_role: initialData.author_role || '',
      cover_image_url: initialData.cover_image_url || '',
      image_caption: initialData.image_caption || '',
      body: initialData.body || '',
      is_lead: Boolean(initialData.is_lead),
    });
  }, [initialData]);

  const handleTypeChange = (newType) => {
    const config = ARTICLE_TYPES.find((t) => t.id === newType);
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: config?.defaultCategory || prev.category,
    }));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Tanging mga larawan (JPG, PNG, WebP) lamang ang pinapayagan.', 'error');
      return;
    }

    setUploading(true);
    try {
      const res = await portalApi.uploadImage(file);
      if (res?.url) {
        setFormData((prev) => ({ ...prev, cover_image_url: res.url }));
        addToast('Matagumpay na na-upload ang larawan.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Nabigo ang pag-upload ng larawan.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const wordCount = formData.body.trim() ? formData.body.trim().split(/\s+/).length : 0;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!formData.title.trim() || !formData.body.trim()) {
      addToast('Kinakailangan ang pamagat at teksto ng artikulo.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, read_time: `${readMinutes} min pagbasa` };

      if (initialData?.id) {
        await portalApi.updateArticle(initialData.id, payload);
        addToast('Na-update ang artikulo sa pahayagan.', 'success');
      } else {
        await portalApi.createArticle(payload);
        addToast('Nailathala ang artikulo sa pahayagan.', 'success');
      }
      onSaved?.();
    } catch (err) {
      addToast(err.message || 'Nabigong i-save ang artikulo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form id={formId} className="editor" onSubmit={handleSubmit}>
      <section className="field-block">
        <span className="field-block__label">Seksyon</span>
        <div className="type-switch">
          {ARTICLE_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`btn btn--sm ${formData.type === t.id ? 'btn--primary' : 'btn--secondary'}`}
              onClick={() => handleTypeChange(t.id)}
              aria-pressed={formData.type === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {formData.type === 'column' ? (
        <div className="form-group">
          <label className="form-label" htmlFor="post-col-name">
            Pangalan ng Kolum
          </label>
          <input
            id="post-col-name"
            type="text"
            className="form-input"
            placeholder="Halimbawa: Tinig ng Pluma"
            value={formData.column_name}
            onChange={(e) => setFormData({ ...formData, column_name: e.target.value })}
          />
        </div>
      ) : null}

      <div className="form-group">
        <label className="form-label" htmlFor="post-title">
          Pamagat
        </label>
        <input
          id="post-title"
          type="text"
          className="form-input"
          placeholder="Ilagay ang pamagat o headline"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <div className="form-hint form-hint--right">{formData.title.length}/220</div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="post-deck">
          Dek / Buod
        </label>
        <input
          id="post-deck"
          type="text"
          className="form-input"
          placeholder="Maikling pambungad o buod ng balita"
          value={formData.deck}
          onChange={(e) => setFormData({ ...formData, deck: e.target.value })}
        />
      </div>

      {formData.type === 'editorial' || formData.type === 'feature' ? (
        <div className="form-group">
          <label className="form-label" htmlFor="post-pullquote">
            Sipi (Pull Quote)
          </label>
          <input
            id="post-pullquote"
            type="text"
            className="form-input"
            placeholder="Mahalagang pangungusap o sipi"
            value={formData.pull_quote}
            onChange={(e) => setFormData({ ...formData, pull_quote: e.target.value })}
          />
        </div>
      ) : null}

      <div className="form-grid form-grid--2">
        <div className="form-group">
          <label className="form-label" htmlFor="post-author">
            May-akda
          </label>
          <input
            id="post-author"
            type="text"
            className="form-input"
            placeholder="Jesica F. Laboc"
            value={formData.author_name}
            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="post-role">
            Tungkulin
          </label>
          <input
            id="post-role"
            type="text"
            className="form-input"
            placeholder="Punong Patnugot"
            value={formData.author_role}
            onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <span className="form-label">Larawan ng Ulat</span>
        <div
          className={`dropzone ${dragOver ? 'dragover' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
          <svg
            className="dropzone-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <div className="dropzone-text">
            {uploading ? 'Ipinapadala…' : 'I-drag ang larawan dito o mag-tap'}
          </div>
          <div className="dropzone-sub">JPG, PNG, o WebP</div>

          {formData.cover_image_url ? (
            <div className="dropzone-preview-wrap" onClick={(e) => e.stopPropagation()}>
              <img
                src={formData.cover_image_url}
                alt="Preview"
                className="dropzone-preview"
              />
              <button
                type="button"
                className="btn btn--danger btn--sm dropzone-clear"
                onClick={() => setFormData({ ...formData, cover_image_url: '' })}
              >
                Alisin
              </button>
            </div>
          ) : null}
        </div>

        <div className="dropzone-url">
          <input
            type="url"
            className="form-input"
            placeholder="o mag-paste ng direct image URL"
            value={formData.cover_image_url}
            onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="post-caption">
          Caption at Credit
        </label>
        <input
          id="post-caption"
          type="text"
          className="form-input"
          placeholder="PUP Lopez Campus · Kuha ng Ang Himaya"
          value={formData.image_caption}
          onChange={(e) => setFormData({ ...formData, image_caption: e.target.value })}
        />
      </div>

      <div className="form-group">
        <div className="form-row">
          <label className="form-label" htmlFor="post-body">
            Buong Teksto
          </label>
          <span className="form-hint form-hint--count">
            {wordCount} salita · {readMinutes} min
          </span>
        </div>
        <textarea
          id="post-body"
          className="form-textarea"
          placeholder="Isulat o i-paste ang nilalaman ng artikulo…"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={10}
          required
        />
      </div>

      <label className="check-card">
        <input
          type="checkbox"
          checked={formData.is_lead}
          onChange={(e) => setFormData({ ...formData, is_lead: e.target.checked })}
        />
        <span>
          <span className="check-card__title">Lead Story (Spotlight)</span>
          <span className="check-card__hint">Itatampok sa pangunahing banner ng pahayagan.</span>
        </span>
      </label>

      {saving ? <span className="visually-hidden" role="status">Ini-save…</span> : null}
    </form>
  );
}