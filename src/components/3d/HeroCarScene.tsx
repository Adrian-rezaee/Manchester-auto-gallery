import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { ChevronLeft, ChevronRight, Lightbulb, MousePointerClick } from 'lucide-react';
import { PAINT_COLORS, PaintColorKey } from './paints';
import { HERO_VIEWS, CAR_LABEL, CAR_ORDER, CAR_FIRST_INDEX, CAR_VIEW_COUNT, CarKey } from './stages';
import { BuiltVehicle, createVehicleMaterials } from './vehicleBuilders';
import { loadLandCruiser } from './loadLandCruiser';
import { loadMaybach } from './loadMaybach';
import {
  createCarLights,
  CarLights,
  CarLightLayout,
  LAND_CRUISER_LIGHTS,
  MAYBACH_LIGHTS,
} from './carLights';
import { createRearPlate, RearPlate, MAYBACH_PLATE } from './rearPlate';
import { createEngineSound, EngineSound } from './engineAudio';
import { createShowroomBackdrop, ROOM_W, ROOM_D, ROOM_CZ } from './showroomBackdrop';
import { useTheme } from '../../theme/ThemeContext';

const UP = new THREE.Vector3(0, 1, 0);

export const HeroCarScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  // UI state
  const [viewIndex, setViewIndex] = useState(0);
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  // shared with the page theme: lights on = whole site goes dark, lights off = back to light
  const { lightsOn, setLightsOn } = useTheme();
  const [showHint, setShowHint] = useState(true);
  // car-to-car transition overlay (golden light sweep + cinema bars + car name)
  const [sweep, setSweep] = useState<{ key: number; dir: 1 | -1; car: CarKey } | null>(null);
  const [switching, setSwitching] = useState(false);

  // Mutable refs
  const viewIndexRef = useRef(0);
  const paintRef = useRef<PaintColorKey>('pearlWhite');
  const vehicleRef = useRef<BuiltVehicle | null>(null);
  const baseCamPosRef = useRef(new THREE.Vector3(6, 2, 6));
  const baseFovRef = useRef(36);
  const targetCamPosRef = useRef(new THREE.Vector3(6, 2, 6));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 1, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 1, 0));
  const parallaxRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef({ current: 0, target: 0, velocity: 0, free: false });
  const pointerRef = useRef({ down: false, moved: false, startX: 0, startY: 0, lastX: 0, startTime: 0 });
  const engineRef = useRef<EngineSound | null>(null);
  const lightsOnRef = useRef(false);
  // set by the three.js effect: lets the slider ask for a car swap / an early download of the Maybach
  const carControlRef = useRef<{ switchCar: (dir: 1 | -1) => void; preload: () => void } | null>(null);

  useEffect(() => {
    lightsOnRef.current = lightsOn;
  }, [lightsOn]);

  // Lights button: just flips the shared theme (lights on = dark mode, off = light mode)
  const toggleLights = useCallback(() => {
    setLightsOn(!lightsOnRef.current);
  }, [setLightsOn]);

  // Whatever flips the theme — this button OR the header dark-mode switch — the engine follows:
  // on = the start-up sound of the car on screen (Land Cruiser or Maybach), off = engine shuts down.
  // While it is dark, sliding over to the other car starts that car's own start-up sound.
  const activeCar = HERO_VIEWS[viewIndex].car;
  const prevLightsRef = useRef(lightsOn);
  const prevCarRef = useRef<CarKey>(activeCar);
  useEffect(() => {
    const lightsChanged = prevLightsRef.current !== lightsOn;
    const carChanged = prevCarRef.current !== activeCar;
    prevLightsRef.current = lightsOn;
    prevCarRef.current = activeCar;
    if (lightsChanged) {
      if (lightsOn) engineRef.current?.start(activeCar);
      else engineRef.current?.stop();
    } else if (carChanged && lightsOn) {
      engineRef.current?.start(activeCar);
    }
  }, [lightsOn, activeCar]);

  // the engine recording is fetched + decoded up front so the click plays instantly
  useEffect(() => {
    const engine = createEngineSound();
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /*  View logic — the slider                                           */
  /* ---------------------------------------------------------------- */

  const applyView = useCallback((idx: number) => {
    const view = HERO_VIEWS[idx];
    const container = containerRef.current;
    const aspect = container ? container.clientWidth / Math.max(1, container.clientHeight) : 1.7;

    // distance scale for narrow viewports so the subject always fits
    const distScale = aspect < 0.8 ? 1.95 : aspect < 1.2 ? 1.5 : aspect < 1.6 ? 1.12 : 1;
    const center = new THREE.Vector3(...view.lookAt);
    const pos = new THREE.Vector3(...view.pos);
    const offset = pos.clone().sub(center).multiplyScalar(distScale);
    const finalPos = center.clone().add(offset);

    // lateral framing: vehicle sits right of the headline copy on wide screens
    const forward = center.clone().sub(finalPos).normalize();
    const right = new THREE.Vector3().crossVectors(forward, UP).normalize();
    const shift = aspect >= 1.3 ? view.shift ?? 0 : 0;
    finalPos.sub(right.clone().multiplyScalar(shift));
    center.sub(right.clone().multiplyScalar(shift));

    // stacked layout (mobile/tablet): the canvas sits below the copy, so frame the
    // car in the upper part of its own area
    const lift = aspect < 1.3 ? -0.3 : 0;
    center.y += lift;
    finalPos.y += lift * 0.55;

    baseCamPosRef.current.copy(finalPos);
    baseFovRef.current = view.fov ?? 36;
    targetLookAtRef.current.copy(center);
    yawRef.current.target = 0;
    yawRef.current.free = false;
    yawRef.current.velocity = 0;
    viewIndexRef.current = idx;
    setViewIndex(idx);
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      // screen clicks only walk the camera angles of the car on show — they never change the car
      const car = HERO_VIEWS[viewIndexRef.current].car;
      const first = CAR_FIRST_INDEX[car];
      const n = CAR_VIEW_COUNT[car];
      const next = first + ((((idx - first) % n) + n) % n);
      setShowHint(false);
      applyView(next);
    },
    [applyView]
  );

  // slider arrows: switch from one car to the other (animated)
  const switchCar = useCallback((dir: 1 | -1) => {
    setShowHint(false);
    carControlRef.current?.switchCar(dir);
  }, []);

  const goNext = useCallback(() => goTo(viewIndexRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(viewIndexRef.current - 1), [goTo]);

  /* ---------------------------------------------------------------- */
  /*  Three.js — glass-front Manchester Auto Gallery showroom          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const isMobile = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: 'high-performance',
    });
    // Sharp by default; the render loop steps this down automatically if frames get slow
    const maxDpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
    let curDpr = maxDpr;
    renderer.setPixelRatio(curDpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Shadows only change when the car turns (or finishes loading), so the depth pass is
    // re-run on demand instead of every frame. Same shadows, a whole render pass saved.
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    let lastShadowYaw = Number.NaN;

    const scene = new THREE.Scene();

    // Glass-front Manchester Auto Gallery showroom (golden hour outside, night with lights on)
    const backdrop = createShowroomBackdrop({
      isMobile,
      maxAnisotropy: Math.min(renderer.capabilities.getMaxAnisotropy(), 8),
    });
    scene.add(backdrop.group);
    scene.background = new THREE.Color().copy(backdrop.horizon);
    scene.fog = new THREE.Fog(backdrop.horizon.getHex(), 70, 330);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.55;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.copy(baseCamPosRef.current);

    // --- Dark marble floor with mirror polish ---
    // The mirror re-renders the whole scene every frame, so it is the most
    // expensive part: smaller texture on desktop, skipped entirely on mobile.
    let reflector: Reflector | null = null;
    if (!isMobile) {
      reflector = new Reflector(new THREE.PlaneGeometry(ROOM_W, ROOM_D), {
        clipBias: 0.003,
        textureWidth: 512,
        textureHeight: 512,
        color: 0x4a4a4a,
      });
      reflector.rotation.x = -Math.PI / 2;
      reflector.position.z = ROOM_CZ;
      // The mirror re-draws the whole room, so it refreshes every other frame; the floor keeps
      // the previous reflection in between (a 1/60 s lag, not visible).
      const mirrorRender = reflector.onBeforeRender.bind(reflector);
      let mirrorTick = 0;
      reflector.onBeforeRender = (...args: Parameters<typeof mirrorRender>) => {
        if ((mirrorTick++ & 1) === 0) mirrorRender(...args);
      };
      scene.add(reflector);
    }

    const marble = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W, ROOM_D),
      new THREE.MeshPhysicalMaterial({
        color: 0x15171b,
        roughness: 0.42,
        metalness: 0.18,
        transparent: !isMobile,
        opacity: isMobile ? 1 : 0.74,
        envMapIntensity: 0.35,
      })
    );
    marble.rotation.x = -Math.PI / 2;
    marble.position.set(0, 0.002, ROOM_CZ);
    marble.receiveShadow = true;
    marble.renderOrder = 1;
    scene.add(marble);

    // --- Lighting ---
    const hemi = new THREE.HemisphereLight(0xf0d4aa, 0x15171b, 0.36);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(5, 8.5, 6.5);
    key.castShadow = true;
    key.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 32;
    key.shadow.camera.left = -4.3;
    key.shadow.camera.right = 4.3;
    key.shadow.camera.top = 4.3;
    key.shadow.camera.bottom = -4.3;
    key.shadow.bias = -0.0005;
    key.shadow.radius = 3;
    scene.add(key);
    scene.add(key.target);

    const warmRim = new THREE.DirectionalLight(0xffdfa8, 0.75);
    warmRim.position.set(-6.5, 4, -5.5);
    scene.add(warmRim);

    const frontFill = new THREE.DirectionalLight(0xdfe7f2, 0.4);
    frontFill.position.set(0, 2.5, 9);
    scene.add(frontFill);

    const wallGlowA = new THREE.PointLight(0xffe0b0, 55, 26, 2);
    wallGlowA.position.set(-5.5, 3.4, -8.5);
    scene.add(wallGlowA);
    const wallGlowB = new THREE.PointLight(0xffe0b0, 55, 26, 2);
    wallGlowB.position.set(5.5, 3.4, -8.5);
    scene.add(wallGlowB);

    // --- Hero vehicle ---
    const mats = createVehicleMaterials(PAINT_COLORS[paintRef.current]);
    const vehicle: BuiltVehicle = {
      group: new THREE.Group(),
      materials: mats,
      headlightSpots: [],
    };
    scene.add(vehicle.group);
    vehicleRef.current = vehicle;

    // Load the Land Cruiser GLB (+ the lights-on effect)
    let disposed = false;
    let lightFx = null as CarLights | null;
    const viewerPos = new THREE.Vector3();
    let lightLevel = 0;
    let boost = 0.35; // engine-loudness drive of the car lights (smoothed)
    let fxOn = false;
    const aniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    // One entry per car. The cars share a single set of headlight/tail lights (the light count
    // never changes, so no shader recompiles) which are moved onto whichever car is showing.
    interface CarEntry {
      root: THREE.Group;
      lamp: THREE.MeshStandardMaterial | null;
      lampRed: THREE.MeshStandardMaterial[];
      layout: CarLightLayout;
      plate: RearPlate;
    }
    const carEntries: Partial<Record<CarKey, CarEntry>> = {};
    let wantedCar: CarKey = HERO_VIEWS[viewIndexRef.current].car;
    let shownCar: CarKey | null = null;
    const syncCar = () => {
      const entry = carEntries[wantedCar];
      if (!entry || !lightFx || shownCar === wantedCar) return;
      (Object.keys(carEntries) as CarKey[]).forEach((k) => {
        carEntries[k]!.root.visible = k === wantedCar;
      });
      lightFx.setCar({ lamp: entry.lamp, lampRed: entry.lampRed }, entry.layout);
      // the cars parked around the hero car change model together with it
      backdrop.showDisplayCars(wantedCar);
      shownCar = wantedCar;
      renderer.shadowMap.needsUpdate = true;
    };

    let maybachRequested = false;
    const requestMaybach = () => {
      if (maybachRequested) return;
      maybachRequested = true;
      loadMaybach(mats, aniso)
        .then(({ model, lamp, lampRed, paint }) => {
          if (disposed) return;
          const root = new THREE.Group();
          root.name = 'MaybachRoot';
          root.add(model);
          // Maybachs parked along the glass too (shown only while the Maybach is the hero car)
          if (!isMobile) backdrop.addDisplayCars('maybach', model, paint);
          const plate = createRearPlate(aniso, MAYBACH_PLATE);
          root.add(plate.group);
          vehicle.group.add(root);
          carEntries.maybach = { root, lamp, lampRed, layout: MAYBACH_LIGHTS, plate };
          // compile its shaders now (while hidden from view) so the swap does not hitch
          root.visible = true;
          renderer.compileAsync(scene, camera).catch(() => undefined);
          root.visible = false;
          syncCar();
        })
        .catch((err) => {
          maybachRequested = false;
          console.error('Maybach GLB load failed', err);
        });
    };

    // ---- car-to-car transition: the old car drives out, the new one sweeps in with a spin ----
    const SLIDE = 17;
    const trans = { phase: 'idle' as 'idle' | 'out' | 'in', t: 0, dir: 1 as 1 | -1, next: wantedCar };
    let swapCounter = 0;
    let fovPunch = 0;
    carControlRef.current = {
      switchCar: (dir: 1 | -1) => {
        if (trans.phase !== 'idle') return;
        const i = CAR_ORDER.indexOf(wantedCar);
        const next = CAR_ORDER[(i + dir + CAR_ORDER.length) % CAR_ORDER.length];
        trans.phase = 'out';
        trans.t = 0;
        trans.dir = dir;
        trans.next = next;
        if (next === 'maybach') requestMaybach();
        setSwitching(true);
        setSweep({ key: ++swapCounter, dir, car: next });
      },
      preload: requestMaybach,
    };
    // fetch the Maybach quietly in the background so the first swap is instant
    const preloadTimer = window.setTimeout(requestMaybach, 2500);

    loadLandCruiser(mats, aniso)
      .then(({ model, lamp, lampRed }) => {
        if (disposed) return;
        const root = new THREE.Group();
        root.name = 'LandCruiserRoot';
        root.add(model);
        // other cars parked along the glass, like the real showroom (desktop only)
        if (!isMobile) backdrop.addDisplayCars('landcruiser', model, mats.body);
        renderer.shadowMap.needsUpdate = true;
        lightFx = createCarLights(lamp, lampRed, LAND_CRUISER_LIGHTS);
        lightFx.setLevel(0);
        vehicle.group.add(root, lightFx.group);
        // number plate on the tailgate, carrying the brand logo
        const plate = createRearPlate(aniso);
        root.add(plate.group);
        carEntries.landcruiser = { root, lamp, lampRed: lampRed ? [lampRed] : [], layout: LAND_CRUISER_LIGHTS, plate };
        syncCar();
        if (wantedCar === 'maybach') requestMaybach();
      })
      .catch((err) => console.error('GLB load failed', err));

    // --- Ambient dust ---
    const particleCount = 55;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = Math.random() * 4;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.03, transparent: true, opacity: 0.5 })
    );
    scene.add(particles);

    // Initial framing with a cinematic entrance
    applyView(viewIndexRef.current);
    currentLookAtRef.current.copy(targetLookAtRef.current);
    camera.position.copy(baseCamPosRef.current).multiplyScalar(1.5);
    camera.position.y += 1.4;
    setIsLoaded(true);

    // --- Showroom mood: "lights on" takes the studio down to a near-blackout ---
    // Everything that lights the room is faded out — direct lights, the HDR environment,
    // the wall strips, the background/fog AND the mirror floor (the reflector re-draws the
    // room, so on desktop it has to be dimmed too). Only a faint rim stays so the car's
    // silhouette is readable; the headlamp beams do the rest.
    const mix = (a: number, b: number, t: number) => a + (b - a) * t;
    const reflectorDay = new THREE.Color(0x4a4a4a);
    const reflectorColor = reflector
      ? ((reflector.material as THREE.ShaderMaterial).uniforms.color.value as THREE.Color)
      : null;
    const marbleMat = marble.material as THREE.MeshPhysicalMaterial;
    const particleMat = particles.material as THREE.PointsMaterial;
    const bg = scene.background as THREE.Color;
    const fog = scene.fog as THREE.Fog;
    const applyMood = (l: number) => {
      key.intensity = mix(1.25, 0.02, l);
      warmRim.intensity = mix(0.75, 0.16, l); // keeps the silhouette readable
      frontFill.intensity = mix(0.4, 0, l);
      hemi.intensity = mix(0.32, 0.015, l);
      wallGlowA.intensity = wallGlowB.intensity = mix(55, 0, l);
      scene.environmentIntensity = mix(0.55, 0.045, l);
      backdrop.setMood(l); // golden hour → night, the gold sign keeps glowing
      marbleMat.envMapIntensity = mix(0.35, 0.03, l);
      particleMat.opacity = mix(0.5, 0.06, l);
      bg.copy(backdrop.horizon);
      fog.color.copy(backdrop.horizon);
      reflectorColor?.copy(reflectorDay).multiplyScalar(mix(1, 0.12, l));
    };

    // --- Render loop ---
    const clock = new THREE.Clock();
    let raf = 0;
    let warmFrames = 0;
    let perfAcc = 0;
    let perfFrames = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      // Adaptive resolution: if the average frame time stays above ~25 ms, drop the
      // pixel ratio one step (never below 1). Skips the first frames after loading.
      if (vehicle.group.children.length > 0 && rawDt < 0.25) {
        if (warmFrames < 90) {
          warmFrames++;
        } else {
          perfAcc += rawDt;
          perfFrames++;
          if (perfFrames >= 45) {
            const avg = perfAcc / perfFrames;
            perfAcc = 0;
            perfFrames = 0;
            if (avg > 1 / 40 && curDpr > 1) {
              curDpr = Math.max(1, curDpr - 0.25);
              renderer.setPixelRatio(curDpr);
            }
          }
        }
      }

      targetCamPosRef.current.copy(baseCamPosRef.current);
      targetCamPosRef.current.x += parallaxRef.current.x * 0.55;
      targetCamPosRef.current.y += parallaxRef.current.y * 0.35;
      const k = 1 - Math.exp(-dt * 3.1);
      camera.position.lerp(targetCamPosRef.current, k);
      currentLookAtRef.current.lerp(targetLookAtRef.current, k);
      camera.lookAt(currentLookAtRef.current);
      // car swap animation: old car accelerates out, new car decelerates in while spinning
      if (trans.phase !== 'idle') {
        const group = vehicle.group;
        if (trans.phase === 'out') {
          trans.t = Math.min(1, trans.t + dt / 0.55);
          group.position.x = -trans.dir * SLIDE * trans.t * trans.t * trans.t;
          fovPunch = 9 * Math.sin(trans.t * Math.PI * 0.5);
          if (trans.t >= 1 && carEntries[trans.next]) {
            // swap models while the car is off-screen (waits here if the Maybach is still downloading)
            wantedCar = trans.next;
            syncCar();
            applyView(CAR_FIRST_INDEX[wantedCar]);
            yawRef.current.current = trans.dir * 1.2;
            yawRef.current.target = 0;
            yawRef.current.free = false;
            yawRef.current.velocity = 0;
            group.position.x = trans.dir * SLIDE;
            trans.phase = 'in';
            trans.t = 0;
          }
        } else {
          trans.t = Math.min(1, trans.t + dt / 1.15);
          const e = 1 - Math.pow(1 - trans.t, 4);
          group.position.x = trans.dir * SLIDE * (1 - e);
          fovPunch = 9 * (1 - e);
          if (trans.t >= 1) {
            group.position.x = 0;
            fovPunch = 0;
            trans.phase = 'idle';
            setSwitching(false);
          }
        }
        renderer.shadowMap.needsUpdate = true;
      }
      const fovTarget = baseFovRef.current + fovPunch;
      if (Math.abs(camera.fov - fovTarget) > 0.01) {
        camera.fov += (fovTarget - camera.fov) * Math.max(k, 0.12);
        camera.updateProjectionMatrix();
      }

      const yaw = yawRef.current;
      const dragging = pointerRef.current.down && pointerRef.current.moved;
      if (!dragging) {
        if (yaw.free) {
          yaw.current += yaw.velocity;
          yaw.velocity *= 0.94;
        } else {
          yaw.current += (yaw.target - yaw.current) * (1 - Math.exp(-dt * 4));
        }
      }
      vehicle.group.rotation.y = yaw.current;
      if (yaw.current !== lastShadowYaw) {
        lastShadowYaw = yaw.current;
        renderer.shadowMap.needsUpdate = true;
      }

      // lights button: fade the lamp glow in / out
      const targetLevel = lightsOnRef.current ? 1 : 0;
      if (lightLevel !== targetLevel) {
        lightLevel += (targetLevel - lightLevel) * (1 - Math.exp(-dt * 3.2));
        if (Math.abs(targetLevel - lightLevel) < 0.002) lightLevel = targetLevel;
        applyMood(lightLevel);
      }

      // The car's own lights come up once the room has gone mostly dark, and then follow the
      // engine recording: dim while the starter cranks, surging with the exhaust note — both
      // the headlamps and the tail-lamps.
      if (lightLevel > 0 || fxOn) {
        const c = Math.min(1, Math.max(0, (lightLevel - 0.3) / 0.7));
        const target = engineRef.current ? engineRef.current.getLoudness() : 0.35;
        boost += (target - boost) * (1 - Math.exp(-dt * 16));
        lightFx?.setLevel(c * c * (3 - 2 * c), boost);
        lightFx?.setViewer(vehicle.group.worldToLocal(viewerPos.copy(camera.position)));
        fxOn = lightLevel > 0;
      }

      const attr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 1; i < particleCount * 3; i += 3) {
        let y = attr.array[i] as number;
        y += dt * 0.055;
        if (y > 4) y = 0.15;
        attr.array[i] = y;
      }
      attr.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // Stop rendering completely while the hero is scrolled out of view
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const start = () => {
      if (raf) return;
      clock.getDelta();
      perfAcc = 0;
      perfFrames = 0;
      warmFrames = 60;
      raf = requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    observer.observe(container);

    const handleResize = () => {
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      applyView(viewIndexRef.current);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.clearTimeout(preloadTimer);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
      observer.disconnect();
      lightFx?.dispose();
      carControlRef.current = null;
      (Object.keys(carEntries) as CarKey[]).forEach((k) => carEntries[k]!.plate.dispose());
      reflector?.dispose();
      backdrop.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Keyboard support                                                  */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[data-veltrix-modal]')) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 140) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  /* ---------------------------------------------------------------- */
  /*  Pointer — click right half → next view, left half → previous;     */
  /*  drag to spin the car                                              */
  /* ---------------------------------------------------------------- */

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    p.down = true;
    p.moved = false;
    p.startX = e.clientX;
    p.startY = e.clientY;
    p.lastX = e.clientX;
    p.startTime = performance.now();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const p = pointerRef.current;

    if (p.down) {
      const dx = e.clientX - p.lastX;
      if (!p.moved && Math.hypot(e.clientX - p.startX, e.clientY - p.startY) > 8) {
        p.moved = true;
        setIsDragging(true);
        yawRef.current.free = true;
      }
      if (p.moved) {
        yawRef.current.current += dx * 0.0055;
        yawRef.current.velocity = dx * 0.0055;
      }
      p.lastX = e.clientX;
      return;
    }

    if (e.pointerType === 'mouse') {
      const nx = localX / rect.width - 0.5;
      const ny = localY / rect.height - 0.5;
      parallaxRef.current = { x: nx, y: -ny };
      setHoverSide(nx >= 0 ? 'right' : 'left');
      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${localX}px, ${localY}px)`;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p.down) return;
    const wasClick = !p.moved && performance.now() - p.startTime < 600;
    p.down = false;
    p.moved = false;
    setIsDragging(false);
    if (!wasClick) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width;
    if (nx >= 0.5) goNext();
    else goPrev();
  };

  const handlePointerLeave = () => {
    setHoverSide(null);
    parallaxRef.current = { x: 0, y: 0 };
  };

  /* ---------------------------------------------------------------- */

  const view = HERO_VIEWS[viewIndex];
  const pad = (n: number) => String(n).padStart(2, '0');
  const stopPointer = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onPointerUp: (e: React.PointerEvent) => e.stopPropagation(),
    onPointerMove: (e: React.PointerEvent) => e.stopPropagation(),
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden ${
        isDragging ? 'cursor-grabbing' : hoverSide ? 'cursor-pointer' : 'cursor-grab'
      }`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Luminous scrims */}
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#08090B] via-[#08090B]/45 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-16 lg:h-36 pointer-events-none bg-gradient-to-b from-[#08090B]/90 via-[#08090B]/35 to-transparent" />

      {/* Slider arrows — these switch from car to car (with the animated swap).
          Clicking anywhere else on the left / right of the stage only changes the camera angle. */}
      <button
        type="button"
        onClick={() => switchCar(-1)}
        disabled={switching}
        aria-label="Previous car"
        title="Previous car"
        className="absolute left-3 md:left-7 top-1/2 -translate-y-1/2 z-30 group flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
        {...stopPointer}
      >
        <span className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-[#D4AF37]/60 bg-black/45 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] group-hover:scale-110 shadow-[0_0_18px_rgba(212,175,55,0.25)]">
          <ChevronLeft className="w-5 h-5 text-[#E8C858] group-hover:text-[#0E1013] transition-colors" />
        </span>
      </button>
      <button
        type="button"
        onClick={() => switchCar(1)}
        disabled={switching}
        aria-label="Next car"
        title="Next car"
        className="absolute right-3 md:right-7 top-1/2 -translate-y-1/2 z-30 group flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
        {...stopPointer}
      >
        <span className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-[#D4AF37]/60 bg-black/45 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] group-hover:scale-110 shadow-[0_0_18px_rgba(212,175,55,0.25)]">
          <ChevronRight className="w-5 h-5 text-[#E8C858] group-hover:text-[#0E1013] transition-colors" />
        </span>
      </button>

      {/* Car-swap effect: golden light streak, cinema bars and the new car's name */}
      {sweep && (
        <div
          key={sweep.key}
          className="car-swap-fx"
          style={{ ['--d' as string]: sweep.dir } as React.CSSProperties}
          aria-hidden
        >
          <div className="car-swap-vignette" />
          <div className="car-swap-bar car-swap-bar-top" />
          <div className="car-swap-bar car-swap-bar-bottom" />
          <div className="car-swap-streak" />
          <div className="car-swap-streak car-swap-streak-thin" />
          <div className="car-swap-title">
            <span>{CAR_LABEL[sweep.car]}</span>
          </div>
        </div>
      )}

      {/* Cursor follower (desktop) */}
      <div
        ref={followerRef}
        className={`absolute top-0 left-0 z-30 pointer-events-none hidden md:block transition-opacity duration-200 ${
          hoverSide && !isDragging ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`-translate-y-1/2 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/55 backdrop-blur-md border border-[#D4AF37]/50 text-[10px] font-mono font-bold tracking-[0.22em] uppercase text-[#F2E3B8] whitespace-nowrap ${
            hoverSide === 'right' ? 'translate-x-5' : '-translate-x-[calc(100%+1.25rem)]'
          }`}
        >
          {hoverSide === 'left' && <ChevronLeft className="w-3.5 h-3.5 text-[#E8C858]" />}
          <span>{hoverSide === 'right' ? 'Next Angle' : 'Previous Angle'}</span>
          {hoverSide === 'right' && <ChevronRight className="w-3.5 h-3.5 text-[#E8C858]" />}
        </div>
      </div>

      {/* One-time hint */}
      <div
        className={`absolute top-28 right-6 md:right-12 z-20 pointer-events-none hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/45 backdrop-blur-md border border-[#D4AF37]/35 transition-all duration-700 ${
          showHint ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <MousePointerClick className="w-4 h-4 text-[#E8C858]" />
        <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#E8C858]/90 font-bold">
          Click left / right for camera angles · arrows switch cars
        </span>
      </div>

      {/* Bottom centre: lights button + engine sound, with the view label under it */}
      <div className="absolute bottom-6 sm:bottom-20 lg:bottom-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-3">
        <div
          className="pointer-events-auto flex items-center gap-1.5 bg-black/45 backdrop-blur-md border border-[#D4AF37]/30 rounded-full p-1.5"
          {...stopPointer}
        >
          <button
            onClick={toggleLights}
            aria-pressed={lightsOn}
            title={lightsOn ? 'Turn the lights off' : 'Turn the lights on'}
            className={`flex items-center gap-2 pl-3 pr-4 py-2 rounded-full text-[10px] font-display font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
              lightsOn
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#E8C858] text-[#0E1013] shadow-[0_0_20px_rgba(232,200,88,0.55)]'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Lightbulb className={`w-4 h-4 ${lightsOn ? 'fill-[#0E1013]/20' : ''}`} />
            <span>{lightsOn ? 'Lights on' : 'Lights'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 text-[9px] sm:text-[10px] font-mono tracking-[0.2em] sm:tracking-[0.28em] uppercase whitespace-nowrap">
          <span className="text-[#E8C858] font-bold whitespace-nowrap">
            {pad(viewIndex - CAR_FIRST_INDEX[view.car] + 1)} / {pad(CAR_VIEW_COUNT[view.car])}
          </span>
          <span className="w-px h-3 bg-white/25" />
          <span className="text-white/45 whitespace-nowrap hidden sm:inline">{CAR_LABEL[view.car]}</span>
          <span className="w-px h-3 bg-white/25 hidden sm:block" />
          <span className="text-white/70 font-semibold whitespace-nowrap">{view.name}</span>
        </div>
      </div>

      {/* Entrance fade */}
      <div
        className={`absolute inset-0 bg-[#0A0B0D] pointer-events-none transition-opacity duration-1000 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};
