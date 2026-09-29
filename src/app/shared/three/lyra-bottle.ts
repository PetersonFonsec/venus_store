import * as THREE from 'three';

/**
 * Procedural reconstruction of the Eudora Lyra bottle, built with the img2threejs pipeline.
 *
 * Every dimension below comes from the validated sculpt spec (object-sculpt-spec.json), measured
 * from the reference photo: unit = girdle diameter, Y up, base at Y = 0, front = +Z.
 * The body, liquid and cap are 8-segment lathes, which yields the octagonal facets directly.
 */

const FACET_ALIGN = Math.PI / 8; // turn the octagon so a flat facet (not an edge) faces +Z

const BODY_PROFILE: [number, number][] = [
  [0.0, 0.0], [0.335, 0.0], [0.37, 0.0473], [0.445, 0.1607], [0.5, 0.2646],
  [0.222, 0.8014], [0.196, 0.8278], [0.176, 0.8363],
];
const LIQUID_PROFILE: [number, number][] = [
  [0.0, 0.0756], [0.33, 0.0756], [0.408, 0.1607], [0.462, 0.2646], [0.232, 0.7277], [0.0, 0.7277],
];
const CAP_PROFILE: [number, number][] = [
  [0.0, 0.0], [0.23, 0.0], [0.285, 0.035], [0.296, 0.1106], [0.278, 0.172], [0.2, 0.2051],
  [0.11, 0.224], [0.0, 0.2277],
];

const COLLAR = { y0: 0.8354, y1: 0.9667, radius: 0.176 };
const ACTUATOR = { y0: 0.9648, y1: 1.0301, radius: 0.114 };
const STEM = { y0: 1.0253, y1: 1.1765, radius: 0.055 };
const CAP_BASE_Y = 1.0282;
const KNURL_ROWS = [0.861, 0.888, 0.914, 0.941];
const KNURL_PER_ROW = 24;

export const LYRA_HEIGHT = CAP_BASE_Y + CAP_PROFILE[CAP_PROFILE.length - 1][1];

export type LyraPartName = 'body' | 'liquid' | 'collar' | 'pump' | 'cap' | 'wordmark';

export interface LyraBottle {
  root: THREE.Group;
  parts: Record<LyraPartName, THREE.Object3D>;
  /** 0 = assembled, 1 = exploded (cap and pump lifted off the neck). */
  setExplode(amount: number): void;
  dispose(): void;
}

function lathe(points: [number, number][], segments = 8): THREE.LatheGeometry {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(Math.max(0.0001, x), y)),
    segments,
  );
}

function cylinder(spec: { y0: number; y1: number; radius: number }, segments = 48): THREE.CylinderGeometry {
  const height = spec.y1 - spec.y0;
  const geometry = new THREE.CylinderGeometry(spec.radius, spec.radius, height, segments, 1);
  geometry.translate(0, spec.y0 + height / 2, 0);
  return geometry;
}

/** Vertical colour gradient for the liquid: deeper pink at the pavilion, paler under the shoulder. */
function paintLiquidGradient(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute('position');
  const bottom = new THREE.Color('#cf6784');
  const top = new THREE.Color('#eb9db2');
  const color = new THREE.Color();
  const colors = new Float32Array(position.count * 3);
  const [yMin, yMax] = [LIQUID_PROFILE[0][1], LIQUID_PROFILE[LIQUID_PROFILE.length - 1][1]];
  for (let i = 0; i < position.count; i++) {
    const t = THREE.MathUtils.clamp((position.getY(i) - yMin) / (yMax - yMin), 0, 1);
    color.copy(bottom).lerp(top, THREE.MathUtils.smootherstep(t, 0, 1));
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

function createWordmarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 420;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '500 190px "Cormorant Garamond", "Didot", "Bodoni 72", Georgia, serif';
    ctx.fillText('EUDORA', canvas.width / 2, 210);
    ctx.font = '600 76px "Manrope", "Helvetica Neue", Arial, sans-serif';
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '22px';
    ctx.fillText('LYRA', canvas.width / 2 + 11, 350);
    texture.needsUpdate = true;
  };

  draw();
  // Webfonts may still be loading on first paint; redraw once they are ready.
  document.fonts?.ready.then(draw).catch(() => undefined);
  return texture;
}

export function createLyraBottle(): LyraBottle {
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const glass = track(new THREE.MeshPhysicalMaterial({
    color: '#fdf8f9',
    roughness: 0.035,
    metalness: 0,
    transmission: 1,
    ior: 1.5,
    thickness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.0525,
    specularIntensity: 0.9,
    envMapIntensity: 0.75,
    flatShading: true,
    transparent: true,
  }));
  const crystal = track(new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.02,
    metalness: 0,
    transmission: 1,
    ior: 1.6,
    thickness: 0.6,
    clearcoat: 1,
    clearcoatRoughness: 0.0525,
    envMapIntensity: 0.8,
    flatShading: true,
    transparent: true,
  }));
  // Opaque on purpose: three.js leaves transmissive meshes out of the transmission buffer, so a
  // transmissive liquid would vanish when seen through the transmissive glass.
  const liquid = track(new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.2,
    clearcoat: 0.6,
    clearcoatRoughness: 0.0525,
    emissive: '#7a2440',
    emissiveIntensity: 0.08,
    envMapIntensity: 0.45,
    flatShading: true,
  }));
  const silver = track(new THREE.MeshStandardMaterial({
    color: '#eeedf0',
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 1.6,
  }));
  const chrome = track(new THREE.MeshStandardMaterial({
    color: '#f2f2f5',
    metalness: 1,
    roughness: 0.08,
    envMapIntensity: 1.7,
  }));
  const wordmarkTexture = track(createWordmarkTexture());
  const ink = track(new THREE.MeshStandardMaterial({
    map: wordmarkTexture,
    transparent: true,
    roughness: 0.6,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  }));

  // Mesh names match the sculpt spec component ids, so every part stays selectable/explodable.
  const root = new THREE.Group();
  root.name = 'Eudora Lyra bottle';

  // Body + liquid share the facet orientation.
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';
  bodyGroup.rotation.y = FACET_ALIGN;
  const bodyMesh = new THREE.Mesh(track(lathe(BODY_PROFILE)), glass);
  bodyMesh.name = 'body-glass';
  bodyMesh.renderOrder = 2;
  const liquidGeometry = track(lathe(LIQUID_PROFILE));
  paintLiquidGradient(liquidGeometry);
  const liquidMesh = new THREE.Mesh(liquidGeometry, liquid);
  liquidMesh.name = 'liquid';
  bodyGroup.add(liquidMesh, bodyMesh);

  // Printed wordmark on the front crown facet, tilted to the facet angle.
  const wordmark = new THREE.Mesh(track(new THREE.PlaneGeometry(0.275, 0.113)), ink);
  wordmark.name = 'wordmark';
  // Facet distance at Y=0.48 is 0.359 (r=0.388 x cos 22.5deg); sit just proud of it.
  wordmark.position.set(0, 0.48, 0.362);
  wordmark.rotation.x = -0.447;
  wordmark.renderOrder = 3;

  // Collar with the 4 x 24 dot knurl: one InstancedMesh (one draw call) per row.
  const collar = new THREE.Group();
  collar.name = 'collar';
  const collarBand = new THREE.Mesh(track(cylinder(COLLAR)), silver);
  collarBand.name = 'collar-band';
  collar.add(collarBand);
  const dot = track(new THREE.SphereGeometry(0.5, 12, 8));
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3(0.012, 0.021, 0.024);
  const p = new THREE.Vector3();
  KNURL_ROWS.forEach((y, row) => {
    const knurl = new THREE.InstancedMesh(dot, silver, KNURL_PER_ROW);
    knurl.name = `knurl-row-${row}`;
    for (let i = 0; i < KNURL_PER_ROW; i++) {
      const angle = ((7.5 + (i * 360) / KNURL_PER_ROW) * Math.PI) / 180;
      p.set(Math.cos(angle) * COLLAR.radius, y, -Math.sin(angle) * COLLAR.radius);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      knurl.setMatrixAt(i, m.compose(p, q, s));
    }
    knurl.instanceMatrix.needsUpdate = true;
    collar.add(knurl);
  });

  // Pump: actuator ring + stem with the dark spray orifice, visible through the crystal cap.
  const pump = new THREE.Group();
  pump.name = 'pump';
  const actuator = new THREE.Mesh(track(cylinder(ACTUATOR)), chrome);
  actuator.name = 'actuator';
  const stem = new THREE.Mesh(track(cylinder(STEM, 32)), chrome);
  stem.name = 'stem';
  pump.add(actuator, stem);
  const orifice = new THREE.Mesh(
    track(new THREE.CircleGeometry(0.008, 16)),
    track(new THREE.MeshBasicMaterial({ color: '#2a2a30' })),
  );
  orifice.name = 'nozzle-orifice';
  orifice.position.set(0, STEM.y1 - 0.03, STEM.radius + 0.0005);
  pump.add(orifice);

  const cap = new THREE.Group();
  cap.name = 'cap';
  cap.position.y = CAP_BASE_Y;
  const capMesh = new THREE.Mesh(track(lathe(CAP_PROFILE)), crystal);
  capMesh.name = 'cap-crystal';
  capMesh.rotation.y = FACET_ALIGN;
  capMesh.renderOrder = 4;
  cap.add(capMesh);

  root.add(bodyGroup, wordmark, collar, pump, cap);

  const parts: Record<LyraPartName, THREE.Object3D> = {
    body: bodyGroup,
    liquid: liquidMesh,
    collar,
    pump,
    cap,
    wordmark,
  };

  return {
    root,
    parts,
    setExplode(amount: number) {
      const t = THREE.MathUtils.clamp(amount, 0, 1);
      const e = t * t * (3 - 2 * t);
      cap.position.y = CAP_BASE_Y + e * 0.42;
      cap.rotation.y = e * Math.PI * 0.35;
      pump.position.y = e * 0.2;
      collar.position.y = e * 0.07;
    },
    dispose() {
      disposables.forEach((item) => item.dispose());
    },
  };
}
