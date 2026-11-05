import * as THREE from 'three';

/**
 * "Lights on" for the Land Cruiser — physically based, no glow sprites:
 *  - the front lamp material's emissive atlas fades up (LED headlamps, DRLs, tail segments)
 *  - the rear red lens (Lamp_Red) is given its own red emissive glow
 *  - two real low-beam spot lights throw light on the floor ahead of the car, and two soft
 *    red point lights wash the floor behind it
 *
 * Everything is driven by two numbers:
 *   level — 0..1, how far the lights have faded on
 *   boost — 0..1, how loud the engine / exhaust is right now (front AND rear get brighter)
 *
 * The lights stay in the scene at intensity 0 while "off", so the light count never changes
 * (switching it would force every material to recompile and cause a hitch).
 *
 * Coordinates are in the normalised car frame (floor y = 0, nose towards +z).
 */

export interface CarLightLayout {
  /** low-beam spot origin (x is mirrored for the two sides) */
  head: [number, number, number];
  /** where each low beam points (x is mirrored) */
  headTarget: [number, number, number];
  /** red wash behind the car (x is mirrored) */
  tail: [number, number, number];
  /** colour of the low beams (default: warm white) */
  beamColor?: number;
  /** emissive colour of the front lamp lens when it is on (default: keep the model's own) */
  lampColor?: number;
  /** strength of the lens itself relative to the light strip (default 1) */
  lampGain?: number;
  /** the headlamp's LED points, inner -> outer, right-hand lamp (mirrored for the left): drawn as a light strip with glowing dots */
  ledDots?: [number, number, number][];
}

export const LAND_CRUISER_LIGHTS: CarLightLayout = {
  head: [0.72, 1.02, 2.5],
  headTarget: [0.45, 0, 7.5],
  tail: [0.8, 0.95, -2.75],
};

export const MAYBACH_LIGHTS: CarLightLayout = {
  head: [0.66, 0.74, 2.55],
  headTarget: [0.42, 0, 8],
  tail: [0.72, 0.88, -2.8],
  // cold blue-white Digital-Light look: blue lens, blue light strip with three LED points
  beamColor: 0xcfe2ff,
  lampColor: 0x2f86ff,
  lampGain: 0.4,
  // the three LED elements of the Digital-Light headlamp (measured on maybach.glb)
  ledDots: [
    [0.673, 0.714, 2.42],
    [0.785, 0.741, 2.355],
    [0.886, 0.752, 2.226],
  ],
};

export interface CarLightMaterials {
  lamp: THREE.MeshStandardMaterial | null;
  lampRed: THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | null;
}

/* ------------------------------------------------------------------ */
/*  Blue light signature (strip + three LED points + soft halo)        */
/* ------------------------------------------------------------------ */

interface Signature {
  group: THREE.Group;
  sides: { side: number; group: THREE.Group }[];
  core: THREE.MeshBasicMaterial;
  halo: THREE.MeshBasicMaterial;
  dots: THREE.MeshBasicMaterial;
  bigGlow: THREE.SpriteMaterial;
  dotGlow: THREE.SpriteMaterial;
  dispose: () => void;
}

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.22, 'rgba(255,255,255,0.5)');
  gr.addColorStop(0.55, 'rgba(255,255,255,0.12)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function buildSignature(dotsRight: [number, number, number][]): Signature | null {
  if (dotsRight.length < 3) return null;
  const group = new THREE.Group();
  const flat = { transparent: true, opacity: 0, toneMapped: false, depthWrite: false, depthTest: false } as const;
  const core = new THREE.MeshBasicMaterial({ color: 0xdcedff, ...flat });
  const halo = new THREE.MeshBasicMaterial({ color: 0x2a7bff, ...flat, blending: THREE.AdditiveBlending });
  const dots = new THREE.MeshBasicMaterial({ color: 0xffffff, ...flat });
  const tex = glowTexture();
  const bigGlow = new THREE.SpriteMaterial({ map: tex, color: 0x2f7fff, ...flat, blending: THREE.AdditiveBlending });
  const dotGlow = new THREE.SpriteMaterial({ map: tex, color: 0xa6ceff, ...flat, blending: THREE.AdditiveBlending });
  const geos: THREE.BufferGeometry[] = [];
  const sides: { side: number; group: THREE.Group }[] = [];
  const FRONT = 0.008; // lift everything just in front of the lens

  for (const side of [1, -1]) {
    const sg = new THREE.Group();
    sides.push({ side, group: sg });
    group.add(sg);
    const d = dotsRight.map(([x, y, z]) => new THREE.Vector3(x * side, y, z + FRONT));
    // the strip runs through the three LED points and a little beyond both ends
    const first = d[0].clone().addScaledVector(d[1].clone().sub(d[0]), -0.55);
    const last = d[d.length - 1].clone().addScaledVector(d[d.length - 1].clone().sub(d[d.length - 2]), 0.55);
    const curve = new THREE.CatmullRomCurve3([first, ...d, last]);
    const coreGeo = new THREE.TubeGeometry(curve, 48, 0.004, 6, false);
    const haloGeo = new THREE.TubeGeometry(curve, 48, 0.012, 8, false);
    geos.push(coreGeo, haloGeo);
    sg.add(new THREE.Mesh(coreGeo, core), new THREE.Mesh(haloGeo, halo));
    for (const c of d) {
      const g = new THREE.SphereGeometry(0.0115, 16, 12);
      geos.push(g);
      const dot = new THREE.Mesh(g, dots);
      dot.position.copy(c);
      const sp = new THREE.Sprite(dotGlow);
      sp.position.copy(c);
      sp.scale.setScalar(0.15);
      sg.add(dot, sp);
    }
    const big = new THREE.Sprite(bigGlow);
    big.position.copy(d[1]).add(new THREE.Vector3(0.02 * side, 0, 0.06));
    big.scale.set(0.8, 0.42, 1);
    sg.add(big);
  }
  group.renderOrder = 10;
  group.traverse((o) => (o.renderOrder = 10));
  return {
    group,
    sides,
    core,
    halo,
    dots,
    bigGlow,
    dotGlow,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      [core, halo, dots, bigGlow, dotGlow].forEach((m) => m.dispose());
      tex.dispose();
    },
  };
}

export interface CarLights {
  group: THREE.Group;
  setLevel: (level: number, boost?: number) => void;
  /** where the camera is, in the car frame: the blue light strip is only drawn from the front half */
  setViewer: (pos: THREE.Vector3) => void;
  /** move the same lights onto another car (light count never changes → no shader recompile) */
  setCar: (mats: CarLightMaterials, layout: CarLightLayout) => void;
  dispose: () => void;
}

const BEAM_INTENSITY = 130; // candela, with decay 2 (at factor 1)
const TAIL_GLOW = 14; // candela of the red wash behind the car
const RED_LENS_EMISSIVE = 2.4;

// brightness factor = level * (FLOOR + RANGE * boost): dim while cranking, surging with the exhaust
const FLOOR = 0.5;
const RANGE = 1.6;

export function createCarLights(
  lamp: THREE.MeshStandardMaterial | null,
  lampRed: THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | null = null,
  layout: CarLightLayout = LAND_CRUISER_LIGHTS
): CarLights {
  const group = new THREE.Group();
  const spots: THREE.SpotLight[] = [];
  const tails: THREE.PointLight[] = [];
  let curLamp: THREE.MeshStandardMaterial | null = null;
  let curReds: THREE.MeshStandardMaterial[] = [];
  let baseEmissive = 1;
  let baseReds: number[] = [];
  let lastLevel = 0;
  let lastBoost = 0.35;

  let sig: Signature | null = null;
  let lampGain = 1;
  let sigK = 0;
  // camera position in the car frame (full vector, updated every frame)
  const viewer = new THREE.Vector3(0, 1.2, 8);
  let curDots: [number, number, number][] | null = null;
  const tmpP = new THREE.Vector3();
  const tmpV = new THREE.Vector3();
  const tmpN = new THREE.Vector3();
  // The strip is drawn on top of the (recessed) lamp, so it must only be shown while that lamp
  // really faces the camera. This is an angle test between the lamp's outward direction and the
  // line to the camera (it does NOT depend on how far the camera is from the car's centre line,
  // so turning the car a few degrees can no longer switch the lights off).
  const syncSigVisible = () => {
    if (!sig) return;
    sig.group.visible = sigK > 0.01;
    if (!sigK || !curDots) return;
    const mid = curDots[Math.min(1, curDots.length - 1)];
    for (const { side, group: g } of sig.sides) {
      tmpP.set(mid[0] * side, mid[1], mid[2]);
      tmpV.copy(viewer).sub(tmpP);
      const len = tmpV.length() || 1;
      tmpN.set(side * 0.45, 0, 1).normalize(); // lamp faces forward and a little outward
      const cosA = tmpV.dot(tmpN) / len;
      g.visible = cosA > (g.visible ? 0.1 : 0.18); // small hysteresis → no flicker at the edge
    }
  };
  const sigCache = new Map<CarLightLayout, Signature | null>();
  const DEFAULT_BEAM = 0xfff0d8;

  const sides = [-1, 1];
  for (const side of sides) {
    const spot = new THREE.SpotLight(DEFAULT_BEAM, 0, 18, 0.42, 0.95, 2);
    spot.castShadow = false;
    group.add(spot, spot.target);
    spots.push(spot);
    const tail = new THREE.PointLight(0xff1a14, 0, 7, 2);
    group.add(tail);
    tails.push(tail);
  }

  const place = (l: CarLightLayout) => {
    sides.forEach((side, i) => {
      spots[i].position.set(side * l.head[0], l.head[1], l.head[2]);
      // low beam: aimed ahead and down, slightly toward the centre line
      spots[i].target.position.set(side * l.headTarget[0], l.headTarget[1], l.headTarget[2]);
      tails[i].position.set(side * l.tail[0], l.tail[1], l.tail[2]);
      spots[i].color.set(l.beamColor ?? DEFAULT_BEAM);
    });
  };

  const apply = (level: number, boost: number) => {
    // brightness factor = level * (FLOOR + RANGE * boost): dim while cranking, surging with the exhaust
    const f = level * (FLOOR + RANGE * Math.min(1, Math.max(0, boost)));
    for (const sp of spots) sp.intensity = BEAM_INTENSITY * f;
    for (const t of tails) t.intensity = TAIL_GLOW * f;
    if (curLamp) curLamp.emissiveIntensity = baseEmissive * f * lampGain;
    if (sig) {
      const k = Math.min(1, f / 1.5);
      sig.core.opacity = k;
      sig.halo.opacity = 0.7 * k;
      sig.dots.opacity = k;
      sig.bigGlow.opacity = 0.7 * k;
      sig.dotGlow.opacity = 0.9 * k;
      sigK = k;
      syncSigVisible();
    }
    curReds.forEach((m, i) => {
      m.emissiveIntensity = (baseReds[i] ?? RED_LENS_EMISSIVE) * f;
    });
  };

  const setCar = (m: CarLightMaterials, l: CarLightLayout) => {
    // switch the previous car's lamps fully off
    if (curLamp) curLamp.emissiveIntensity = 0;
    curReds.forEach((r) => (r.emissiveIntensity = 0));
    if (sig) {
      sig.group.visible = false;
      sigK = 0;
      group.remove(sig.group);
      sig = null;
    }
    curLamp = m.lamp;
    lampGain = l.lampGain ?? 1;
    if (curLamp && l.lampColor !== undefined) {
      curLamp.emissive.set(l.lampColor);
      curLamp.color.set(0x050d1c); // dark lens body, so the blue light reads as light and not as grey plastic
    }
    curDots = l.ledDots ?? null;
    if (l.ledDots) {
      if (!sigCache.has(l)) sigCache.set(l, buildSignature(l.ledDots));
      sig = sigCache.get(l) ?? null;
      if (sig) group.add(sig.group);
    }
    baseEmissive = curLamp ? curLamp.emissiveIntensity || 1 : 1;
    curReds = m.lampRed ? (Array.isArray(m.lampRed) ? m.lampRed : [m.lampRed]) : [];
    baseReds = curReds.map(() => RED_LENS_EMISSIVE);
    for (const r of curReds) r.emissive.set(0xff1408);
    place(l);
    apply(lastLevel, lastBoost);
  };

  const setViewer = (pos: THREE.Vector3) => {
    viewer.copy(pos);
    syncSigVisible();
  };

  const setLevel = (level: number, boost = 0.35) => {
    lastLevel = level;
    lastBoost = boost;
    apply(level, boost);
  };

  setCar({ lamp, lampRed }, layout);
  setLevel(0);

  return {
    group,
    setLevel,
    setViewer,
    setCar,
    dispose: () => {
      spots.forEach((sp) => sp.dispose());
      tails.forEach((t) => t.dispose());
      sigCache.forEach((v) => v?.dispose());
      sigCache.clear();
    },
  };
}
