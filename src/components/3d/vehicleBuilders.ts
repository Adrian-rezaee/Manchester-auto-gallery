import * as THREE from 'three';
import type { PaintColorOption } from './paints';

/* ------------------------------------------------------------------ */
/*  Shared material palette per vehicle                                */
/* ------------------------------------------------------------------ */

export interface VehicleMaterials {
  body: THREE.MeshPhysicalMaterial;
  gold: THREE.MeshPhysicalMaterial;
  chrome: THREE.MeshPhysicalMaterial;
  blackSatin: THREE.MeshStandardMaterial;
  blackGloss: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
  tire: THREE.MeshStandardMaterial;
  rim: THREE.MeshPhysicalMaterial;
  rotor: THREE.MeshStandardMaterial;
  interior: THREE.MeshStandardMaterial;
  headlight: THREE.MeshStandardMaterial;
  taillight: THREE.MeshStandardMaterial;
  amber: THREE.MeshStandardMaterial;
}

export interface BuiltVehicle {
  group: THREE.Group;
  materials: VehicleMaterials;
  headlightSpots: THREE.SpotLight[];
}

export function createVehicleMaterials(paint: PaintColorOption): VehicleMaterials {
  return {
    body: new THREE.MeshPhysicalMaterial({
      color: paint.hex,
      metalness: paint.metalness,
      roughness: paint.roughness,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.0,
    }),
    gold: new THREE.MeshPhysicalMaterial({
      color: paint.accentHex,
      metalness: 1.0,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.2,
    }),
    chrome: new THREE.MeshPhysicalMaterial({
      color: 0xf2f2f2,
      metalness: 1.0,
      roughness: 0.06,
      envMapIntensity: 1.2,
    }),
    blackSatin: new THREE.MeshStandardMaterial({
      color: 0x15171b,
      metalness: 0.25,
      roughness: 0.55,
    }),
    blackGloss: new THREE.MeshPhysicalMaterial({
      color: 0x0b0d10,
      metalness: 0.4,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x0f151c,
      metalness: 0.2,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transparent: true,
      opacity: 0.58,
      envMapIntensity: 1.4,
    }),
    tire: new THREE.MeshStandardMaterial({
      color: 0x17181a,
      metalness: 0.05,
      roughness: 0.85,
    }),
    rim: new THREE.MeshPhysicalMaterial({
      color: 0x1a1c20,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    }),
    rotor: new THREE.MeshStandardMaterial({
      color: 0xb9bcc2,
      metalness: 0.9,
      roughness: 0.3,
    }),
    interior: new THREE.MeshStandardMaterial({
      color: 0xf3eee4,
      metalness: 0.05,
      roughness: 0.7,
    }),
    headlight: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff6dc,
      emissiveIntensity: 2.5,
      roughness: 0.1,
      metalness: 0.2,
    }),
    taillight: new THREE.MeshStandardMaterial({
      color: 0x8a0f1a,
      emissive: 0xff2030,
      emissiveIntensity: 1.6,
      roughness: 0.15,
      metalness: 0.3,
    }),
    amber: new THREE.MeshStandardMaterial({
      color: 0xffb020,
      emissive: 0xff9a00,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    }),
  };
}

export function applyPaint(vehicle: BuiltVehicle, paint: PaintColorOption): void {
  vehicle.materials.body.color.set(paint.hex);
  vehicle.materials.body.metalness = paint.metalness;
  vehicle.materials.body.roughness = paint.roughness;
  vehicle.materials.gold.color.set(paint.accentHex);
}
