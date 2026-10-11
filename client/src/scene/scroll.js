/**
 * Isang karaniwang Lenis instance na ibinabahagi ng 3D scene at ang navigation.
 * Ang scene ang may hawak nito — dito lamang kumakalapit ang iba pang bahagi.
 */
let lenis = null;
let sceneInstance = null;

export function registerSmoothScroll(instance) {
  lenis = instance;
}

export function releaseSmoothScroll() {
  lenis = null;
}

export function registerScene(instance) {
  sceneInstance = instance;
}

export function releaseScene() {
  sceneInstance = null;
}

export function pause3D() {
  if (sceneInstance) sceneInstance.pauseRendering();
}

export function resume3D() {
  if (sceneInstance) sceneInstance.resumeRendering();
}

export function pauseLenis() {
  if (lenis) lenis.stop();
}

export function resumeLenis() {
  if (lenis) lenis.start();
}

/**
 * Touch device (iPhone, Android). Walang Lenis sa mga ito — ginagamit ang
 * native na scroll ng browser.
 */
function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * ISANG pagkilos lang bawat tawag. Ang dating code ay nagta-trigger ng dalawang
 * sabay-sabay na smooth scroll (native + Lenis), kaya nagtatalon ang pahina sa
 * iPhone. Sa touch device ay instant na scroll — ang native smooth scroll ng
 * iOS ay may sariling easing na nagpapatigil-tigil habang nagscroll.
 */
export function scrollToTarget(target, { offset, duration = 1.0 } = {}) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const isTop = target === '#top' || target === 'top' || element?.id === 'top';
  const navHeight = document.getElementById('site-nav')?.offsetHeight || 64;
  const computedOffset = offset !== undefined ? offset : (isTop ? 0 : -navHeight);

  if (lenis) {
    lenis.scrollTo(element, { offset: computedOffset, duration });
    return;
  }

  const rect = element.getBoundingClientRect();
  const targetY = window.pageYOffset + rect.top + computedOffset;
  window.scrollTo({ top: Math.max(0, targetY), behavior: isTouchDevice() ? 'auto' : 'smooth' });
}

/** Balik sa itaas. Iisang landas para sa desktop at sa mobile. */
export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.0 });
    return;
  }
  window.scrollTo({ top: 0, behavior: isTouchDevice() ? 'auto' : 'smooth' });
}

/** Scroll sa ibaba ng 3D hero (sa unang seksyon ng nilalaman). */
export function scrollToContent() {
  scrollToTarget('#top-story', { offset: -80 });
}
