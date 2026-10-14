import { useState, useRef } from 'react';
import { SectionHead } from './SectionHead.jsx';
import { Reveal } from './Reveal.jsx';
import { portalApi } from '../lib/api.js';
import { useToast } from './Toast.jsx';

const stagger = (idx) => Math.min(idx, 12) * 55;

export function MediaStudio() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Tanging mga larawan (JPG, PNG, WebP) lamang ang pinapayagan.', 'error');
      return;
    }

    setUploading(true);
    try {
      const res = await portalApi.uploadImage(file, 'portal-media');
      if (res?.url) {
        setUploads((prev) => [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            filename: res.filename || file.name,
            url: res.url,
            provider: res.provider || 'local',
            size: `${(file.size / 1024).toFixed(1)} KB`,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev,
        ]);
        addToast('Matagumpay na na-upload ang larawan.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Nabigo ang pag-upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard?.writeText(url);
    addToast('Na-kopya ang image URL sa clipboard.', 'success');
  };

  return (
    <div className="portal-stack">
      <Reveal className="portal-panel">
        <SectionHead
          eyebrow="Tanggapan ng Patnugutan"
          title="Media at mga Larawan"
          action={
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <span aria-hidden="true">+</span>
              <span>Mag-upload</span>
            </button>
          }
        />

        <div
          className={`dropzone dropzone--tall ${dragOver ? 'dragover' : ''}`.trim()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
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
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <div className="dropzone-text dropzone-text--lg">
            {uploading ? 'Ipinapadala…' : 'I-drag ang larawan dito o mag-tap'}
          </div>
          <div className="dropzone-sub">JPG, PNG, o WebP hanggang 5MB</div>
        </div>

        <div className="media-gallery">
          <h3 className="media-subhead">Na-upload ngayong sesyon ({uploads.length})</h3>

          {uploads.length === 0 ? (
            <Reveal className="empty empty--sunken" variant="zoom">
              <strong>Wala pang na-upload</strong>
              <span>Ang mga larawang magagamit sa mga ulat ay ipapakita rito.</span>
            </Reveal>
          ) : (
            <ul className="media-grid">
              {uploads.map((item, idx) => (
                <Reveal
                  as="li"
                  key={item.id}
                  className="media-card"
                  delay={stagger(idx)}
                >
                  <img src={item.url} alt="" className="media-card__img" />

                  <div className="media-card__body">
                    <div className="media-card__name" title={item.filename}>
                      {item.filename}
                    </div>
                    <div className="media-card__meta">
                      {item.size} · {item.date}
                    </div>

                    <button
                      type="button"
                      className="btn btn--secondary btn--sm media-card__btn"
                      onClick={() => copyUrl(item.url)}
                    >
                      Kopyahin ang URL
                    </button>
                  </div>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}

export default MediaStudio;