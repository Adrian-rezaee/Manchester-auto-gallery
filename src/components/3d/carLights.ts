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

export interface CarLights {
  group: THREE.Group;
  setLevel: (level: number, boost?: number) => void;
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
  lampRed: THREE.MeshStandardMaterial | null = null
): CarLights {
  const group = new THREE.Group();
  const baseEmissive = lamp ? lamp.emissiveIntensity : 1;
  const spots: THREE.SpotLight[] = [];
  const tails: THREE.PointLight[] = [];

  for (const side of [-1, 1]) {
    const spot = new THREE.SpotLight(0xfff0d8, 0, 18, 0.42, 0.95, 2);
    spot.position.set(side * 0.72, 1.02, 2.5);
    spot.castShadow = false;
    // low beam: aimed ahead and down, slightly toward the centre line
    spot.target.position.set(side * 0.45, 0, 7.5);
    group.add(spot, spot.target);
    spots.push(spot);

    const tail = new THREE.PointLight(0xff1a14, 0, 7, 2);
    tail.position.set(side * 0.8, 0.95, -2.75);
    group.add(tail);
    tails.push(tail);
  }

  if (lampRed) {
    lampRed.emissive.set(0xff1408);
    lampRed.emissiveIntensity = 0;
  }

  const setLevel = (level: number, boost = 0.35) => {
    const f = level * (FLOOR + RANGE * Math.min(1, Math.max(0, boost)));
    for (const s of spots) s.intensity = BEAM_INTENSITY * f;
    for (const t of tails) t.intensity = TAIL_GLOW * f;
    if (lamp) lamp.emissiveIntensity = baseEmissive * f;
    if (lampRed) lampRed.emissiveIntensity = RED_LENS_EMISSIVE * f;
  };
  setLevel(0);

  return {
    group,
    setLevel,
    dispose: () => {
      spots.forEach((s) => s.dispose());
      tails.forEach((t) => t.dispose());
    },
  };
}
