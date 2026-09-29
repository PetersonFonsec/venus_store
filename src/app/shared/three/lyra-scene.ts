import * as THREE from 'three';
import { createLyraBottle, LYRA_HEIGHT, LyraBottle } from './lyra-bottle';

/**
 * Renderer, studio lighting and camera choreography around the Lyra bottle.
 * Loaded with a dynamic import so three.js stays out of the initial (and SSR) bundle.
 */

export interface LyraSceneOptions {
  /** Transparent canvas so the page background shows through. */
  transparent?: boolean;
  reducedMotion?: boolean;
}

export interface LyraScene {
  /** Scroll story progress, 0..1. */
  setProgress(value: number): void;
  setPointer(x: number, y: number): void;
  dragBy(dx: number): void;
  resize(width: number, height: number): void;
  setActive(active: boolean): void;
  renderOnce(): void;
  dispose(): void;
}

interface CameraKey {
  at: number;
  distance: number;
  target: number; // target height, in bottle units
  elevation: number; // degrees
  explode: number;
  spin: number; // extra yaw, radians
}

// Keyframes for the scroll story: hero -> facets -> collar -> cap lifted -> hero again.
const KEYS: CameraKey[] = [
  { at: 0.0, distance: 3.9, target: 0.62, elevation: 8, explode: 0, spin: 0 },
  { at: 0.25, distance: 2.9, target: 0.45, elevation: 4, explode: 0, spin: Math.PI * 0.25 },
  { at: 0.5, distance: 1.55, target: 0.9, elevation: 12, explode: 0.05, spin: Math.PI * 0.55 },
  { at: 0.75, distance: 2.5, target: 1.0, elevation: 18, explode: 1, spin: Math.PI * 0.9 },
  { at: 1.0, distance: 3.9, target: 0.62, elevation: 8, explode: 0, spin: Math.PI * 2 },
];

function sampleKeys(progress: number): CameraKey {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = THREE.MathUtils.smootherstep((p - a.at) / (b.at - a.at), 0, 1);
  const lerp = (x: number, y: number) => x + (y - x) * t;
  return {
    at: p,
    distance: lerp(a.distance, b.distance),
    target: lerp(a.target, b.target),
    elevation: lerp(a.elevation, b.elevation),
    explode: lerp(a.explode, b.explode),
    spin: lerp(a.spin, b.spin),
  };
}

function gradientTexture(stops: [number, string][], width = 16, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Warm ivory studio with softboxes, baked into a PMREM environment for glass and metal. */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const studio = new THREE.Scene();
  const wallTexture = gradientTexture([
    [0, '#fffaf6'],
    [0.5, '#f1e4e2'],
    [1, '#b99aa0'],
  ]);
  const wall = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 16),
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }),
  );
  studio.add(wall);

  const panel = (w: number, h: number, intensity: number, position: THREE.Vector3Tuple) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity) }),
    );
    mesh.position.set(...position);
    mesh.lookAt(0, 0.6, 0);
    studio.add(mesh);
  };
  panel(1.4, 5, 5, [-3.6, 1.6, 2.4]); // tall key strip, front-left
  panel(1.0, 4, 3, [3.8, 1.2, 1.2]); // fill strip, right
  panel(4, 2.2, 2.2, [0, 5.5, 0.5]); // overhead softbox
  panel(3, 1.2, 1.6, [0, 1.2, -4.5]); // rim behind
  // Dark flags, as in glass product photography: they give facet edges their grey definition.
  panel(1.6, 6, 0.02, [-3.2, 1, -2.6]);
  panel(1.6, 6, 0.02, [3.2, 1, -2.6]);
  panel(6, 0.9, 0.05, [0, -1.6, 3.2]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(studio, 0.035).texture;
  pmrem.dispose();
  studio.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  });
  wallTexture.dispose();
  return texture;
}

/** Soft blush contact shadow, like the pink caustic shadow in the product photo. */
export function createContactShadow(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  // Fade to zero well inside the square, so the quad edges carry no alpha at all.
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 112);
  gradient.addColorStop(0, 'rgba(176, 82, 108, 0.55)');
  gradient.addColorStop(0.45, 'rgba(214, 132, 156, 0.22)');
  gradient.addColorStop(1, 'rgba(240, 190, 205, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    // Kept close to the base footprint (radius 0.5): wider than the visible field it would be clipped at the canvas edge.
    new THREE.PlaneGeometry(1.3, 1.3),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.002;
  mesh.scale.set(1.1, 0.85, 1);
  return mesh;
}

export function createLyraScene(canvas: HTMLCanvasElement, options: LyraSceneOptions = {}): LyraScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: options.transparent ?? true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const environment = createStudioEnvironment(renderer);
  scene.environment = environment;

  const hemi = new THREE.HemisphereLight('#fff6f2', '#e7c9cf', 0.7);
  const key = new THREE.DirectionalLight('#ffffff', 1.6);
  key.position.set(-2.5, 4, 3);
  const rim = new THREE.DirectionalLight('#ffe9ef', 1.1);
  rim.position.set(2.5, 2, -3);
  scene.add(hemi, key, rim);

  const bottle: LyraBottle = createLyraBottle();
  const pivot = new THREE.Group();
  pivot.add(bottle.root);
  scene.add(pivot);
  const shadow = createContactShadow();
  scene.add(shadow);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 40);
  const clock = new THREE.Clock();
  const reducedMotion = options.reducedMotion ?? false;

  let progress = 0;
  let smoothProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;
  let dragYaw = 0;
  let dragVelocity = 0;
  let idleYaw = 0;
  let active = true;
  let frame = 0;
  let aspect = 1;

  const target = new THREE.Vector3();

  function update(delta: number) {
    const ease = 1 - Math.pow(0.001, delta); // frame-rate independent smoothing
    smoothProgress += (progress - smoothProgress) * (reducedMotion ? 1 : ease * 0.9);
    smoothPointerX += (pointerX - smoothPointerX) * ease * 0.6;
    smoothPointerY += (pointerY - smoothPointerY) * ease * 0.6;

    dragYaw += dragVelocity;
    dragVelocity *= Math.pow(0.04, delta);
    if (!reducedMotion) idleYaw += delta * 0.22;

    const k = sampleKeys(smoothProgress);
    bottle.setExplode(k.explode);
    pivot.rotation.y = idleYaw + dragYaw + k.spin + smoothPointerX * 0.35;
    pivot.rotation.x = smoothPointerY * 0.06;
    pivot.position.y = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.9) * 0.012;

    // Narrow viewports need more distance so the bottle's width still fits the horizontal FOV.
    const fit = Math.max(1, 0.78 / aspect);
    const elevation = THREE.MathUtils.degToRad(k.elevation - smoothPointerY * 4);
    target.set(0, k.target, 0);
    camera.position.set(
      0,
      k.target + Math.sin(elevation) * k.distance * fit,
      Math.cos(elevation) * k.distance * fit,
    );
    camera.lookAt(target);
  }

  function render() {
    renderer.render(scene, camera);
  }

  function loop() {
    frame = requestAnimationFrame(loop);
    update(Math.min(clock.getDelta(), 1 / 20));
    render();
  }

  function start() {
    if (frame) return;
    clock.getDelta();
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  start();

  return {
    setProgress(value) {
      progress = value;
    },
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    dragBy(dx) {
      dragVelocity += dx * 0.0022;
    },
    resize(width, height) {
      aspect = width / Math.max(1, height);
      renderer.setSize(width, height, false);
      camera.aspect = aspect;
      // Mobile layout: lift the bottle into the upper part of the frame; the copy scrolls over the lower part.
      if (window.innerWidth < 768) camera.setViewOffset(width, height, 0, height * 0.1, width, height);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      if (!frame) {
        update(0);
        render();
      }
    },
    setActive(value) {
      active = value;
      if (active) start();
      else stop();
    },
    renderOnce() {
      update(0);
      render();
    },
    dispose() {
      stop();
      bottle.dispose();
      environment.dispose();
      shadow.geometry.dispose();
      const material = shadow.material as THREE.MeshBasicMaterial;
      material.map?.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}

export { LYRA_HEIGHT };
