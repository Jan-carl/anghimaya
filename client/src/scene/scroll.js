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
  window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
}

/** Scroll sa ibaba ng 3D hero (sa unang seksyon ng nilalaman). */
export function scrollToContent() {
  scrollToTarget('#top-story', { offset: -80 });
}