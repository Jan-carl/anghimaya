import { useState } from 'react';
import { SectionHead } from './SectionHead.jsx';
import { Sheet } from './Sheet.jsx';
import { Reveal } from './Reveal.jsx';
import { portalApi } from '../lib/api.js';
import { useToast } from './Toast.jsx';

const TEMPLATES = ['BAGONG ULAT: ', 'PAUNAWA: ', 'UPDATE: ', 'PAHAYAG: '];

const stagger = (idx) => Math.min(idx, 10) * 55;

export function TickerManager({ ticker = [], onRefresh }) {
  const { addToast } = useToast();
  const [composerOpen, setComposerOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const closeComposer = () => {
    setComposerOpen(false);
    setMessage('');
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (broadcasting) return;
    if (!message.trim()) return;

    setBroadcasting(true);
    try {
      await portalApi.createTicker(message.trim());
      addToast('Nai-broadcast ang alert sa ticker.', 'success');
      closeComposer();
      onRefresh?.();
    } catch (err) {
      addToast(err.message || 'Nabigo ang pag-broadcast ng alert.', 'error');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Alisin ang alert na ito sa ticker?')) return;

    setDeletingId(id);
    try {
      await portalApi.deleteTicker(id);
      addToast('Naalis ang alert sa ticker.', 'success');
      onRefresh?.();
    } catch (err) {
      addToast(err.message || 'Nabigong alisin ang alert.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="portal-stack">
      <Reveal className="portal-panel">
        <SectionHead
          eyebrow="Publikasyon"
          title="Mga Aktibong Alert"
          action={
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setComposerOpen(true)}
            >
              <span aria-hidden="true">+</span>
              <span>I-broadcast</span>
            </button>
          }
        />

        {ticker.length === 0 ? (
          <Reveal className="empty" variant="zoom">
            <div className="empty__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <strong>Walang aktibong alert</strong>
            <span>Pindutin ang “I-broadcast” upang maglabas ng pabatid sa ticker bar ng pahayagan.</span>
          </Reveal>
        ) : (
          <ul className="ticker-list">
            {ticker.map((item, idx) => (
              <Reveal
                as="li"
                key={item.id}
                className="ticker-item"
                variant="slide-right"
                delay={stagger(idx)}
              >
                <div className="ticker-item__body">
                  <div className="ticker-item__meta">
                    <span className="chip chip--maroon chip--xs">Alert</span>
                    <span className="ticker-item__time">
                      {new Date(item.created_at || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="ticker-item__msg">{item.message}</p>
                </div>
                <button
                  type="button"
                  className="btn btn--danger-subtle btn--sm ticker-item__delete"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  aria-label="Burahin ang alert"
                >
                  {deletingId === item.id ? '…' : 'Burahin'}
                </button>
              </Reveal>
            ))}
          </ul>
        )}
      </Reveal>

      <Sheet
        open={composerOpen}
        onClose={closeComposer}
        labelledBy="ticker-sheet-title"
        eyebrow="Tanggapan ng Patnugutan"
        title="Mag-broadcast ng Alert"
        footer={
          <>
            <button type="submit" form="ticker-composer" className="btn btn--primary btn--tall">
              {broadcasting ? 'Ibinobroadcast…' : 'I-broadcast sa Ticker'}
            </button>
            <button type="button" className="btn btn--secondary btn--tall" onClick={closeComposer}>
              Kanselahin
            </button>
          </>
        }
      >
        <form id="ticker-composer" onSubmit={handleBroadcast}>
          <div className="form-group">
            <label className="form-label" htmlFor="ticker-input">
              Mensahe
            </label>
            <textarea
              id="ticker-input"
              className="form-textarea"
              placeholder="BAGONG ULAT: Pormal nang nagtapos ang 662 mag-aaral…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
              rows={5}
              required
            />
            <div className="form-hint form-hint--right">{message.length}/280</div>
          </div>

          <div className="field-block">
            <span className="field-block__label">Mabilisang Simula</span>
            <div className="type-switch">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setMessage((prev) => (prev ? tpl + prev : tpl))}
                >
                  {tpl.trim()}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Sheet>
    </div>
  );
}

export default TickerManager;