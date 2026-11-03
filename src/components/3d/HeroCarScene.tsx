import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ChevronLeft, ChevronRight, Lightbulb, MousePointerClick } from 'lucide-react';
import { PAINT_COLORS, PaintColorKey } from './paints';
import { HERO_VIEWS } from './stages';
import { BuiltVehicle, createVehicleMaterials } from './vehicleBuilders';
import { loadLandCruiser } from './loadLandCruiser';
import { createCarLights, CarLights } from './carLights';
import { createRearPlate, RearPlate } from './rearPlate';
import { createEngineSound, EngineSound } from './engineAudio';
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

  useEffect(() => {
    lightsOnRef.current = lightsOn;
  }, [lightsOn]);

  // Lights button: switches the studio to near-blackout, brings the car's lights up,
  // and plays the Land Cruiser start-up (then a quiet idle). Off = engine shuts down.
  const toggleLights = useCallback(() => {
    const next = !lightsOnRef.current;
    lightsOnRef.current = next;
    setLightsOn(next);
    if (next) {
      engineRef.current?.start();
    } else {
      engineRef.current?.stop();
    }
  }, [setLightsOn]);

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
      const total = HERO_VIEWS.length;
      const next = ((idx % total) + total) % total;
      setShowHint(false);
      applyView(next);
    },
    [applyView]
  );

  const goNext = useCallback(() => goTo(viewIndexRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(viewIndexRef.current - 1), [goTo]);

  /* ---------------------------------------------------------------- */
  /*  Three.js — dark marble studio with vertical light strips          */
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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0d);
    scene.fog = new THREE.Fog(0x0a0b0d, 22, 58);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.55;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.copy(baseCamPosRef.current);

    // --- Dark marble floor with mirror polish ---
    // The mirror re-renders the whole scene every frame, so it is the most
    // expensive part: smaller texture on desktop, skipped entirely on mobile.
    let reflector: Reflector | null = null;
    if (!isMobile) {
      reflector = new Reflector(new THREE.PlaneGeometry(70, 70), {
        clipBias: 0.003,
        textureWidth: 512,
        textureHeight: 512,
        color: 0x4a4a4a,
      });
      reflector.rotation.x = -Math.PI / 2;
      scene.add(reflector);
    }

    const marble = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
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
    marble.position.y = 0.002;
    marble.receiveShadow = true;
    marble.renderOrder = 1;
    scene.add(marble);

    // --- Dark studio walls with vertical warm light strips ---
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.92, metalness: 0.08 });
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xfff2d8 });
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffd9a0,
      transparent: true,
      opacity: 0.11,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // All wall pieces are baked into 3 merged meshes (was ~80 separate draw calls,
    // each drawn twice because of the floor reflection).
    const wallGeos: THREE.BufferGeometry[] = [];
    const stripGeos: THREE.BufferGeometry[] = [];
    const glowGeos: THREE.BufferGeometry[] = [];
    const buildWall = (cx: number, cz: number, rotY: number) => {
      const wallM = new THREE.Matrix4().compose(
        new THREE.Vector3(cx, 0, cz),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)),
        new THREE.Vector3(1, 1, 1)
      );
      const place = (geo: THREE.BufferGeometry, x: number, y: number, z: number, list: THREE.BufferGeometry[]) => {
        geo.applyMatrix4(wallM.clone().multiply(new THREE.Matrix4().makeTranslation(x, y, z)));
        list.push(geo);
      };
      place(new THREE.PlaneGeometry(34, 13), 0, 6.5, 0, wallGeos);
      place(new THREE.BoxGeometry(34, 0.35, 0.14), 0, 0.18, 0.05, wallGeos);
      for (let i = -4; i <= 4; i++) {
        place(new THREE.BoxGeometry(0.075, 7.6, 0.06), i * 3.3, 3.9, 0.06, stripGeos);
        place(new THREE.PlaneGeometry(0.62, 8.1), i * 3.3, 3.9, 0.1, glowGeos);
      }
    };
    buildWall(0, -11, 0);
    buildWall(0, 12, Math.PI);
    buildWall(-11.5, 0, Math.PI / 2);
    buildWall(11.5, 0, -Math.PI / 2);
    const wallMesh = new THREE.Mesh(mergeGeometries(wallGeos)!, wallMat);
    const stripMesh = new THREE.Mesh(mergeGeometries(stripGeos)!, stripMat);
    const glowMesh = new THREE.Mesh(mergeGeometries(glowGeos)!, glowMat);
    scene.add(wallMesh, stripMesh, glowMesh);
    wallGeos.concat(stripGeos, glowGeos).forEach((g) => g.dispose());

    // --- Lighting ---
    const hemi = new THREE.HemisphereLight(0xb9c6d8, 0x0a0b0d, 0.32);
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
    let rearPlate = null as RearPlate | null;
    let lightLevel = 0;
    let boost = 0.35; // engine-loudness drive of the car lights (smoothed)
    let fxOn = false;
    loadLandCruiser(mats, Math.min(renderer.capabilities.getMaxAnisotropy(), 8))
      .then(({ model, lamp, lampRed }) => {
        if (disposed) return;
        vehicle.group.add(model);
        lightFx = createCarLights(lamp, lampRed);
        lightFx.setLevel(0);
        vehicle.group.add(lightFx.group);
        // number plate on the tailgate, carrying the brand logo
        rearPlate = createRearPlate(Math.min(renderer.capabilities.getMaxAnisotropy(), 8));
        vehicle.group.add(rearPlate.group);
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
    const stripBase = new THREE.Color(0xfff2d8);
    const bgDay = new THREE.Color(0x0a0b0d);
    const bgNight = new THREE.Color(0x010102);
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
      stripMat.color.copy(stripBase).multiplyScalar(mix(1, 0.015, l));
      glowMat.opacity = mix(0.11, 0, l);
      marbleMat.envMapIntensity = mix(0.35, 0.03, l);
      particleMat.opacity = mix(0.5, 0.06, l);
      bg.copy(bgDay).lerp(bgNight, l);
      fog.color.copy(bg);
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
      if (Math.abs(camera.fov - baseFovRef.current) > 0.01) {
        camera.fov += (baseFovRef.current - camera.fov) * k;
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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
      observer.disconnect();
      lightFx?.dispose();
      rearPlate?.dispose();
      reflector?.dispose();
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

      {/* Slider edge affordances */}
      <div
        className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:flex items-center gap-2 transition-all duration-300 ${
          hoverSide === 'left' && !isDragging ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-2'
        }`}
      >
        <div className="w-11 h-11 rounded-full border border-[#D4AF37]/60 bg-black/35 backdrop-blur-md flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#E8C858]" />
        </div>
        <span className="text-[9px] font-mono tracking-[0.28em] uppercase text-[#E8C858]/80 font-bold">
          Prev
        </span>
      </div>
      <div
        className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:flex items-center gap-2 transition-all duration-300 ${
          hoverSide === 'right' && !isDragging ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span className="text-[9px] font-mono tracking-[0.28em] uppercase text-[#E8C858]/80 font-bold">
          Next
        </span>
        <div className="w-11 h-11 rounded-full border border-[#D4AF37]/60 bg-black/35 backdrop-blur-md flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-[#E8C858]" />
        </div>
      </div>

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
          <span>{hoverSide === 'right' ? 'Next View' : 'Previous View'}</span>
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
          Click left / right to walk the 13 studio views
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
            {pad(viewIndex + 1)} / {pad(HERO_VIEWS.length)}
          </span>
          <span className="w-px h-3 bg-white/25" />
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
