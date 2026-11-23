import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { VehicleMaterials } from './vehicleBuilders';

/**
 * BMW M3 Competition (G80) 2021 — web build of the 198 MB source model.
 *
 *   1.42 M → 94.8 k triangles · 26 primitives (one per material) · 560 KB on disk
 *   16-bit quantised positions, 8-bit octahedral normals, EXT_meshopt_compression
 *   (decoded by the same tiny MeshoptDecoder the Land Cruiser already uses)
 *
 * Already in the normalised car frame, in metres: floor y = 0, centred, nose towards +z,
 * 4.82 m long, 2.06 m wide, 1.46 m high. No textures — every material is replaced below by name.
 */
const MODEL_URL = `${import.meta.env.BASE_URL}models/bmw-m3.glb`;

/**
 * Measured on bmw-m3.glb — handy when wiring the car into the hero sequence
 * (camera views in stages.ts, CarLightLayout in carLights.ts, rear plate in rearPlate.ts).
 */
export const BMW_M3_MEASURES = {
  length: 4.82,
  wheelRadius: 0.341,
  /** wheel centres: x = ±0.792, y = 0.341; front axle z = +1.535, rear axle z = -1.325 */
  wheelCentres: { frontZ: 1.535, rearZ: -1.325, x: 0.792, y: 0.341 },
  /** front lamp strip: x ±0.82, y 0.61–0.73, z 1.98–2.19 */
  headlamp: { x: 0.82, yMin: 0.61, yMax: 0.73, zMin: 1.98, zMax: 2.19 },
  /** rear lamp bar: x ±0.78, y 0.83–0.93, z -2.25…-1.98 (red lens block y 0.38–0.94) */
  taillamp: { x: 0.78, yMin: 0.83, yMax: 0.93, z: -2.25 },
  /** rear plate recess: x ±0.26, y 0.75–0.86, z ≈ -2.25 */
  rearPlate: { x: 0.26, yMin: 0.75, yMax: 0.86, z: -2.25 },
} as const;

export interface LoadedBmwM3 {
  model: THREE.Object3D;
  lamp: THREE.MeshStandardMaterial | null;
  lampRed: THREE.MeshStandardMaterial[];
  /** the body paint material (recolour it to change the car's colour) */
  paint: THREE.MeshPhysicalMaterial;
}

export async function loadBmwM3(mats: VehicleMaterials, _maxAnisotropy = 1): Promise<LoadedBmwM3> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODEL_URL);
  const model = gltf.scene;
  model.name = 'BMW_M3';

  // Isle-of-Man-green style deep metallic paint with a clear-coat
  const paint = new THREE.MeshPhysicalMaterial({
    color: 0x0b3a2c,
    metalness: 0.6,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.3,
  });
  const std = (color: number, metalness: number, roughness: number) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness });

  const gloss = std(0x08090a, 0.35, 0.18);
  const matt = std(0x0e0f11, 0.2, 0.7);
  const leather = std(0x121214, 0.05, 0.6);
  const leatherBrown = std(0x4a2a18, 0.05, 0.55);
  const brushed = std(0xb9bcc2, 0.95, 0.32);
  const darkSteel = std(0x2a2c30, 0.9, 0.4);
  const carbon = std(0x050506, 0.4, 0.35);
  const caliper = std(0xc8102e, 0.4, 0.35);
  const blue = std(0x1c69d4, 0.3, 0.4);
  const white = std(0xe8e8ea, 0.1, 0.5);
  const lamp = new THREE.MeshStandardMaterial({
    color: 0xdfe6ff, emissive: 0xbfd0ff, emissiveIntensity: 1.8, metalness: 0.1, roughness: 0.15, name: 'Lamp',
  });
  const lampRedMat = new THREE.MeshStandardMaterial({
    color: 0x5a0508, emissive: 0xff1018, emissiveIntensity: 0.9, metalness: 0.1, roughness: 0.2, name: 'Lamp_Red',
  });
  const lampRedBar = lampRedMat.clone();
  const redLens = new THREE.MeshPhysicalMaterial({
    color: 0x3a0306, metalness: 0, roughness: 0.08, transmission: 0, clearcoat: 1,
  });

  const byName: Record<string, THREE.Material> = {
    body: paint,
    black_shiny: gloss,
    black: gloss,
    black_matt: matt,
    interior: leather,
    interior_brown: leatherBrown,
    dash: matt,
    chrome: mats.chrome,
    logo: mats.chrome,
    silver: brushed,
    silver_d: brushed,
    glass: mats.glass,
    d_glass: mats.glass,
    r_glass: redLens,
    tire_mat5: mats.tire,
    calipers: caliper,
    brakes3: darkSteel,
    carbon,
    blue,
    white,
    plate: white,
    mpower_logo: blue,
    lights: lamp,
    r_lights: lampRedBar,
    d_red: lampRedMat,
    red: redLens,
  };

  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const src = mesh.material as THREE.Material;
    const swap = byName[src.name];
    src.dispose();
    if (swap) mesh.material = swap;
    mesh.castShadow = src.name !== 'glass' && src.name !== 'd_glass' && src.name !== 'r_glass';
    mesh.receiveShadow = true;
    // the rear plate of the model is replaced by the gallery's own logo plate (rearPlate.ts)
    if (src.name === 'plate') {
      mesh.geometry.computeBoundingBox();
      const c = mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
      if (c.z < 0) mesh.visible = false;
    }
  });

  return { model, lamp, lampRed: [lampRedMat, lampRedBar], paint };
}
