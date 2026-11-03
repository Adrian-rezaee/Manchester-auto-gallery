export interface HeroView {
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
 * The 13-camera exhibition sequence — exterior stances, aerial studies and
 * macro detail framings (coordinates measured on the Land Cruiser GLB).
 */
export const HERO_VIEWS: HeroView[] = [
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
