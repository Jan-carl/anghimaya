import { useState, useEffect, useRef } from 'react';
import { initials, tagalogMonthYear } from '../lib/format.js';
import { pauseLenis, resumeLenis, pause3D, resume3D } from '../scene/scroll.js';
import {
  detectTagalogVoices,
  preprocessTagalogText,
  chunkTextForSpeech,
  createTagalogUtterance,
} from '../lib/tagalogTTS.js';

/**
 * ArticleReader Component:
 * Clean, flat, prestigious editorial reader for Ang Himaya:
 * - Natural native scrolling with Lenis paused & data-lenis-prevent
 * - Clean editorial styling: no gradients, no glowing dots, no vibe-coded gimmicks
 * - Floating dock with Views, Bookmark, Font Size (AA), and Share
 * - Synthesized TTS Narration with authentic Tagalog speech engine & voice detection
 * - Heritage Maroon (#6B0E1A) accents matching Ang Himaya
 */
export function ArticleReader({ article, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'xlarge'
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('himaya-bookmarks') || '[]');
      return article?.id ? saved.includes(article.id) : false;
    } catch {
      return false;
    }
  });
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const closingTimerRef = useRef(null);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    if (isPlayingRef.current) {
      window.speechSynthesis?.cancel();
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
    closingTimerRef.current = setTimeout(() => {
      onClose();
    }, 300);
  };


  // Tagalog TTS Voices State
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceInfo, setVoiceInfo] = useState({
    bestVoice: null,
    filipinoVoices: [],
    philippineEnglishVoices: [],
    compatibleVoices: [],
    tier: 'fallback',
    voiceLabel: 'Tagalog Mode (Phonetic)',
  });

  const timerRef = useRef(null);
  const utteranceRef = useRef(null);
  const overlayRef = useRef(null);
  const speechChunksRef = useRef([]);
  const chunkIndexRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Compute estimated narration length based on word count (approx 130 words/min)
  const wordCount = (article?.body || '').split(/\s+/).filter(Boolean).length;
  const totalSeconds = Math.max(90, Math.min(300, Math.round((wordCount / 130) * 60))) || 180;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toggle bookmark with localStorage persistence
  const toggleBookmark = () => {
    const nextState = !bookmarked;
    setBookmarked(nextState);
    if (!article?.id) return;
    try {
      const saved = JSON.parse(localStorage.getItem('himaya-bookmarks') || '[]');
      const updated = nextState
        ? Array.from(new Set([...saved, article.id]))
        : saved.filter((id) => id !== article.id);
      localStorage.setItem('himaya-bookmarks', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Track scroll progress within overlay
  const updateScrollProgress = () => {
    const el = overlayRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const scrollable = scrollHeight - clientHeight;
    if (scrollable > 0) {
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / scrollable) * 100)));
      setScrollProgress(pct);
    } else {
      setScrollProgress(100);
    }
  };

  const handleOverlayScroll = (e) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const scrollable = scrollHeight - clientHeight;
    if (scrollable > 0) {
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / scrollable) * 100)));
      setScrollProgress(pct);
    } else {
      setScrollProgress(100);
    }
  };

  // Synchronize scroll progress on mount, resize, and font size changes
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();

    return () => {
      el.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, [fontSize, article]);

  // Keyboard escape listener to close reader with smooth blur fade exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
    };
  }, [isClosing]);

  // Voice detection and asynchronous listener (SpeechSynthesis voiceschanged)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const syncVoices = () => {
      try {
        const list = window.speechSynthesis.getVoices() || [];
        setAvailableVoices(list);
        const detected = detectTagalogVoices(list);
        setVoiceInfo(detected);

        setSelectedVoice((prev) => {
          if (prev && list.some((v) => v.voiceURI === prev.voiceURI)) return prev;
          return detected.bestVoice;
        });
      } catch (err) {
        console.warn('Speech synthesis voice load warning:', err);
      }
    };

    syncVoices();

    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = syncVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Lock body scroll & pause Lenis and 3D rendering when reading; unlock on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    pauseLenis();
    pause3D();

    return () => {
      document.body.style.overflow = originalOverflow;
      resumeLenis();
      resume3D();
      isPlayingRef.current = false;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer interval for TTS playback counter
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= totalSeconds) {
            clearInterval(timerRef.current);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSeconds]);

  // Play next chunk in sequence (bypasses Chromium 15-second speech synthesis timeout)
  const playNextChunk = (forcedVoice = null) => {
    if (!isPlayingRef.current) return;
    const chunks = speechChunksRef.current;
    const idx = chunkIndexRef.current;

    if (!chunks || idx >= chunks.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      chunkIndexRef.current = 0;
      return;
    }

    const chunk = chunks[idx];
    const liveVoices = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const voiceToUse =
      forcedVoice ||
      selectedVoice ||
      detectTagalogVoices(liveVoices).bestVoice ||
      liveVoices.find((v) => v.default) ||
      liveVoices[0] ||
      null;

    const utterance = createTagalogUtterance(chunk, voiceToUse, voiceInfo.tier);
    utteranceRef.current = utterance;

    // Prevent Chromium garbage-collection bug where speaking stops prematurely
    if (typeof window !== 'undefined') {
      window.__himaya_active_utterance = utterance;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      if (!isPlayingRef.current) return;
      chunkIndexRef.current += 1;
      playNextChunk(voiceToUse);
    };

    utterance.onerror = (e) => {
      console.warn('TTS playback error on chunk', idx, ':', e.error);
      // Ignore user cancellations
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      if (isPlayingRef.current && chunkIndexRef.current < chunks.length - 1) {
        chunkIndexRef.current += 1;
        setTimeout(() => playNextChunk(voiceToUse), 60);
      } else {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Speech synthesis speak exception:', err);
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  // Note: Sentence chunking (22 words/chunk) natively prevents Chromium 15s timeout without watchdog jitter.


  // Web Speech API for Tagalog Synthesized Narration (TTS)
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Hindi suportado ang Speech Synthesis sa browser na ito.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      isPlayingRef.current = false;
      setIsPlaying(false);
      return;
    }

    // Unpause in case browser was stuck in paused state
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    // Raw text to speak
    const rawText = `${article.title}. ${article.deck || ''}. ${article.body || ''}`;
    const liveVoices = window.speechSynthesis.getVoices() || [];
    const activeVoice =
      selectedVoice ||
      detectTagalogVoices(liveVoices).bestVoice ||
      liveVoices.find((v) => v.default) ||
      liveVoices[0] ||
      null;

    // Preprocess text for Tagalog phonetics (e.g. 'mga' -> 'manga', 'ng' -> 'nang', glottal stops)
    const processedText = preprocessTagalogText(rawText, voiceInfo.tier);
    // Split into sentences for smooth streaming
    let chunks = chunkTextForSpeech(processedText, 22);
    if (!chunks || chunks.length === 0) {
      chunks = [processedText];
    }

    speechChunksRef.current = chunks;
    chunkIndexRef.current = 0;
    isPlayingRef.current = true;
    setIsPlaying(true);
    setElapsedSeconds(0);

    // Allow Chromium background audio thread 60ms to settle after cancel() before speaking
    setTimeout(() => {
      if (!isPlayingRef.current) return;
      playNextChunk(activeVoice);
    }, 60);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.deck || article.title,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  // 'Iginuhit' para sa kartun at drowing; 'Isinulat' para sa balita at artikulo.
  const isCartoon =
    article?.type === 'literary' || /KARTUN|DIBUHO|SILAKBO\s*[:/]/i.test(article?.category ?? '');
  const verb = isCartoon ? 'Iginuhit ' : 'Isinulat ';

  if (!article) return null;

  // Extract first letter for drop cap
  const bodyText = (article.body || '').trim();
  const firstLetter = bodyText.charAt(0) || 'A';
  const remainingBody = bodyText.slice(1);
  const paragraphs = remainingBody.split('\n\n').filter(Boolean);
  const firstParagraphRest = paragraphs[0] || '';
  const remainingParagraphs = paragraphs.slice(1);

  return (
    <div
      ref={overlayRef}
      onScroll={handleOverlayScroll}
      className={`tfm-reader-overlay ${isClosing ? 'tfm-reader-overlay--closing' : ''}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
      data-lenis-prevent
    >
      {/* TOPBAR: CLEAN EDITORIAL HEADER & SOLID 2PX PROGRESS BAR */}
      <header className="tfm-reader-topbar">
        <div className="tfm-reader-topbar__inner">
          <div className="tfm-reader-topbar__title-wrap">
            <span className="tfm-reader-topbar__brand">ANG HIMAYA</span>
            <span className="tfm-reader-topbar__divider" aria-hidden="true">/</span>
            <span className="tfm-reader-topbar__label">
              {article.category || article.type?.toUpperCase() || 'BALITA'}
            </span>
            <span className="tfm-reader-topbar__title" title={article.title}>
              — {article.title}
            </span>
          </div>

          <div className="tfm-reader-topbar__actions">
            <button
              type="button"
              className="tfm-reader-close-btn"
              onClick={handleClose}
              aria-label="Isara ang artikulo"
              title="Isara (Esc)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Clean Solid Reading Progress Bar */}
        <div
          className="tfm-reader-progress-track"
          role="progressbar"
          aria-valuenow={scrollProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="tfm-reader-progress-bar"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* MAIN READING CONTAINER & DOCK */}
      <div className="tfm-reader-container">
        <div className="tfm-reader-layout">
          {/* CENTER ARTICLE CARD */}
          <article className={`tfm-reader-card tfm-reader-card--font-${fontSize}`}>
            {/* CLEAN AUDIO PLAYER PILL (TAGALOG SPEECH ENGINE) */}
            <div className="tfm-audio-pill">
              <div className="tfm-audio-pill__primary">
                <button
                  type="button"
                  className="tfm-audio-play-btn"
                  onClick={toggleSpeech}
                  aria-label={isPlaying ? 'I-pause ang pagbasa' : 'Pakinggan ang balita sa Tagalog'}
                  title={isPlaying ? 'I-pause ang pagbasa' : 'Pakinggan ang balita sa Tagalog'}
                >
                  {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  )}
                </button>

                <div className="tfm-audio-info">
                  <div className="tfm-audio-label-row">
                    <span className="tfm-audio-label">PAKINGGAN ANG BALITA</span>
                  </div>
                  <span className="tfm-audio-subtext">
                    Boses sa Tagalog · {formatTime(elapsedSeconds)} / {formatTime(totalSeconds)}
                  </span>
                </div>

                <div className={`tfm-audio-waveform ${isPlaying ? 'tfm-audio-waveform--active' : ''}`} aria-hidden="true">
                  <div className="tfm-wave-bar" />
                  <div className="tfm-wave-bar" />
                  <div className="tfm-wave-bar" />
                  <div className="tfm-wave-bar" />
                  <div className="tfm-wave-bar" />
                  <div className="tfm-wave-bar" />
                  <div className="tfm-wave-bar" />
                  <div className="tfm-wave-bar" />
                </div>
              </div>

              {voiceInfo.compatibleVoices.length > 1 ? (
                <div className="tfm-audio-voice-row">
                  <span className="tfm-audio-voice-caption">Boses:</span>
                  <select
                    className="tfm-audio-voice-select"
                    value={selectedVoice?.voiceURI || ''}
                    onChange={(e) => {
                      const v = availableVoices.find((item) => item.voiceURI === e.target.value);
                      if (v) {
                        setSelectedVoice(v);
                        const detected = detectTagalogVoices([v, ...availableVoices]);
                        setVoiceInfo((prev) => ({
                          ...prev,
                          voiceLabel: detected.voiceLabel,
                          tier: detected.tier,
                        }));
                        if (isPlaying) {
                          window.speechSynthesis.cancel();
                          isPlayingRef.current = false;
                          setIsPlaying(false);
                        }
                      }
                    }}
                    aria-label="Pumili ng boses sa Tagalog"
                    title="Pumili ng boses sa Tagalog"
                  >
                    {voiceInfo.compatibleVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name.replace(/Online \(Natural\) - /g, '').replace(/ - English \(Philippines\)/g, ' (PH)')}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {/* ARTICLE HEAD & METADATA */}
            <div className="tfm-reader-head">
              <div className="tfm-meta">
                <span className="tfm-category">{article.category || 'BALITA'}</span>
                <span className="tfm-meta__dot">·</span>
                <span className="tfm-meta__time">
                  {tagalogMonthYear(article.published_at)} · {article.read_time || '4 min pagbasa'}
                </span>
                <span className="tfm-meta__dot">·</span>
                <span className="tfm-meta__scroll-hint">{scrollProgress}% nabasa</span>
              </div>

              <h1 className="tfm-reader-title">{article.title}</h1>

              {article.deck ? (
                <p className="tfm-reader-deck">{article.deck}</p>
              ) : null}

              <div className="tfm-reader-byline">
                <span className="avatar">{initials(article.author_name)}</span>
                <div>
                  <div className="byline__name">
                    {article.author_name?.includes(' at ')
                      ? `${verb}nina `
                      : `${verb}ni `}
                    {article.author_name}
                  </div>
                  <div className="byline__role">{article.author_role || 'Patnugot ng Ang Himaya'}</div>
                </div>
              </div>
            </div>

            {/* COVER MEDIA */}
            {article.cover_image_url ? (
              <figure className="tfm-reader-media">
                <img src={article.cover_image_url} alt={article.title} />
                {article.image_caption ? (
                  <figcaption>{article.image_caption}</figcaption>
                ) : null}
              </figure>
            ) : null}

            {/* ARTICLE BODY WITH DROP-CAP */}
            <div className="tfm-reader-body">
              <p className="tfm-reader-first-para">
                <span className="tfm-drop-cap" aria-hidden="true">
                  {firstLetter}
                </span>
                {firstParagraphRest}
              </p>

              {remainingParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* ARTICLE FOOTER & OFFICIAL SEAL */}
            <div className="tfm-reader-footer">
              <div className="tfm-editorial-seal">
                <img src="/anghimayalogo.png" alt="Ang Himaya Sagisag" />
                <div>
                  <strong>Ang Himaya</strong>
                  <span>Pluma ng Katotohanan, Haligi ng Katapatan</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* FLOATING READER DOCK (ALWAYS ANCHORED AT THE BOTTOM) */}
      <aside className="tfm-reader-dock" aria-label="Reading Controls">


            {/* Bookmark button with reading progress ring */}
            <div className="tfm-dock-bookmark-wrap" title={`Pag-usad sa pagbabasa: ${scrollProgress}%`}>
              <svg className="tfm-dock-progress-ring" width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
                <circle cx="19" cy="19" r="16" fill="none" stroke="#EAE5DE" strokeWidth="2" />
                <circle
                  cx="19"
                  cy="19"
                  r="16"
                  fill="none"
                  stroke="#6B0E1A"
                  strokeWidth="2.4"
                  strokeDasharray="100.53"
                  strokeDashoffset={Math.max(0, 100.53 - (scrollProgress / 100) * 100.53)}
                  strokeLinecap="round"
                  style={{
                    opacity: scrollProgress > 0 ? 1 : 0,
                  }}
                />
              </svg>
              <button
                type="button"
                className={`tfm-dock-btn tfm-dock-btn--bookmark ${bookmarked ? 'tfm-dock-btn--active' : ''}`}
                onClick={toggleBookmark}
                aria-label={bookmarked ? 'Alisin sa bookmark' : 'I-bookmark ang artikulo'}
                title={bookmarked ? `Na-bookmark na (${scrollProgress}% nabasa)` : `I-bookmark (${scrollProgress}% nabasa)`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>

            <div className="tfm-dock-divider" />

            {/* Desktop Font Size Switcher (AA) */}
            <div className="tfm-dock-font-picker">
              <span className="tfm-dock-font-label">AA</span>
              <button
                type="button"
                className={`tfm-dock-font-btn ${fontSize === 'normal' ? 'tfm-dock-font-btn--active' : ''}`}
                onClick={() => setFontSize('normal')}
                title="Katamtamang font"
              >
                A
              </button>
              <button
                type="button"
                className={`tfm-dock-font-btn ${fontSize === 'large' ? 'tfm-dock-font-btn--active' : ''}`}
                onClick={() => setFontSize('large')}
                title="Malaking font"
              >
                A+
              </button>
              <button
                type="button"
                className={`tfm-dock-font-btn ${fontSize === 'xlarge' ? 'tfm-dock-font-btn--active' : ''}`}
                onClick={() => setFontSize('xlarge')}
                title="Pinakamalaking font"
              >
                A++
              </button>
            </div>

            {/* Mobile Font Cycle Button */}
            <button
              type="button"
              className="tfm-dock-btn tfm-dock-btn--mobile-font"
              onClick={cycleFontSize}
              title={`Laki ng font: ${fontSize}`}
              aria-label="Baguhin ang laki ng font"
            >
              <span style={{ fontSize: fontSize === 'normal' ? '12px' : fontSize === 'large' ? '15px' : '18px', fontWeight: 800 }}>
                A
              </span>
            </button>

            <div className="tfm-dock-divider" />

            {/* Social Share & Copy Buttons */}
            <div className="tfm-dock-share">
              <a
                href="https://www.facebook.com/sharer/sharer.php"
                target="_blank"
                rel="noopener noreferrer"
                className="tfm-dock-btn"
                aria-label="I-share sa Facebook"
                title="Facebook"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <button
                type="button"
                className="tfm-dock-btn"
                onClick={handleShare}
                aria-label="I-share o Kopyahin ang link"
                title="I-share o Kopyahin ang link"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>

              {copied ? (
                <span className="tfm-dock-toast" role="status">
                  ✓ Na-kopya ang link!
                </span>
              ) : null}
            </div>
          </aside>
    </div>
  );
}

export default ArticleReader;
