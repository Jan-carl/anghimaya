import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import Lenis from 'lenis';
import { sceneConfig, createCameraFlight } from './sceneConfig.js';
import { wireVertexShader, wireFragmentShader } from './shaders.js';

const TOTAL_ASSETS = 3;

/**
 * Ang buong 3D na kapaligitan ng Ang Himaya.
 * Posesyon ng kamera, ilaw, fog, at scanline wave ay pareho sa orihinal.
 * May kumpleto na `destroy()` para sa React unmount / StrictMode.
 */
export class HimayaScene {
  constructor(canvas, { onProgress, onAudioChange, onScrollProgress } = {}) {
    this.canvas = canvas;
    this.onProgress = onProgress ?? (() => {});
    this.onAudioChange = onAudioChange ?? (() => {});
    this.onScrollProgress = onScrollProgress ?? (() => {});

    this.disposers = [];
    this.waveTargets = [];
    this.assetsSettled = 0;
    this.failedAssets = [];
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2(0, 0);
    this.centerpiece = 'logo';
    this.destroyed = false;

    this.scrollProgress = 0;
    this.smoothProgress = 0;
    this.viewportHeight = window.innerHeight;
    this.isRenderingActive = true;
    this.forcePaused = false;

    this.audio = {
      ctx: null,
      element: null,
      source: null,
      lowpass: null,
      gain: null,
      playing: false,
      muffled: false,
      autoSuspended: false,
    };

    this.initRenderer();
    this.initLoaders();
    this.initAudioGraph();
    this.initSmoothScroll();
    this.bindEvents();
    this.startLoop();
  }

  // ---------------------------------------------------------------- renderer

  initRenderer() {
    const { camera, renderer: rendererCfg, fog } = sceneConfig;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(fog.color, fog.near, fog.far);

    this.camera = new THREE.PerspectiveCamera(
      camera.fov,
      window.innerWidth / window.innerHeight,
      camera.near,
      camera.far,
    );

    this.flight = createCameraFlight();
    this.camera.position.copy(this.flight.startPos);
    this.camera.quaternion.copy(this.flight.startQuat);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, rendererCfg.maxPixelRatio));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = rendererCfg.exposure;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.lights = new THREE.Group();
    this.scene.add(this.lights);

    const ambient = new THREE.AmbientLight(sceneConfig.ambient.color, sceneConfig.ambient.intensity);
    this.lights.add(ambient);

    sceneConfig.dirLights.forEach(({ pos, color, intensity }) => {
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(...pos);
      this.lights.add(light);
    });

    sceneConfig.pointLights.forEach(({ pos, color, intensity, distance, decay }) => {
      const light = new THREE.PointLight(color, intensity, distance, decay);
      light.position.set(...pos);
      this.lights.add(light);
    });

    // Warm key light + maroon bounce, nakatuon sa sagisag.
    const emblemTarget = new THREE.Object3D();
    emblemTarget.position.copy(sceneConfig.logo.pos);
    this.lights.add(emblemTarget);

    const key = new THREE.DirectionalLight(sceneConfig.emblemKeyLight.color, sceneConfig.emblemKeyLight.intensity);
    key.position.set(...sceneConfig.emblemKeyLight.pos);
    key.target = emblemTarget;
    this.lights.add(key);

    const bounce = new THREE.DirectionalLight(sceneConfig.maroonBounceLight.color, sceneConfig.maroonBounceLight.intensity);
    bounce.position.set(...sceneConfig.maroonBounceLight.pos);
    bounce.target = emblemTarget;
    this.lights.add(bounce);

    // Radiant na celestial sun aura sa likod ng sagisag.
    this.sunTexture = new THREE.TextureLoader().load(sceneConfig.sun.texture);
    this.sunMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(sceneConfig.sun.size, sceneConfig.sun.size),
      new THREE.MeshBasicMaterial({
        map: this.sunTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    );
    this.sunMesh.position.set(sceneConfig.logo.pos.x, sceneConfig.logo.pos.y, sceneConfig.sun.z);
    this.scene.add(this.sunMesh);

    const sunLight = new THREE.PointLight(
      sceneConfig.sun.light.color,
      sceneConfig.sun.light.intensity,
      sceneConfig.sun.light.distance,
      sceneConfig.sun.light.decay,
    );
    sunLight.position.set(sceneConfig.logo.pos.x, sceneConfig.logo.pos.y, sceneConfig.sun.light.z);
    this.lights.add(sunLight);
  }

  initLoaders() {
    this.draco = new DRACOLoader();
    this.draco.setDecoderPath('/draco/gltf/');

    this.gltf = new GLTFLoader();
    this.gltf.setDRACOLoader(this.draco);

    this.loadTerrain();
    this.loadEmblem();
    this.loadBook();
  }

  // ------------------------------------------------------------------ models

  /** Magdagdag ng wireframe wave overlay sa bawat mesh ng isang modelo. */
  attachWaveOverlays(root, waveCfg, baseColor, wireColor, { roughness, metalness }) {
    const meshes = [];

    root.traverse((child) => {
      if (!child.isMesh || child.userData.wireframeOverlay) return;

      child.material = new THREE.MeshStandardMaterial({ color: baseColor, roughness, metalness });
      child.castShadow = true;
      child.receiveShadow = true;
      child.geometry.computeBoundingBox();

      meshes.push({
        mesh: child,
        bMin: child.geometry.boundingBox.min.clone(),
        bMax: child.geometry.boundingBox.max.clone(),
      });
    });

    meshes.forEach(({ mesh, bMin, bMax }) => {
      const target = this.createWaveTarget(waveCfg, bMin, bMax, wireColor);

      const overlay = mesh.clone();
      overlay.userData.wireframeOverlay = true;
      overlay.material = target.material;
      overlay.position.set(0, 0, 0);
      overlay.quaternion.identity();
      overlay.scale.set(1, 1, 1);
      overlay.castShadow = false;
      overlay.receiveShadow = false;
      overlay.renderOrder = mesh.renderOrder + 1;

      mesh.add(overlay);
      this.waveTargets.push(target);
    });
  }

  createWaveTarget(wave, bMin, bMax, wireColor = '#ffd166') {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(wireColor) },
        uDirection: { value: new THREE.Vector3() },
        uMin: { value: new THREE.Vector3() },
        uSpan: { value: 1 },
        uSpeed: { value: wave.speed },
        uCount: { value: wave.count },
        uWidth: { value: wave.width },
        uBaseOpacity: { value: wave.baseOpacity },
        uOpacityBoost: { value: wave.opacityBoost },
        uBaseGlow: { value: wave.baseGlow },
        uGlowBoost: { value: wave.glowBoost },
        uSoftness: { value: wave.softness },
      },
      vertexShader: wireVertexShader,
      fragmentShader: wireFragmentShader,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      blending: THREE.AdditiveBlending,
    });
    material.toneMapped = false;

    return { material, uniforms: material.uniforms, bMin, bMax, wave, wireColor };
  }

  loadTerrain() {
    const { terrain } = sceneConfig;

    this.gltf.load(
      terrain.url,
      (gltf) => {
        if (this.destroyed) return;

        const model = gltf.scene;
        model.position.copy(terrain.pos);
        model.rotation.copy(terrain.rot);
        model.scale.copy(terrain.scale);
        this.attachWaveOverlays(model, terrain.wave, terrain.baseColor, terrain.wireColor, {
          roughness: 0.9,
          metalness: 0.1,
        });

        this.scene.add(model);
        this.markAssetLoaded();
      },
      undefined,
      (err) => this.reportAssetFailure('terrain', err),
    );
  }

  loadEmblem() {
    const { logo } = sceneConfig;

    this.gltf.load(
      logo.url,
      (gltf) => {
        if (this.destroyed) return;

        const model = gltf.scene;
        model.position.copy(logo.pos);
        model.rotation.copy(logo.rot);
        model.scale.copy(logo.scale);

        model.traverse((child) => {
          if (!child.isMesh) return;
          if (child.name === 'CleanCrescentMesh') {
            child.material.blending = THREE.AdditiveBlending;
            child.material.depthWrite = false;
            child.material.transparent = true;
            child.castShadow = false;
            child.receiveShadow = false;
          } else {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.emblem = model;
        this.scene.add(model);
        this.markAssetLoaded();
      },
      undefined,
      (err) => this.reportAssetFailure('sagisag', err),
    );
  }

  loadBook() {
    const { book } = sceneConfig;

    this.gltf.load(
      book.url,
      (gltf) => {
        if (this.destroyed) return;

        const model = gltf.scene;
        model.position.copy(book.pos);
        model.rotation.copy(book.rot);
        model.scale.copy(book.scale);
        model.visible = this.centerpiece === 'book';
        this.attachWaveOverlays(model, book.wave, book.baseColor, book.wireColor, {
          roughness: 0.55,
          metalness: 0.25,
        });

        this.book = model;
        this.scene.add(model);
        this.markAssetLoaded();
      },
      undefined,
      (err) => this.reportAssetFailure('aklat', err),
    );
  }

  markAssetLoaded() {
    this.assetsSettled += 1;
    this.reportProgress();
  }

  /**
   * Isang asset na nabigo ay tinuturing na tapos na rin — para hindi
   * manatiling naka-block ang preloader kapag may isang modelo lang na nawala.
   *
   * @param {string} label Pangalan ng asset para sa mensahe
   * @param {Error} err Ang orihinal na error
   */
  reportAssetFailure(label, err) {
    this.failedAssets.push(label);
    this.assetsSettled += 1;
    console.error('[scene] nabigo ang pag-load ng ' + label + ':', err);
    this.reportProgress();
  }

  reportProgress() {
    this.onProgress(Math.min(this.assetsSettled / TOTAL_ASSETS, 1), {
      settled: this.assetsSettled,
      total: TOTAL_ASSETS,
      failed: [...this.failedAssets],
    });
  }

  // ------------------------------------------------------------------- audio

  initAudioGraph() {
    try {
      this.#buildAudioGraph();
    } catch (err) {
      // Ang audio ay opsyonal — hindi ito dapat pumigil sa 3D scene.
      console.warn('[scene] hindi magagamit ang ambient na tunog:', err.message);
      this.audioUnavailable = true;
    }
  }

  #buildAudioGraph() {
    const { audio } = sceneConfig;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    this.audio.ctx = new AudioContextCtor();

    const element = new Audio(audio.src);
    element.loop = true;
    element.crossOrigin = 'anonymous';
    element.preload = 'none';

    const source = this.audio.ctx.createMediaElementSource(element);
    const lowpass = this.audio.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = audio.openHz;
    lowpass.Q.value = 1e-4;

    const gain = this.audio.ctx.createGain();
    gain.gain.value = 1;

    source.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.audio.ctx.destination);

    Object.assign(this.audio, { element, source, lowpass, gain });
  }

  setMuffled(muffled) {
    const { ctx, lowpass, gain } = this.audio;
    if (!ctx || !lowpass || !gain) return;
    if (this.audio.muffled === muffled) return;

    this.audio.muffled = muffled;
    const now = ctx.currentTime;
    const target = muffled ? sceneConfig.audio.muffledHz : sceneConfig.audio.openHz;

    lowpass.frequency.cancelScheduledValues(now);
    lowpass.frequency.setValueAtTime(lowpass.frequency.value, now);
    lowpass.frequency.exponentialRampToValueAtTime(target, now + 1.2);

    // Dahan-dahang babaan ang dami habang lumilabas sa 3D mundo.
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(muffled ? 0.35 : 1, now + 1.2);
  }

  #setPlaying(playing) {
    this.audio.playing = playing;
    this.onAudioChange(playing);
  }

  /** Toggle ng ambient sound. Returns ang bagong estado. */
  async toggleAudio() {
    const { ctx, element, gain } = this.audio;
    if (!ctx || !element) return false;

    if (ctx.state === 'suspended') await ctx.resume();

    if (this.audio.playing) {
      this.audio.autoSuspended = false;
      element.pause();
      this.#setPlaying(false);
      return false;
    }

    this.audio.autoSuspended = false;
    if (gain) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(1, now);
    }

    try {
      await element.play();
      this.#setPlaying(true);
      return true;
    } catch (err) {
      console.warn('[scene] hindi ma-play ang tunog:', err.message);
      return false;
    }
  }

  fadeOutAndPause() {
    const { ctx, element, gain } = this.audio;
    if (!element || !this.audio.playing) return;

    const stop = () => {
      if (this.audio.autoSuspended && this.audio.playing) {
        element.pause();
        this.#setPlaying(false);
      }
    };

    if (!ctx || !gain) {
      stop();
      return;
    }

    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
    setTimeout(stop, 550);
  }

  resumeWithFade() {
    const { ctx, element, gain } = this.audio;
    if (!element || this.audio.playing) return;

    this.audio.autoSuspended = false;
    if (ctx?.state === 'suspended') ctx.resume();

    element
      .play()
      .then(() => {
        this.#setPlaying(true);
        if (!ctx || !gain) return;
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(1, now + 0.8);
      })
      .catch((err) => console.warn('[scene] hindi ma-resume ang tunog:', err.message));
  }

  pauseRendering() {
    this.forcePaused = true;
    this.isRenderingActive = false;
    if (this.canvas) this.canvas.style.visibility = 'hidden';
  }

  resumeRendering() {
    this.forcePaused = false;
    if (this.scrollProgress < 1.0) {
      this.isRenderingActive = true;
      if (this.canvas) this.canvas.style.visibility = '';
      this.clock.getDelta();
    }
  }

  // --------------------------------------------------------- scroll + events

  initSmoothScroll() {
    this.lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true });
    this.lenis.on('scroll', (event) => this.handleScroll(event));
  }

  handleScroll(event) {
    const maxScroll = sceneConfig.scrollViewportHeight * this.viewportHeight;
    this.scrollProgress = THREE.MathUtils.clamp(event.scroll / maxScroll, 0, 1);
    this.onScrollProgress(this.scrollProgress);

    // Papalabas na sa 3D mundo? Tahimikin ang ambient sound.
    const inContent = event.scroll > maxScroll * sceneConfig.contentThreshold;
    this.setMuffled(this.scrollProgress > 0.5);

    if (inContent && !this.audio.autoSuspended) {
      if (this.audio.playing) this.audio.autoSuspended = true;
      this.fadeOutAndPause();
    } else if (!inContent && this.audio.autoSuspended) {
      this.resumeWithFade();
    }

    // Kung nag-scroll pataas pabalik sa 3D hero, ibalik agad ang rendering
    if (this.scrollProgress < 1.0 && !this.isRenderingActive && !this.forcePaused) {
      this.isRenderingActive = true;
      if (this.canvas) this.canvas.style.visibility = '';
      this.clock.getDelta();
    }
  }

  bindEvents() {
    const onResize = () => {
      this.viewportHeight = window.innerHeight;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, sceneConfig.renderer.maxPixelRatio));
    };

    const onMouseMove = (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (this.isRenderingActive) {
          this.isRenderingActive = false;
          if (this.canvas) this.canvas.style.visibility = 'hidden';
        }
      } else if (this.scrollProgress < 1.0 && !this.forcePaused) {
        this.isRenderingActive = true;
        if (this.canvas) this.canvas.style.visibility = '';
        this.clock.getDelta();
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('visibilitychange', onVisibilityChange);
    this.disposers.push(() => window.removeEventListener('resize', onResize));
    this.disposers.push(() => window.removeEventListener('mousemove', onMouseMove));
    this.disposers.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));
  }

  // ------------------------------------------------------------------- loop

  startLoop() {
    const tick = (time) => {
      if (this.destroyed) return;
      this.rafId = requestAnimationFrame(tick);

      // Panatilihing tumatakbo ang Lenis smooth scroll para sa editorial content
      this.lenis?.raf(time);

      // Kapag nakarating na sa editorial content (100% natakpan ng publication shell),
      // o kapag naka-force pause (hal. binuksan ang ArticleReader), itigil ang 3D render loop
      // upang makatipid ng GPU at CPU resources.
      const atContent = this.scrollProgress >= 1.0;
      const flightSettled = Math.abs(this.smoothProgress - this.scrollProgress) < 0.001;

      if ((atContent && flightSettled) || this.forcePaused) {
        if (this.isRenderingActive) {
          this.isRenderingActive = false;
          if (this.canvas) this.canvas.style.visibility = 'hidden';
        }
        return;
      }

      if (!this.isRenderingActive && !this.forcePaused) {
        this.isRenderingActive = true;
        if (this.canvas) this.canvas.style.visibility = '';
        this.clock.getDelta();
      }

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      this.smoothProgress = THREE.MathUtils.damp(this.smoothProgress, this.scrollProgress, 10, delta);

      // Camera flight
      this.camera.position.lerpVectors(this.flight.startPos, this.flight.endPos, this.smoothProgress);
      this.camera.quaternion.slerpQuaternions(this.flight.startQuat, this.flight.endQuat, this.smoothProgress);
      this.camera.position.x += this.mouse.x * 0.25;
      this.camera.position.y += this.mouse.y * 0.15;

      // Ang centerpiece ay nananatiling nakatigil.
      if (this.centerpiece === 'logo' && this.emblem) {
        const { pos, rot } = sceneConfig.logo;
        this.emblem.position.set(pos.x, pos.y, pos.z);
        this.emblem.rotation.set(rot.x, rot.y, rot.z);
      } else if (this.book) {
        const { pos, rot } = sceneConfig.book;
        this.book.position.set(pos.x, pos.y, pos.z);
        this.book.rotation.set(rot.x, rot.y, rot.z);
      }

      this.updateWaves(elapsed);
      this.renderer.render(this.scene, this.camera);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  updateWaves(elapsed) {
    const tilt = new THREE.Vector3();

    this.waveTargets.forEach(({ uniforms, bMin, bMax, wave }) => {
      uniforms.uTime.value = elapsed;
      uniforms.uSpeed.value = wave.speed;
      uniforms.uCount.value = wave.count;
      uniforms.uWidth.value = wave.width;
      uniforms.uBaseOpacity.value = wave.baseOpacity;
      uniforms.uOpacityBoost.value = wave.opacityBoost;
      uniforms.uBaseGlow.value = wave.baseGlow;
      uniforms.uGlowBoost.value = wave.glowBoost;
      uniforms.uSoftness.value = wave.softness;

      tilt.set(wave.tiltX, 1, wave.tiltZ).normalize();
      uniforms.uDirection.value.copy(tilt);

      const near = new THREE.Vector3(
        tilt.x >= 0 ? bMin.x : bMax.x,
        tilt.y >= 0 ? bMin.y : bMax.y,
        tilt.z >= 0 ? bMin.z : bMax.z,
      );
      const far = new THREE.Vector3(
        tilt.x >= 0 ? bMax.x : bMin.x,
        tilt.y >= 0 ? bMax.y : bMin.y,
        tilt.z >= 0 ? bMax.z : bMin.z,
      );

      uniforms.uSpan.value = Math.max(
        far.x * tilt.x + far.y * tilt.y + far.z * tilt.z - (near.x * tilt.x + near.y * tilt.y + near.z * tilt.z),
        0.001,
      );
      uniforms.uMin.value.copy(near);
    });
  }

  // ---------------------------------------------------------------- teardown

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    cancelAnimationFrame(this.rafId);
    this.disposers.forEach((dispose) => dispose());
    this.disposers = [];

    this.audio.element?.pause();
    this.audio.element?.removeAttribute('src');
    this.audio.ctx?.close?.().catch(() => {});

    this.lenis?.destroy();
    this.draco?.dispose();

    this.scene?.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      const material = object.material;
      if (!material) return;
      (Array.isArray(material) ? material : [material]).forEach((entry) => entry.dispose());
    });

    this.sunTexture?.dispose();
    this.waveTargets = [];
    this.renderer?.dispose();

    this.onProgress = () => {};
    this.onAudioChange = () => {};
    this.onScrollProgress = () => {};
  }
}

/** Guard laban sa dalawang WebGL context (React StrictMode / fast refresh). */
let activeScene = null;

export function mountScene(canvas, handlers) {
  activeScene?.destroy();
  activeScene = new HimayaScene(canvas, handlers);
  return activeScene;
}

export function unmountScene(scene) {
  scene?.destroy();
  if (activeScene === scene) activeScene = null;
}