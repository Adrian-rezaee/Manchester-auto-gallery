import * as THREE from 'three';

/**
 * Rear number plate carrying the Manchester Auto Gallery logo.
 *
 * Coordinates are in the normalised car frame (floor y = 0, nose towards +z), the same frame
 * used by loadLandCruiser / carLights. The numbers below were measured by ray-casting the
 * tailgate of landcruiser.glb: the plate recess is a flat panel between x = -0.25 … 0.25 and
 * y ≈ 0.90 … 1.10, leaning 14° (top towards the nose) with its surface at z ≈ -2.375.
 */

export interface PlateSpec {
  /** plate width / height in metres (height along the panel) */
  w: number;
  h: number;
  /** centre of the plate on the tailgate */
  point: THREE.Vector3;
  /** outward normal of the tailgate panel */
  normal: THREE.Vector3;
}
const PLATE_DEPTH = 0.008;
const RADIUS = 0.014;

// centre of the plate on the tailgate recess
export const LAND_CRUISER_PLATE: PlateSpec = {
  w: 0.46,
  h: 0.19,
  point: new THREE.Vector3(0, 1.0, -2.375),
  // outward normal of the recess (points backwards and a little up)
  normal: new THREE.Vector3(0, 0.2425, -0.9701).normalize(),
};

// Maybach: ray-cast on maybach.glb — the boot lid is an almost vertical panel at z ≈ -2.62,
// y ≈ 0.77 … 0.93, x ± 0.26 (a European-format plate fits the flat)
export const MAYBACH_PLATE: PlateSpec = {
  w: 0.5,
  h: 0.135,
  point: new THREE.Vector3(0, 0.85, -2.622),
  normal: new THREE.Vector3(0, 0.04, -1).normalize(),
};

const GOLD_LIGHT = '#F1D77A';
const GOLD = '#D4AF37';
const GOLD_DARK = '#8E6B1B';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintPlate(ctx: CanvasRenderingContext2D, W: number, H: number, logo: HTMLImageElement | null) {
  ctx.clearRect(0, 0, W, H);

  // glossy black plate body
  const body = ctx.createLinearGradient(0, 0, 0, H);
  body.addColorStop(0, '#1a1a1c');
  body.addColorStop(0.5, '#0a0a0b');
  body.addColorStop(1, '#141416');
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, W, H);

  // gold border (outer thick + inner hairline)
  const border = ctx.createLinearGradient(0, 0, W, H);
  border.addColorStop(0, GOLD_LIGHT);
  border.addColorStop(0.5, GOLD);
  border.addColorStop(1, GOLD_DARK);
  ctx.strokeStyle = border;
  ctx.lineWidth = H * 0.035;
  roundRect(ctx, H * 0.045, H * 0.045, W - H * 0.09, H - H * 0.09, H * 0.07);
  ctx.stroke();
  ctx.lineWidth = H * 0.008;
  roundRect(ctx, H * 0.105, H * 0.105, W - H * 0.21, H - H * 0.21, H * 0.045);
  ctx.stroke();

  // two small fixing screws
  for (const sx of [0.085, 0.915]) {
    const cx = W * sx;
    const cy = H * 0.5;
    const g = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, H * 0.03);
    g.addColorStop(0, GOLD_LIGHT);
    g.addColorStop(1, GOLD_DARK);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, H * 0.026, 0, Math.PI * 2);
    ctx.fill();
  }

  // the logo, centred
  if (logo && logo.naturalWidth > 0) {
    const maxW = W * 0.70;
    const maxH = H * 0.72;
    const s = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight);
    const lw = logo.naturalWidth * s;
    const lh = logo.naturalHeight * s;
    ctx.drawImage(logo, (W - lw) / 2, (H - lh) / 2, lw, lh);
  }
}

export interface RearPlate {
  group: THREE.Group;
  dispose: () => void;
}

export function createRearPlate(maxAnisotropy = 1, spec: PlateSpec = LAND_CRUISER_PLATE): RearPlate {
  const PLATE_W = spec.w;
  const PLATE_H = spec.h;
  const SURFACE_POINT = spec.point;
  const SURFACE_NORMAL = spec.normal;
  const W = 2048;
  const H = Math.round((W * PLATE_H) / PLATE_W);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  paintPlate(ctx, W, H, null);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;

  // once the logo has loaded, repaint the plate with it
  let cancelled = false;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    if (cancelled) return;
    paintPlate(ctx, W, H, img);
    texture.needsUpdate = true;
  };
  img.src = `${import.meta.env.BASE_URL}images/logo.webp`;

  // rounded, slightly bevelled plate blank
  const hw = PLATE_W / 2 - 0.002;
  const hh = PLATE_H / 2 - 0.002;
  const shape = new THREE.Shape();
  shape.moveTo(-hw + RADIUS, -hh);
  shape.lineTo(hw - RADIUS, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + RADIUS);
  shape.lineTo(hw, hh - RADIUS);
  shape.quadraticCurveTo(hw, hh, hw - RADIUS, hh);
  shape.lineTo(-hw + RADIUS, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - RADIUS);
  shape.lineTo(-hw, -hh + RADIUS);
  shape.quadraticCurveTo(-hw, -hh, -hw + RADIUS, -hh);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: PLATE_DEPTH - 0.003,
    bevelEnabled: true,
    bevelThickness: 0.0015,
    bevelSize: 0.002,
    bevelSegments: 2,
    curveSegments: 10,
  });
  // planar UVs from the plate outline (extrude's default UVs are in metres)
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
  }
  uv.needsUpdate = true;

  const faceMat = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.38,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const edgeMat = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.3, metalness: 1 });

  const mesh = new THREE.Mesh(geo, [faceMat, edgeMat]);
  mesh.castShadow = false;
  mesh.receiveShadow = true;

  const group = new THREE.Group();
  group.name = 'RearPlate';
  group.add(mesh);
  // Face the plate along the tailgate normal. Seen from behind the car, the plate's local +x
  // (its right-hand side) must point to world -x, otherwise the text reads mirrored.
  const zAxis = SURFACE_NORMAL.clone();
  const xAxis = new THREE.Vector3(-1, 0, 0);
  const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize(); // up along the panel
  group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis));
  // sunk 3 mm into the panel so it sits flush
  group.position.copy(SURFACE_POINT).addScaledVector(SURFACE_NORMAL, -0.003);

  return {
    group,
    dispose: () => {
      cancelled = true;
      geo.dispose();
      faceMat.dispose();
      edgeMat.dispose();
      texture.dispose();
    },
  };
}
