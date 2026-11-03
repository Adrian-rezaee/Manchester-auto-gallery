import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { VehicleMaterials } from './vehicleBuilders';

const MODEL_URL = `${import.meta.env.BASE_URL}models/landcruiser.glb`;
const TARGET_LENGTH = 4.95; // real Land Cruiser 300 length in metres
const FLIP_FRONT = false; // set true if the car faces backwards

// The GLB's body-paint material is named "Paint_Body" — it is swapped for the
// paintable material so the finish can be changed from code.
const BODY_REGEX = /^Paint_Body$/;

export interface LoadedCar {
  model: THREE.Object3D;
  /** shared lamp material (emissive LED atlas) — driven by the lights button */
  lamp: THREE.MeshStandardMaterial | null;
  /** rear red lens material — given an emissive glow by the lights button */
  lampRed: THREE.MeshStandardMaterial | null;
}

export async function loadLandCruiser(
  mats: VehicleMaterials,
  maxAnisotropy = 1
): Promise<LoadedCar> {
  const loader = new GLTFLoader();
  // Meshopt decoder is tiny (~20 KB) and bundled; Draco would add ~1.7 MB
  loader.setMeshoptDecoder(MeshoptDecoder);

  const gltf = await loader.loadAsync(MODEL_URL);
  const model = gltf.scene;
  let lamp: THREE.MeshStandardMaterial | null = null;
  let lampRed: THREE.MeshStandardMaterial | null = null;

  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    list.forEach((m) => {
      const std = m as THREE.MeshStandardMaterial;
      if (m.name === 'Lamp') lamp = std;
      if (m.name === 'Lamp_Red') lampRed = std;
      // crisper textures at grazing angles
      [std.map, std.emissiveMap, std.normalMap].forEach((t) => {
        if (t) t.anisotropy = maxAnisotropy;
      });
    });
    const next = list.map((m) => (BODY_REGEX.test(m.name) ? mats.body : m));
    mesh.material = Array.isArray(mesh.material) ? next : next[0];
  });

  // Make the long axis lie along Z
  let box = new THREE.Box3().setFromObject(model);
  let size = box.getSize(new THREE.Vector3());
  if (size.x > size.z) model.rotation.y = Math.PI / 2;
  if (FLIP_FRONT) model.rotation.y += Math.PI;

  // Normalise size
  box.setFromObject(model);
  size = box.getSize(new THREE.Vector3());
  model.scale.setScalar(TARGET_LENGTH / Math.max(size.x, size.z));

  // Centre and sit on the floor
  box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;

  return { model, lamp, lampRed };
}
