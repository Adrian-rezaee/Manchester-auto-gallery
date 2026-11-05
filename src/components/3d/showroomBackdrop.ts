import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * MANCHESTER AUTO GALLERY — glass-front showroom backdrop.
 *
 * Modelled on the real storefront: floor-to-ceiling glass with slim dark mullions,
 * a glossy black fascia carrying the gold lettering, other cars parked behind the
 * glass, and a golden-hour sky outside. "Lights on" turns the outside to night while
 * the gold sign keeps glowing.
 *
 * The back wall (z = -11) is the exception: a solid dark feature wall carrying the large
 * gold winged-M logo, so the room reads as a gallery rather than a glass box.
 */

/* Room footprint (shared with HeroCarScene for the marble floor) */
export const ROOM_W = 23;
export const ROOM_D = 23;
export const ROOM_CZ = 0.5; // room centre on Z (back wall z=-11, front wall z=12)

const GLASS_H = 4.4;
const ROOF_H = 6.0;
const BAND_H = ROOF_H - GLASS_H;
const SIGN_PX_PER_M = 178;
const LOGO_ASPECT = 1582 / 677; // public/images/logo-wall.webp
const UP = new THREE.Vector3(0, 1, 0);

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export interface ShowroomBackdrop {
  group: THREE.Group;
  /** colour the scene fog / clear colour should take (follows day → night) */
  horizon: THREE.Color;
  /** 0 = golden hour, 1 = night with the sign still glowing */
  setMood: (night: number) => void;
  /** parks a set of cars (one per model key) along the glass (desktop only) */
  addDisplayCars: (key: string, model: THREE.Object3D, bodyMat: THREE.Material) => void;
  /** shows the parked cars of one model and hides the others — they follow the hero car */
  showDisplayCars: (key: string) => void;
  dispose: () => void;
}

interface Options {
  isMobile: boolean;
  maxAnisotropy: number;
}

/* ------------------------------------------------------------------ */
/*  Canvas textures                                                    */
/* ------------------------------------------------------------------ */

function createSignTexture(isMobile: boolean, anisotropy: number) {
  const DESIGN_W = 4096;
  const DESIGN_H = Math.round(BAND_H * SIGN_PX_PER_M);
  const k = isMobile ? 0.5 : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(DESIGN_W * k);
  canvas.height = Math.round(DESIGN_H * k);
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;

  let logo: HTMLImageElement | null = null;
  const FONT = `800 92px 'Helvetica Neue', Arial, sans-serif`;
  const TAG_FONT = `700 50px 'Helvetica Neue', Arial, sans-serif`;

  const spacedWidth = (text: string, spacing: number) => {
    let w = 0;
    for (const ch of text) w += ctx.measureText(ch).width + spacing;
    return w - spacing;
  };
  const drawSpaced = (text: string, x: number, y: number, spacing: number) => {
    let cx = x;
    for (const ch of text) {
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + spacing;
    }
  };

  const draw = () => {
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, DESIGN_W, DESIGN_H);

    // glossy black fascia
    const bg = ctx.createLinearGradient(0, 0, 0, DESIGN_H);
    bg.addColorStop(0, '#1a1b1f');
    bg.addColorStop(0.45, '#060607');
    bg.addColorStop(1, '#101114');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

    // gold trim lines (top + bottom)
    const trim = ctx.createLinearGradient(0, 0, DESIGN_W, 0);
    trim.addColorStop(0, '#8a6a1c');
    trim.addColorStop(0.5, '#f2d57a');
    trim.addColorStop(1, '#8a6a1c');
    ctx.fillStyle = trim;
    ctx.fillRect(0, 8, DESIGN_W, 5);
    ctx.fillRect(0, DESIGN_H - 13, DESIGN_W, 5);

    const midY = DESIGN_H / 2;
    const logoH = 170;
    const logoW = logoH * (1046 / 443);
    const title = 'MANCHESTER AUTO GALLERY';
    const tag = 'Buy  |  Sell  |  Trade';

    ctx.textBaseline = 'middle';
    ctx.font = FONT;
    const titleW = spacedWidth(title, 7);
    ctx.font = TAG_FONT;
    const tagW = spacedWidth(tag, 3);

    const gapA = 70;
    const gapB = 90;
    const total = logoW + gapA + titleW + gapB + tagW;
    let x = (DESIGN_W - total) / 2;

    if (logo) ctx.drawImage(logo, x, midY - logoH / 2, logoW, logoH);
    x += logoW + gapA;

    const gold = (size: number) => {
      const g = ctx.createLinearGradient(0, midY - size * 0.5, 0, midY + size * 0.5);
      g.addColorStop(0, '#fff3b8');
      g.addColorStop(0.45, '#e8c858');
      g.addColorStop(0.55, '#d4af37');
      g.addColorStop(1, '#9a7418');
      return g;
    };

    ctx.shadowColor = 'rgba(232,200,88,0.45)';
    ctx.shadowBlur = 22;
    ctx.font = FONT;
    ctx.fillStyle = gold(92);
    drawSpaced(title, x, midY + 2, 7);
    x += titleW + gapB;

    ctx.font = TAG_FONT;
    ctx.fillStyle = gold(50);
    drawSpaced(tag, x, midY + 4, 3);
    ctx.shadowBlur = 0;

    texture.needsUpdate = true;
  };

  draw();

  const img = new Image();
  img.onload = () => {
    logo = img;
    draw();
  };
  img.src = `${import.meta.env.BASE_URL}images/logo.webp`;

  return texture;
}

/** soft diagonal golden streaks that sit on the glass, like the reflection in the photo */
function createGlassSheenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const band = (cx: number, w: number, a: number) => {
    ctx.save();
    ctx.transform(1, 0, -0.55, 1, 0, 0); // skew
    const g = ctx.createLinearGradient(cx - w, 0, cx + w, 0);
    g.addColorStop(0, 'rgba(255,190,110,0)');
    g.addColorStop(0.5, `rgba(255,200,120,${a})`);
    g.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - w, 0, w * 2, 256);
    ctx.restore();
  };
  band(380, 110, 0.55);
  band(560, 40, 0.5);
  band(760, 160, 0.35);
  band(940, 60, 0.4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPaverTexture(anisotropy: number) {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#4b403c'; // grout
  ctx.fillRect(0, 0, S, S);
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const bw = 64;
  const bh = 32;
  for (let row = 0; row < S / bh; row++) {
    const off = row % 2 ? bw / 2 : 0;
    for (let col = -1; col < S / bw + 1; col++) {
      const v = rnd();
      const r = Math.round(150 + v * 28);
      const g = Math.round(112 + v * 22);
      const b = Math.round(104 + v * 20);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(col * bw + off + 2, row * bh + 2, bw - 4, bh - 4);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  tex.anisotropy = anisotropy;
  return tex;
}

function createSkylineTexture() {
  const W = 4096;
  const H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let x = 0;
  while (x < W) {
    const w = 40 + rnd() * 110;
    const tall = rnd() > 0.88;
    const h = tall ? 120 + rnd() * 110 : 24 + rnd() * 70;
    ctx.fillRect(x, H - h, w, h);
    if (tall) ctx.fillRect(x + w * 0.45, H - h - 22, w * 0.1, 22); // antenna
    x += w + rnd() * 18;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

function createBlobTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.9)');
  g.addColorStop(0.6, 'rgba(0,0,0,0.45)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/* ------------------------------------------------------------------ */
/*  Backdrop                                                           */
/* ------------------------------------------------------------------ */

export function createShowroomBackdrop({ isMobile, maxAnisotropy }: Options): ShowroomBackdrop {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T): T => {
    disposables.push(o);
    return o;
  };

  /* ---------- Glass walls, mullions, fascia, sign ---------- */
  const walls = [
    { x: 0, z: -11, rot: 0, solid: true }, // feature wall with the logo
    { x: 0, z: 12, rot: Math.PI, solid: false },
    { x: -11.5, z: ROOM_CZ, rot: Math.PI / 2, solid: false },
    { x: 11.5, z: ROOM_CZ, rot: -Math.PI / 2, solid: false },
  ];

  const metalGeos: THREE.BufferGeometry[] = [];
  const bayCount = 8;
  const bay = ROOM_W / bayCount;

  const signTex = track(createSignTexture(isMobile, Math.min(maxAnisotropy, 8)));
  const sheenTex = track(createGlassSheenTexture());

  const glassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xb8c8d6,
      roughness: 0.03,
      metalness: 0,
      transparent: true,
      opacity: 0.1,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const sheenMat = track(
    new THREE.MeshBasicMaterial({
      map: sheenTex,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    })
  );
  const metalMat = track(new THREE.MeshStandardMaterial({ color: 0x0c0c0e, metalness: 0.7, roughness: 0.3 }));
  const signMat = track(new THREE.MeshBasicMaterial({ map: signTex, fog: false }));

  const glassGeo = track(new THREE.PlaneGeometry(ROOM_W, GLASS_H));
  const sheenGeo = track(new THREE.PlaneGeometry(ROOM_W, GLASS_H));
  const signGeo = track(new THREE.PlaneGeometry(ROOM_W + 0.3, BAND_H));

  walls.forEach((w) => {
    const wallM = new THREE.Matrix4().compose(
      new THREE.Vector3(w.x, 0, w.z),
      new THREE.Quaternion().setFromAxisAngle(UP, w.rot),
      new THREE.Vector3(1, 1, 1)
    );
    const place = (geo: THREE.BufferGeometry, x: number, y: number, z: number) => {
      geo.applyMatrix4(wallM.clone().multiply(new THREE.Matrix4().makeTranslation(x, y, z)));
      metalGeos.push(geo);
    };

    if (w.solid) {
      // solid wall: only a slim plinth, the wall itself is built below
      place(new THREE.BoxGeometry(ROOM_W, 0.3, 0.22), 0, 0.15, 0.05);
      return;
    }

    // glass + golden sheen
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(w.x, GLASS_H / 2, w.z);
    glass.rotation.y = w.rot;
    glass.renderOrder = 3;
    group.add(glass);

    const sheen = new THREE.Mesh(sheenGeo, sheenMat);
    sheen.position.copy(glass.position);
    sheen.rotation.y = w.rot;
    sheen.translateZ(0.03);
    sheen.renderOrder = 4;
    group.add(sheen);

    // slim mullions, top rail, plinth
    for (let i = 0; i <= bayCount; i++) {
      place(new THREE.BoxGeometry(0.09, GLASS_H, 0.14), -ROOM_W / 2 + i * bay, GLASS_H / 2, 0.04);
    }
    place(new THREE.BoxGeometry(ROOM_W, 0.16, 0.18), 0, GLASS_H - 0.08, 0.04);
    place(new THREE.BoxGeometry(ROOM_W, 0.3, 0.22), 0, 0.15, 0.05);
    // fascia body
    place(new THREE.BoxGeometry(ROOM_W + 0.3, BAND_H, 0.3), 0, GLASS_H + BAND_H / 2, 0);

    // sign face (inside)
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(w.x, GLASS_H + BAND_H / 2, w.z);
    sign.rotation.y = w.rot;
    sign.translateZ(0.17);
    group.add(sign);
  });

  /* ---------- Feature wall (back, z = -11) with the gold logo ---------- */
  const WALL_Z = -11;
  const wallMat = track(new THREE.MeshStandardMaterial({ color: 0x131418, roughness: 0.6, metalness: 0.2 }));
  const wall = new THREE.Mesh(track(new THREE.PlaneGeometry(ROOM_W, ROOF_H)), wallMat);
  wall.position.set(0, ROOF_H / 2, WALL_Z);
  wall.receiveShadow = true;
  group.add(wall);

  const PANEL_Y = 3.0; // logo centre height

  // soft warm glow behind the logo
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 256;
  const gctx = glowCanvas.getContext('2d')!;
  const gg = gctx.createRadialGradient(128, 128, 8, 128, 128, 128);
  gg.addColorStop(0, 'rgba(255,200,110,0.55)');
  gg.addColorStop(0.5, 'rgba(255,170,80,0.18)');
  gg.addColorStop(1, 'rgba(255,170,80,0)');
  gctx.fillStyle = gg;
  gctx.fillRect(0, 0, 256, 256);
  const logoGlowMat = track(
    new THREE.MeshBasicMaterial({
      map: track(new THREE.CanvasTexture(glowCanvas)),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  );
  const logoGlow = new THREE.Mesh(track(new THREE.PlaneGeometry(10.5, 6)), logoGlowMat);
  logoGlow.position.set(0, PANEL_Y, WALL_Z + 0.04);
  logoGlow.renderOrder = 2;
  group.add(logoGlow);

  // The logo: raised polished-gold lettering standing off the wall. A stack of thin dark-gold
  // layers gives it real thickness, the front face is glossy metal with a bevel (bump) map,
  // and a soft shadow on the wall sells the relief. A faint emissive keeps it readable in the dark.
  const LOGO_W = 7.4;
  const LOGO_H = LOGO_W / LOGO_ASPECT;
  const LOGO_URL = `${import.meta.env.BASE_URL}images/logo-wall.webp`;
  const aniso = Math.min(maxAnisotropy, 8);

  const logoTex = track(new THREE.TextureLoader().load(LOGO_URL));
  logoTex.colorSpace = THREE.SRGBColorSpace;
  logoTex.anisotropy = aniso;

  const shadowCanvas = document.createElement('canvas');
  const shadowTex = track(new THREE.CanvasTexture(shadowCanvas));
  shadowTex.anisotropy = aniso;
  shadowTex.colorSpace = THREE.SRGBColorSpace;

  const logoImg = new Image();
  logoImg.onload = () => {
    const W = 1024;
    const H = Math.round(W / LOGO_ASPECT);
    // silhouette of the logo
    const sil = document.createElement('canvas');
    sil.width = W;
    sil.height = H;
    const sctx = sil.getContext('2d')!;
    sctx.drawImage(logoImg, 0, 0, W, H);
    sctx.globalCompositeOperation = 'source-in';
    sctx.fillStyle = '#fff';
    sctx.fillRect(0, 0, W, H);

    // contact shadow: blurred black silhouette
    shadowCanvas.width = W;
    shadowCanvas.height = H;
    const shctx = shadowCanvas.getContext('2d')!;
    const blk = document.createElement('canvas');
    blk.width = W;
    blk.height = H;
    const kctx = blk.getContext('2d')!;
    kctx.drawImage(sil, 0, 0);
    kctx.globalCompositeOperation = 'source-in';
    kctx.fillStyle = '#000';
    kctx.fillRect(0, 0, W, H);
    shctx.filter = 'blur(14px)';
    shctx.drawImage(blk, 0, 0);
    shadowTex.needsUpdate = true;
  };
  logoImg.src = LOGO_URL;

  const logoGeo = track(new THREE.PlaneGeometry(LOGO_W, LOGO_H));

  // soft shadow on the wall, offset down-right
  const shadowMat = track(
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.75, depthWrite: false, fog: false })
  );
  const shadow = new THREE.Mesh(track(new THREE.PlaneGeometry(LOGO_W * 1.04, LOGO_H * 1.04)), shadowMat);
  shadow.position.set(0.07, PANEL_Y - 0.1, WALL_Z + 0.03);
  shadow.renderOrder = 2;
  group.add(shadow);

  // thickness: stacked dark-gold edge layers
  const edgeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x6b4d10,
      map: logoTex,
      alphaTest: 0.5,
      alphaToCoverage: true,
      metalness: 0.6,
      roughness: 0.4,
      envMapIntensity: 0.8,
    })
  );
  const LAYERS = 7;
  const STEP = 0.012;
  for (let i = 0; i < LAYERS; i++) {
    const layer = new THREE.Mesh(logoGeo, edgeMat);
    layer.position.set(0, PANEL_Y, WALL_Z + 0.05 + i * STEP);
    group.add(layer);
  }

  // polished front face
  const logoMat = track(
    new THREE.MeshPhysicalMaterial({
      map: logoTex,
      alphaTest: 0.5,
      alphaToCoverage: true,
      // the artwork already carries its own baked gold highlights, so keep the PBR metal subtle
      // and let the texture itself (emissive) carry the look of the reference emblem
      metalness: 0.2,
      roughness: 0.45,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.5,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: logoTex,
      emissiveIntensity: 0.8,
    })
  );
  const logo = new THREE.Mesh(logoGeo, logoMat);
  logo.position.set(0, PANEL_Y, WALL_Z + 0.05 + LAYERS * STEP);
  group.add(logo);

  const metalMesh = new THREE.Mesh(track(mergeGeometries(metalGeos)!), metalMat);
  group.add(metalMesh);
  metalGeos.forEach((g) => g.dispose());

  /* ---------- Ceiling with warm LED strips ---------- */
  const ceiling = new THREE.Mesh(
    track(new THREE.PlaneGeometry(ROOM_W, ROOM_D)),
    track(new THREE.MeshStandardMaterial({ color: 0x0d0e11, roughness: 0.85, metalness: 0.05 }))
  );
  ceiling.rotation.x = Math.PI / 2; // faces down; invisible from above so aerial views see in
  ceiling.position.set(0, ROOF_H, ROOM_CZ);
  group.add(ceiling);

  const stripMat = track(new THREE.MeshBasicMaterial({ color: 0xfff2d8 }));
  const stripBase = new THREE.Color(0xfff2d8);
  const stripGeos: THREE.BufferGeometry[] = [];
  [-8, -4, 0, 4, 8].forEach((dz) => {
    const g = new THREE.BoxGeometry(20, 0.03, 0.14);
    g.translate(0, ROOF_H - 0.02, ROOM_CZ + dz);
    stripGeos.push(g);
  });
  group.add(new THREE.Mesh(track(mergeGeometries(stripGeos)!), stripMat));
  stripGeos.forEach((g) => g.dispose());

  /* ---------- Outside: pavers, kerb, road, skyline ---------- */
  const padW = ROOM_W + 13;
  const padD = ROOM_D + 13;
  const pavement = new THREE.Mesh(
    track(new THREE.PlaneGeometry(padW, padD)),
    track(
      new THREE.MeshStandardMaterial({
        map: track(createPaverTexture(Math.min(maxAnisotropy, 8))),
        roughness: 0.88,
        metalness: 0,
      })
    )
  );
  pavement.rotation.x = -Math.PI / 2;
  pavement.position.set(0, -0.06, ROOM_CZ);
  group.add(pavement);

  const asphalt = new THREE.Mesh(
    track(new THREE.PlaneGeometry(900, 900)),
    track(new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.9, metalness: 0 }))
  );
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.position.y = -0.2;
  group.add(asphalt);

  const kerbGeos: THREE.BufferGeometry[] = [];
  const kerb = (w: number, d: number, x: number, z: number) => {
    const g = new THREE.BoxGeometry(w, 0.18, d);
    g.translate(x, -0.11, z);
    kerbGeos.push(g);
  };
  kerb(padW + 0.3, 0.3, 0, ROOM_CZ - padD / 2 - 0.15);
  kerb(padW + 0.3, 0.3, 0, ROOM_CZ + padD / 2 + 0.15);
  kerb(0.3, padD + 0.3, -padW / 2 - 0.15, ROOM_CZ);
  kerb(0.3, padD + 0.3, padW / 2 + 0.15, ROOM_CZ);
  group.add(
    new THREE.Mesh(
      track(mergeGeometries(kerbGeos)!),
      track(new THREE.MeshStandardMaterial({ color: 0x8b8984, roughness: 0.85 }))
    )
  );
  kerbGeos.forEach((g) => g.dispose());

  // dashed lane lines on the road ring
  const dashGeos: THREE.BufferGeometry[] = [];
  for (let i = -15; i <= 15; i++) {
    const p = i * 6;
    [-30, 30].forEach((off) => {
      const a = new THREE.PlaneGeometry(3, 0.18);
      a.rotateX(-Math.PI / 2);
      a.translate(p, -0.195, ROOM_CZ + off);
      dashGeos.push(a);
      const b = new THREE.PlaneGeometry(3, 0.18);
      b.rotateX(-Math.PI / 2);
      b.rotateY(Math.PI / 2);
      b.translate(off, -0.195, ROOM_CZ + p);
      dashGeos.push(b);
    });
  }
  group.add(
    new THREE.Mesh(
      track(mergeGeometries(dashGeos)!),
      track(new THREE.MeshStandardMaterial({ color: 0xd8d8d2, roughness: 0.8 }))
    )
  );
  dashGeos.forEach((g) => g.dispose());

  const skylineMat = track(
    new THREE.MeshBasicMaterial({
      map: track(createSkylineTexture()),
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    })
  );
  const skyline = new THREE.Mesh(track(new THREE.CylinderGeometry(150, 150, 24, 64, 1, true)), skylineMat);
  skyline.position.y = 11.8;
  skyline.renderOrder = -9;
  group.add(skyline);

  /* ---------- Sky dome (vertex-colour gradient + low sun glow) ---------- */
  const SKY_R = 180;
  const skyGeo = track(new THREE.SphereGeometry(SKY_R, 64, 64));
  const skyCount = skyGeo.attributes.position.count;
  const skyColors = new THREE.BufferAttribute(new Float32Array(skyCount * 3), 3);
  skyGeo.setAttribute('color', skyColors);
  const vy = new Float32Array(skyCount);
  const vsun = new Float32Array(skyCount);
  const sunDir = new THREE.Vector3(-0.5, 0.06, -0.85).normalize();
  const nrm = new THREE.Vector3();
  for (let i = 0; i < skyCount; i++) {
    nrm.fromBufferAttribute(skyGeo.attributes.position as THREE.BufferAttribute, i).normalize();
    vy[i] = nrm.y;
    vsun[i] = Math.max(0, nrm.dot(sunDir));
  }
  const sky = new THREE.Mesh(
    skyGeo,
    track(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false, fog: false }))
  );
  sky.renderOrder = -10;
  group.add(sky);

  const TOP_DAY = new THREE.Color(0x2f5282);
  const TOP_NIGHT = new THREE.Color(0x02030a);
  const MID_DAY = new THREE.Color(0x7d9cc0);
  const MID_NIGHT = new THREE.Color(0x060a14);
  const HOR_DAY = new THREE.Color(0xf3c28a);
  const HOR_NIGHT = new THREE.Color(0x16111a);
  const SUN_COL = new THREE.Color(0xffa850);
  const SKYLINE_DAY = new THREE.Color(0x56627a);
  const SKYLINE_NIGHT = new THREE.Color(0x06080c);
  const top = new THREE.Color();
  const mid = new THREE.Color();
  const horizon = new THREE.Color().copy(HOR_DAY);
  const col = new THREE.Color();

  const setMood = (night: number) => {
    top.copy(TOP_DAY).lerp(TOP_NIGHT, night);
    mid.copy(MID_DAY).lerp(MID_NIGHT, night);
    horizon.copy(HOR_DAY).lerp(HOR_NIGHT, night);
    const arr = skyColors.array as Float32Array;
    const sunAmt = 1 - night;
    for (let i = 0; i < skyCount; i++) {
      const y = Math.max(0, vy[i]);
      col.copy(horizon)
        .lerp(mid, THREE.MathUtils.smoothstep(y, 0, 0.22))
        .lerp(top, THREE.MathUtils.smoothstep(y, 0.12, 0.75));
      const glow = Math.pow(vsun[i], 18) * sunAmt * 0.55 * (1 - THREE.MathUtils.smoothstep(y, 0, 0.5));
      arr[i * 3] = col.r + SUN_COL.r * glow;
      arr[i * 3 + 1] = col.g + SUN_COL.g * glow;
      arr[i * 3 + 2] = col.b + SUN_COL.b * glow;
    }
    skyColors.needsUpdate = true;

    skylineMat.color.copy(SKYLINE_DAY).lerp(SKYLINE_NIGHT, night);
    stripMat.color.copy(stripBase).multiplyScalar(mix(1, 0.015, night));
    signMat.color.setScalar(mix(1, 0.8, night)); // the sign stays lit at night
    sheenMat.opacity = mix(0.55, 0.1, night);
    logoMat.emissiveIntensity = mix(0.7, 0.95, night); // gold logo keeps glowing at night
    shadowMat.opacity = mix(0.75, 0.2, night);
    logoGlowMat.opacity = mix(0.7, 1, night);
  };
  setMood(0);

  /* ---------- Other cars parked along the glass ---------- */
  const blobTex = track(createBlobTexture());
  const blobGeo = track(new THREE.PlaneGeometry(3.1, 6.4));
  const blobMat = track(
    new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: 0.6, depthWrite: false })
  );

  // one holder group per model key (e.g. 'landcruiser' / 'maybach'), four cars each
  const displaySets = new Map<string, THREE.Group[]>();
  let blobsAdded = false;
  let activeDisplay: string | null = null;

  const showDisplayCars = (key: string) => {
    activeDisplay = key;
    displaySets.forEach((holders, k) => holders.forEach((h) => (h.visible = k === key)));
  };

  const addDisplayCars = (key: string, model: THREE.Object3D, bodyMat: THREE.Material) => {
    const specs =
      key === 'maybach'
        ? [
            // every parked Maybach gets its own colour (none of them black)
            { x: -6.6, z: -9.2, yaw: Math.PI / 2 - 0.08, color: 0x0d6a4a, metal: 0.5, rough: 0.18 }, // emerald green
            { x: 6.4, z: -9.2, yaw: -Math.PI / 2 + 0.1, color: 0xa3101f, metal: 0.5, rough: 0.18 }, // ruby red
            { x: -6.8, z: 10.4, yaw: -Math.PI / 2, color: 0x1740a0, metal: 0.5, rough: 0.18 }, // sapphire blue
            { x: 6.8, z: 10.4, yaw: Math.PI / 2 + 0.06, color: 0xe27a14, metal: 0.5, rough: 0.18 }, // amber orange
          ]
        : [
            { x: -6.6, z: -9.2, yaw: Math.PI / 2 - 0.08, color: 0x101114, metal: 0.6, rough: 0.2 }, // black
            { x: 6.4, z: -9.2, yaw: -Math.PI / 2 + 0.1, color: 0xb7bbc2, metal: 0.7, rough: 0.25 }, // silver
            { x: -6.8, z: 10.4, yaw: -Math.PI / 2, color: 0x2a2d33, metal: 0.6, rough: 0.22 }, // graphite
            { x: 6.8, z: 10.4, yaw: Math.PI / 2 + 0.06, color: 0xc8aa6e, metal: 0.7, rough: 0.22 }, // champagne
          ];
    const holders: THREE.Group[] = [];
    specs.forEach((s) => {
      const paint = track(
        new THREE.MeshPhysicalMaterial({
          color: s.color,
          metalness: s.metal,
          roughness: s.rough,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          envMapIntensity: key === 'maybach' ? 1.6 : 1,
        })
      );
      const car = model.clone(true);
      car.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = false;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => (m === bodyMat ? paint : m));
        } else if (mesh.material === bodyMat) {
          mesh.material = paint;
        }
      });
      const holder = new THREE.Group();
      holder.position.set(s.x, 0, s.z);
      holder.rotation.y = s.yaw;
      holder.add(car);
      group.add(holder);
      holders.push(holder);

      if (!blobsAdded) {
        const blob = new THREE.Mesh(blobGeo, blobMat);
        blob.rotation.x = -Math.PI / 2;
        blob.position.set(s.x, 0.006, s.z);
        blob.rotation.z = s.yaw;
        blob.renderOrder = 2;
        group.add(blob);
      }
    });
    blobsAdded = true;
    displaySets.set(key, holders);
    // a set added while another model is on show stays hidden until showDisplayCars() asks for it
    holders.forEach((h) => (h.visible = activeDisplay === null || activeDisplay === key));
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return { group, horizon, setMood, addDisplayCars, showDisplayCars, dispose };
}
