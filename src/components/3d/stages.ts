export type CarKey = 'landcruiser' | 'maybach';

export const CAR_LABEL: Record<CarKey, string> = {
  landcruiser: 'Land Cruiser',
  maybach: 'Mercedes-Maybach',
};

export interface HeroView {
  /** which car this camera frames — the scene swaps cars when the sequence moves on */
  car: CarKey;
  name: string;
  category: 'exterior' | 'detail';
  /** camera position */
  pos: [number, number, number];
  /** framing focus point */
  lookAt: [number, number, number];
  /** lateral framing offset on wide screens (vehicle sits right of the headline) */
  shift?: number;
  /** camera field of view — tighter for macro detail studies */
  fov?: number;
}

/**
 * The 13-camera exhibition sequence for the Land Cruiser — exterior stances, aerial studies and
 * macro detail framings (coordinates measured on the Land Cruiser GLB).
 */
const LAND_CRUISER_VIEWS: Omit<HeroView, 'car'>[] = [
  // Exterior stances
  { name: 'Front Three-Quarter', category: 'exterior', pos: [5.4, 2.05, 5.8], lookAt: [0, 1.0, 0], shift: 0.9 },
  { name: 'Frontal Presence', category: 'exterior', pos: [0.3, 1.5, 7.6], lookAt: [0, 1.15, 0], shift: 0.9 },
  { name: 'Pure Profile', category: 'exterior', pos: [8.6, 1.65, 0.1], lookAt: [0, 1.0, 0], shift: 0.9 },
  { name: 'Rear Three-Quarter', category: 'exterior', pos: [-5.8, 2.15, -5.6], lookAt: [0, 1.0, 0], shift: 0.9 },
  { name: 'Rear Elevation', category: 'exterior', pos: [0.3, 1.6, -7.9], lookAt: [0, 1.15, 0], shift: 0.9 },
  // Aerial studies
  { name: 'Top Plan Study', category: 'exterior', pos: [0.6, 7.6, 3.4], lookAt: [0, 0.85, 0], shift: 0.4 },
  { name: 'Aerial Front Study', category: 'exterior', pos: [4.6, 4.8, 5.4], lookAt: [0, 0.95, 0], shift: 0.8 },
  { name: 'Aerial Rear Study', category: 'exterior', pos: [-4.8, 4.6, -5.6], lookAt: [0, 0.95, 0], shift: 0.8 },
  // Macro detail studies
  { name: 'Grille & Emblem', category: 'detail', pos: [1.1, 1.3, 4.5], lookAt: [0, 0.85, 2.42], shift: 0.5, fov: 27 },
  { name: 'LED Matrix Headlamp', category: 'detail', pos: [2.3, 1.45, 3.6], lookAt: [0.78, 1.05, 2.25], shift: 0.35, fov: 27 },
  { name: 'Forged Alloy Wheel', category: 'detail', pos: [3.0, 0.75, 2.8], lookAt: [0.95, 0.42, 1.54], shift: 0.35, fov: 30 },
  { name: 'Tail-Lamp Signature', category: 'detail', pos: [-2.4, 1.55, -3.7], lookAt: [-0.7, 1.22, -2.3], shift: 0.35, fov: 27 },
  { name: 'Cabin Craft', category: 'detail', pos: [2.6, 1.5, 0.9], lookAt: [0.2, 1.2, 0.2], shift: 0.3, fov: 32 },
];

/**
 * The same 13-camera sequence for the Mercedes-Maybach (coordinates measured on maybach.glb:
 * 5.46 m long, 1.53 m high, nose towards +z, wheel centres at z ≈ +1.83 / -1.48).
 */
const MAYBACH_VIEWS: Omit<HeroView, 'car'>[] = [
  // Exterior stances
  { name: 'Front Three-Quarter', category: 'exterior', pos: [5.8, 1.7, 6.5], lookAt: [0, 0.72, 0.1], shift: 0.9 },
  { name: 'Frontal Presence', category: 'exterior', pos: [0.3, 1.25, 8.4], lookAt: [0, 0.82, 0], shift: 0.9 },
  { name: 'Pure Profile', category: 'exterior', pos: [9.4, 1.3, 0.1], lookAt: [0, 0.78, 0], shift: 0.9 },
  { name: 'Rear Three-Quarter', category: 'exterior', pos: [-6.3, 1.75, -6.2], lookAt: [0, 0.72, 0], shift: 0.9 },
  { name: 'Rear Elevation', category: 'exterior', pos: [0.3, 1.3, -8.7], lookAt: [0, 0.82, 0], shift: 0.9 },
  // Aerial studies
  { name: 'Top Plan Study', category: 'exterior', pos: [0.6, 8.0, 3.6], lookAt: [0, 0.6, 0], shift: 0.4 },
  { name: 'Aerial Front Study', category: 'exterior', pos: [4.9, 4.3, 6.0], lookAt: [0, 0.7, 0], shift: 0.8 },
  { name: 'Aerial Rear Study', category: 'exterior', pos: [-5.1, 4.1, -6.1], lookAt: [0, 0.7, 0], shift: 0.8 },
  // Macro detail studies
  { name: 'Maybach Grille & Star', category: 'detail', pos: [1.2, 1.05, 5.0], lookAt: [0, 0.78, 2.72], shift: 0.5, fov: 27 },
  { name: 'Digital LED Headlamp', category: 'detail', pos: [2.4, 1.2, 4.1], lookAt: [0.66, 0.74, 2.45], shift: 0.35, fov: 27 },
  { name: 'Aero Wheel', category: 'detail', pos: [3.1, 0.7, 3.5], lookAt: [0.88, 0.4, 1.83], shift: 0.35, fov: 30 },
  { name: 'Tail-Lamp Signature', category: 'detail', pos: [-2.4, 1.4, -4.2], lookAt: [-0.6, 0.9, -2.55], shift: 0.35, fov: 27 },
  { name: 'Gallery Plate', category: 'detail', pos: [0.9, 1.15, -4.6], lookAt: [0, 0.9, -2.62], shift: 0.3, fov: 28 },
];

export const LAND_CRUISER_VIEW_COUNT = LAND_CRUISER_VIEWS.length;

/** Land Cruiser first; when its 13 cameras are done the sequence carries on with the Maybach. */
export const HERO_VIEWS: HeroView[] = [
  ...LAND_CRUISER_VIEWS.map((v): HeroView => ({ ...v, car: 'landcruiser' })),
  ...MAYBACH_VIEWS.map((v): HeroView => ({ ...v, car: 'maybach' })),
];

/** The slider arrows walk through the cars in this order; clicking the screen walks one car's views. */
export const CAR_ORDER: CarKey[] = ['landcruiser', 'maybach'];

/** index of each car's first camera inside HERO_VIEWS */
export const CAR_FIRST_INDEX: Record<CarKey, number> = {
  landcruiser: 0,
  maybach: LAND_CRUISER_VIEW_COUNT,
};

/** how many cameras each car has */
export const CAR_VIEW_COUNT: Record<CarKey, number> = {
  landcruiser: LAND_CRUISER_VIEW_COUNT,
  maybach: MAYBACH_VIEWS.length,
};
