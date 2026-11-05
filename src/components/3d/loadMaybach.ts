import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VehicleMaterials } from './vehicleBuilders';

/**
 * Mercedes-Maybach 2022 (Mpgs Studios, CC-BY-4.0) — decimated from 2.37 M to ~86 k triangles,
 * one primitive per material (11 draw calls), 16-bit quantised vertex data (KHR_mesh_quantization,
 * decoded natively by GLTFLoader — no extra decoder needed). Already in the normalised car frame:
 * floor y = 0, centred, nose towards +z, real-world size (5.46 m long).
 */
const MODEL_URL = `${import.meta.env.BASE_URL}models/maybach.glb`;

export interface LoadedMaybach {
  model: THREE.Object3D;
  lamp: THREE.MeshStandardMaterial | null;
  lampRed: THREE.MeshStandardMaterial[];
  /** the body paint material (used to recolour the Maybachs parked in the showroom) */
  paint: THREE.MeshPhysicalMaterial;
}

export async function loadMaybach(mats: VehicleMaterials, _maxAnisotropy = 1): Promise<LoadedMaybach> {
  const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
  const model = gltf.scene;
  model.name = 'Maybach';

  // black obsidian paint with a deep clear-coat
  const paint = new THREE.MeshPhysicalMaterial({
    color: 0x07080a,
    metalness: 0.55,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.3,
  });
  const plastic = new THREE.MeshStandardMaterial({ color: 0x0d0e10, metalness: 0.3, roughness: 0.55 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x050506, metalness: 0.45, roughness: 0.3 });

  let lamp: THREE.MeshStandardMaterial | null = null;
  const lampRed: THREE.MeshStandardMaterial[] = [];
  const replaced: Record<string, THREE.Material> = {
    Paint_Body: paint,
    Chrome: mats.chrome,
    Glass: mats.glass,
    Tire: mats.tire,
    Plastic_Dark: plastic,
    Trim_Black: trim,
  };

  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const m = mesh.material as THREE.MeshStandardMaterial;
    if (m.name === 'Lamp') lamp = m;
    else if (m.name === 'Lamp_Red' || m.name === 'Lamp_Red_Bar') lampRed.push(m);
    const swap = replaced[m.name];
    if (swap) {
      m.dispose();
      mesh.material = swap;
    }
    if (m.name === 'Glass') mesh.castShadow = false;
  });
  // the lamps start dark — the lights button fades them on
  if (lamp) (lamp as THREE.MeshStandardMaterial).emissiveIntensity = 1.8;

  return { model, lamp, lampRed, paint };
}
