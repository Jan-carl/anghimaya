import { useCallback, useEffect, useRef, useState } from 'react';
import { mountScene, unmountScene } from './HimayaScene.js';
import {
  registerSmoothScroll,
  releaseSmoothScroll,
  registerScene,
  releaseScene,
} from './scroll.js';

/**
 * Pinapigilang sukat ng paghihintay bago ang preloader ay kailanman
 * manatiling naka-block sa content. Kung tumatagal ang 3D scene,
 * ipinapakita na rin ang pahayagan.
 */
const PRELOADER_TIMEOUT_MS = 6000;

/**
 * Pinakamaikling oras na nakikita ang bar. Kung mabilis ang mga lokal na
 * GLB, hindi dapat pumutok lang ang mountain sa isang frame.
 */
const PRELOADER_MIN_MS = 1200;

/** Paghintay bago maging translucent, para makita ang huling fill. */
const PRELOADER_EXIT_DELAY_MS = 350;

const MOUNTAIN_MARK = '/assets/loading.png';

/** 1551x300 ang intrinsic na sukat ng loading.png — para walang layout shift. */
const MARK_W = 1551;
const MARK_H = 300;

/**
 * Ang 3D hero. Ang canvas ay nananatiling fixed sa buong scroll —
 * ang nilalaman sa ibaba ang dumadaloy sa ibabaw nito.
 */
export function SceneHero() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cueRef = useRef(null);
  const dismissTimer = useRef(null);
  const startedAt = useRef(0);

  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Isang beses lang na tinatawag para hindi ma-double ang timer.
  const dismiss = useCallback(() => {
    if (dismissTimer.current) return;
    // Pinapalampas ang minimum kung tapos na agad — hindi dapat pumutok.
    const elapsed = performance.now() - startedAt.current;
    const wait = Math.max(PRELOADER_MIN_MS - elapsed, PRELOADER_EXIT_DELAY_MS);
    dismissTimer.current = setTimeout(() => setLoaded(true), wait);
  }, []);

  // Progress callback: direkta sa DOM para walang re-render kada frame.
  // Ang `settled` ay lumalabas kahit may asset na NABIGO, kaya hindi
  // na natatanging nakasara ang preloader dahil sa isang nawawalang modelo.
  const handleProgress = useCallback(
    (value, meta) => {
      setProgress(value);
      if (meta && meta.settled >= meta.total) dismiss();
    },
    [dismiss],
  );

  const handleScrollProgress = useCallback((value) => {
    if (cueRef.current) {
      cueRef.current.style.opacity = String(Math.max(0, 1 - value * 7));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    startedAt.current = performance.now();

    // Failsafe: ilabas ang nilalaman kahit hindi natapos mag-load ang 3D.
    const failsafe = setTimeout(dismiss, PRELOADER_TIMEOUT_MS);

    let scene = null;

    try {
      scene = mountScene(canvas, {
        onProgress: handleProgress,
        onAudioChange: setAudioPlaying,
        onScrollProgress: handleScrollProgress,
      });

      sceneRef.current = scene;
      registerSmoothScroll(scene.lenis);
      registerScene(scene);
    } catch (err) {
      // Ang 3D ay enhancement lamang — hindi ito dapat pumigil sa pahayagan.
      console.error('[hero] hindi magawa ang 3D scene, ipinapakita na ang nilalaman:', err);
      dismiss();
      setLoaded(true);
    }

    return () => {
      clearTimeout(failsafe);
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
      unmountScene(scene);
      sceneRef.current = null;
      releaseSmoothScroll();
      releaseScene();
    };
  }, [handleProgress, handleScrollProgress, dismiss]);

  const handleAudioToggle = useCallback(() => {
    if (sceneRef.current?.audioUnavailable) return;
    sceneRef.current?.toggleAudio();
  }, []);

  return (
    <>
      <div className="scene" aria-hidden="true">
        <canvas ref={canvasRef} className="scene__canvas" />
      </div>

      <div className="scene__vignette" aria-hidden="true" />
      <div className="scene-spacer" aria-hidden="true" />

      <div className="scroll-cue" ref={cueRef} aria-hidden="true">
        <span className="scroll-cue__mouse">
          <span className="scroll-cue__dot" />
        </span>
        <span className="scroll-cue__label">I-scroll pababa</span>
      </div>

      <button
        type="button"
        className="audio-toggle"
        data-playing={audioPlaying}
        onClick={handleAudioToggle}
        aria-label={audioPlaying ? 'I-pause ang ambient na tunog' : 'I-play ang ambient na tunog'}
        aria-pressed={audioPlaying}
        hidden={Boolean(sceneRef.current?.audioUnavailable)}
      >
        {audioPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
            <line x1="22" x2="16" y1="9" y2="15" />
            <line x1="16" x2="22" y1="9" y2="15" />
          </svg>
        )}
      </button>

      <Preloader progress={progress} done={loaded} />
    </>
  );
}

/**
 * Ang preloader: ang mountain sa loading.png ang mismong loading bar.
 * Dalawang nakapatong na kopya ng larawan — ang malabong isa ay ang
 * "track", at ang maroon na isa ay pinuputol mula kanan ayon sa
 * `--p` hanggang 100%.
 */
function Preloader({ progress, done }) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  const settled = pct >= 100;

  const className = [
    'preloader',
    done ? 'preloader--done' : '',
    settled ? 'preloader--busy' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} aria-hidden={done}>
      <div className="preloader__inner">
        <span className="preloader__brand">Ang Himaya</span>

        <div
          className="preloader__meter"
          style={{ '--p': pct + '%' }}
          role="progressbar"
          aria-label="Naglo-load ang 3D na tanawin"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <img
            className="preloader__layer preloader__layer--track"
            src={MOUNTAIN_MARK}
            alt=""
            width={MARK_W}
            height={MARK_H}
            decoding="async"
          />

          <div className="preloader__fill">
            <img src={MOUNTAIN_MARK} alt="" width={MARK_W} height={MARK_H} decoding="async" />
          </div>

          <span className="preloader__edge" />
        </div>

        <p className="preloader__readout">
          <span>{settled ? 'Handa na' : 'Naglo-load'}</span>
          <span className="preloader__percent">{pct}%</span>
        </p>
      </div>
    </div>
  );
}

export default SceneHero;