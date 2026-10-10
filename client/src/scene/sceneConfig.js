import * as THREE from 'three';

/**
 * Eksaktongkopya ng dating vanilla scene config (client/main.js).
 * Hindi binago ang anumang posisyon, rotasyon, sukat, ilaw, o shader param —
 * para manatiling pareho ang dating itsura.
 */
export const sceneConfig = {
  terrain: {
    url: '/assets/3d/mountain-terrain.glb',
    pos: new THREE.Vector3(-3.014314, 3.88574, 3.16509),
    rot: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(7.42697, 7.42697, 7.42697),
    baseColor: 0x1a060a,
    wireColor: '#ffd166',
    wave: {
      speed: 0.55,
      count: 10.0,
      width: 0.45,
      baseOpacity: 0.12,
      opacityBoost: 0.7,
      baseGlow: 1.3,
      glowBoost: 0.8,
      softness: 4.0,
      tiltX: 0.15,
      tiltZ: 0.95,
    },
  },
  logo: {
    url: '/assets/3d/ang-himaya-logo.glb',
    pos: new THREE.Vector3(1.512276, 7.35, 8.43717),
    rot: new THREE.Euler(-0.08, -0.22, 0.05),
    scale: new THREE.Vector3(0.74, 0.74, 0.74),
  },
  book: {
    url: '/assets/3d/book-opening.glb',
    pos: new THREE.Vector3(1.512276, 7.195612, 8.43717),
    rot: new THREE.Euler(2.674547, -0.345528, 1.38136),
    scale: new THREE.Vector3(0.908595, 0.908595, 0.908595),
    baseColor: 0x3a0d16,
    wireColor: '#ffd166',
    wave: {
      speed: 0.5,
      count: 6.0,
      width: 0.6,
      baseOpacity: 0.15,
      opacityBoost: 1.2,
      baseGlow: 1.6,
      glowBoost: 1.8,
      softness: 6.0,
      tiltX: -1.0,
      tiltZ: 1.0,
    },
  },
  camera: {
    fov: 45,
    near: 0.1,
    far: 1000,
    start: {
      pos: new THREE.Vector3(1.538258, 4.8871, 33.0),
      rot: new THREE.Euler(0.100384, 0.009165, -0.000923, 'XYZ'),
    },
    end: {
      pos: new THREE.Vector3(1.386963, 7.143568, 14.972588),
      rot: new THREE.Euler(0.007533, 0.009211, -0.000069, 'XYZ'),
    },
  },
  fog: { color: 0x0d0204, near: 38.0, far: 155.0 },
  ambient: { color: 0x3d0d16, intensity: 0.7 },
  pointLights: [
    { pos: [1.871, 4.082, 2.925], color: 0xfff0d0, intensity: 14, distance: 28.5, decay: 0.15 },
    { pos: [1.373, 5.816, 1.327], color: 0x9e1828, intensity: 8, distance: 0, decay: 2 },
    { pos: [-3.244, 4.609, 17.728], color: 0xfff4dc, intensity: 14, distance: 52.5, decay: 1.69 },
    { pos: [-0.875, 6.49, 1.834], color: 0xfff0d0, intensity: 8, distance: 0, decay: 2 },
    { pos: [-0.058, 5.424, -0.112], color: 0x801020, intensity: 3, distance: 0, decay: 2 },
  ],
  dirLights: [
    { pos: [10, 12, 10], color: 0xfff0cc, intensity: 4.2 },
    { pos: [-8, 6, 10], color: 0x8b1220, intensity: 2.8 },
    { pos: [2, 10, -8], color: 0xffe2a4, intensity: 2.2 },
  ],
  emblemKeyLight: { pos: [1.5, 9.0, 16.0], color: 0xfff6e5, intensity: 3.8 },
  maroonBounceLight: { pos: [1.5, 2.0, 10.0], color: 0x780e1a, intensity: 2.2 },
  sun: {
    texture: '/assets/celestial-sun-aura.png',
    size: 32.0,
    z: 6.0,
    light: { color: 0xfff5d0, intensity: 10.0, distance: 45.0, decay: 1.1, z: 6.8 },
  },
  renderer: { exposure: 1.15, maxPixelRatio: 2 },
  // Hangganan ng scroll flight path (multiply ng viewport height).
  scrollViewportHeight: 3.5,
  // Saan nagsisimula ang pagta-paliban ng 3D tungo sa nilalaman sa ibaba.
  contentThreshold: 0.82,
  audio: { src: '/assets/brown-noise.mp3', openHz: 18000, muffledHz: 320 },
};

/** Bilog ng camera flight path sa loob ng hero spacer. */
export const createCameraFlight = () => {
  const start = sceneConfig.camera.start;
  const end = sceneConfig.camera.end;

  return {
    startPos: start.pos.clone(),
    endPos: end.pos.clone(),
    startQuat: new THREE.Quaternion().setFromEuler(start.rot),
    endQuat: new THREE.Quaternion().setFromEuler(end.rot),
  };
};