"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { PALETTE } from "@/lib/palette";

/* react-three-fiber v9 constructs a THREE.Clock internally on every Canvas
   mount, and three r183+ prints a one-off deprecation notice from Clock's
   constructor (the switch to THREE.Timer only landed in r3f v10, still alpha).
   We can't stop r3f from creating that Clock, so we route three's own console
   output through its official hook and drop just that single line — every other
   three log/warn/error is forwarded untouched and the global console is never
   patched. Remove once react-three-fiber v10 is stable. */
if (typeof THREE.setConsoleFunction === "function") {
  THREE.setConsoleFunction((type, message, ...params) => {
    if (
      typeof message === "string" &&
      message.includes("Clock: This module has been deprecated")
    ) {
      return;
    }
    const sink =
      type === "warn" ? console.warn : type === "error" ? console.error : console.log;
    sink(message, ...params);
  });
}

type Progress = { value: number };

/* module-level singletons: written once per frame, read by every child */
const lightProgress: Progress = { value: 0 };
const handProgress: Progress = { value: 0 };
const earlyHandProgress: Progress = { value: 0 };
/** 1 while the rethink zoom-through-the-T is still on screen. The hand keeps
    its normal pose schedule underneath, but is rendered invisible for the whole
    dive so it never intrudes on that transition; the gate only lifts once the
    cream T has fully flooded the frame, so the hand is revealed behind the
    flood and simply appears — already pointing up — as the Solution section
    scrolls in. */
const handHidden: Progress = { value: 0 };
/** Progress at which the flood is solid cream (matches Rethink's BG_FLIP_AT);
    the hand's visibility gate lifts here, safely behind that cream. */
const HAND_REVEAL_AT = 0.99;
/** Signed, lightly smoothed px/frame scroll speed — positive while scrolling
    down. Drives the starfield's warp-tunnel travel and streak length. */
const warpVelocity: Progress = { value: 0 };

const ARM_MODEL_URL = "/models/arm/arm.glb";

/* Skip the eager preload under reduced motion — the Canvas below never
   mounts in that mode, so nothing would ever use this GLB. Read directly at
   module scope rather than from a hook: this file is client-only (evaluated
   once in the browser, never during SSR), and preloading needs to fire
   before any component gets a chance to render anyway. */
if (typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  useGLTF.preload(ARM_MODEL_URL);
}

/* ------------------------------------------------------------------ */
/* Scroll sync — measured straight from the DOM every frame, so pin    */
/* spacers and refreshes can never knock the ranges out of alignment   */
/* ------------------------------------------------------------------ */

function ScrollSync() {
  const hero = useRef<HTMLElement | null>(null);
  const why = useRef<HTMLElement | null>(null);
  const rethink = useRef<HTMLElement | null>(null);
  const heat = useRef<HTMLElement | null>(null);
  const lastScrollY = useRef<number | null>(null);

  useFrame(() => {
    const scrollY = window.scrollY;

    /* tracked unconditionally (not gated on the .rethink lookup below) so
       the starfield keeps reacting to scroll speed even before that node
       resolves */
    if (lastScrollY.current === null) lastScrollY.current = scrollY;
    const delta = scrollY - lastScrollY.current;
    lastScrollY.current = scrollY;
    warpVelocity.value = THREE.MathUtils.lerp(warpVelocity.value, delta, 0.18);

    if (!hero.current) hero.current = document.querySelector<HTMLElement>(".hero");
    if (!why.current) why.current = document.querySelector<HTMLElement>(".why");
    if (hero.current && why.current) {
      const whyBounds = why.current.getBoundingClientRect();
      const whyTop = whyBounds.top + scrollY;
      const earlyEnd = whyTop + whyBounds.height * 0.72;
      earlyHandProgress.value = THREE.MathUtils.clamp(scrollY / Math.max(1, earlyEnd), 0, 1);
    }

    if (!rethink.current) {
      rethink.current = document.querySelector<HTMLElement>(".rethink");
      if (!rethink.current) return;
    }
    if (!heat.current) {
      heat.current = document.querySelector<HTMLElement>(".heat");
      if (!heat.current) return;
    }
    const bounds = rethink.current.getBoundingClientRect();
    const heatBounds = heat.current.getBoundingClientRect();
    const top = bounds.top + scrollY;
    const heatTop = heatBounds.top + scrollY;
    const viewportHeight = window.innerHeight;
    const docEnd = document.documentElement.scrollHeight - window.innerHeight;
    const solutionStart = top + viewportHeight * 0.05;
    const solutionEnd = top + bounds.height - viewportHeight;
    const solutionProgress = THREE.MathUtils.clamp(
      (scrollY - solutionStart) / Math.max(1, solutionEnd - solutionStart),
      0,
      1,
    );

    /* Match the exact late horizontal wipe used by the DOM takeover. */
    lightProgress.value = THREE.MathUtils.clamp((solutionProgress - 0.545) / 0.455, 0, 1);

    /* Hide the hand for the entire rethink dive (solutionProgress tracks that
       section), lifting only once the cream flood is solid — see handHidden. */
    handHidden.value = solutionProgress < HAND_REVEAL_AT ? 1 : 0;

    /* Lenis uses one continuous light-scene hand path. The exact Heat pose
       lands at a fixed point in our rig, then the model completes almost two
       Y-axis turns between the Heat start and the page end. Splitting the
       normalization here keeps that pose stable even when other sections
       change height. */
    const handStart = solutionStart + (solutionEnd - solutionStart) * 0.45;
    const heatKeyframe = 0.42;

    if (scrollY < heatTop) {
      const leadIn = THREE.MathUtils.clamp(
        (scrollY - handStart) / Math.max(1, heatTop - handStart),
        0,
        1,
      );
      handProgress.value = leadIn * heatKeyframe;
    } else {
      const heatToEnd = THREE.MathUtils.clamp(
        (scrollY - heatTop) / Math.max(1, docEnd - heatTop),
        0,
        1,
      );
      handProgress.value = THREE.MathUtils.lerp(
        heatKeyframe,
        1,
        heatToEnd,
      );
    }
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Starfield — a warp tunnel that answers the scroll: gentle idle drift */
/* at rest, then streaking into hyperspace-style trails while           */
/* scrolling — trail direction follows scroll direction, so scrolling   */
/* down dives forward into the site and scrolling up falls back out,    */
/* the same way the Star Wars jump-to-lightspeed stars stream past in   */
/* whichever direction the ship is travelling. One shared per-star      */
/* depth array drives both the point sprites and their streak trails,   */
/* recycling out inside a fade zone so nothing visibly pops. Still      */
/* fades out with the dark→light flip exactly as before.                */
/* ------------------------------------------------------------------ */

const STAR_COUNT = 1600;
const FIELD_RADIUS = 15;
const FAR_Z = -22;
const NEAR_Z = -1;
const SPAN = NEAR_Z - FAR_Z;
const FADE_ZONE = 3;
const IDLE_DRIFT = 0.004;
const WARP_TO_Z = 0.006;
const MAX_TRAVEL = 0.6;
const STREAK_TO_LEN = 0.06;
const MAX_STREAK = 6;

const STAR_COLOR = new THREE.Color("#f0dcd2");
const STREAK_COLOR = new THREE.Color(PALETTE.accentSoft);

type StarState = {
  sx: Float32Array;
  sy: Float32Array;
  sz: Float32Array;
  seed: Float32Array;
  dotPositions: Float32Array;
  dotColors: Float32Array;
  linePositions: Float32Array;
  lineColors: Float32Array;
};

/** (Re)spawns star `i` at a random point on a flattened disc. Called on
    init and every time a star recycles past either depth boundary. */
function spawnStar(
  i: number,
  sx: Float32Array,
  sy: Float32Array,
  sz: Float32Array,
  seed: Float32Array,
  z?: number,
) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * FIELD_RADIUS;
  sx[i] = Math.cos(angle) * radius;
  sy[i] = Math.sin(angle) * radius * 0.72;
  sz[i] = z ?? FAR_Z + Math.random() * SPAN;
  seed[i] = 0.55 + Math.random() * 0.45;
}

/** Writes star `i`'s current depth into both the dot and streak buffers.
    Brightness (not material opacity) carries the near/far recycle fade —
    correct here since it only has to disappear into the near-black hero
    background; the real dark→light fade stays on material opacity. */
function writeStar(i: number, s: StarState, speedGlow: number, streakLen: number) {
  const { sx, sy, sz, seed, dotPositions, dotColors, linePositions, lineColors } = s;
  const z = sz[i];
  const fadeNear = 1 - THREE.MathUtils.smoothstep(z, NEAR_Z - FADE_ZONE, NEAR_Z);
  const fadeFar = THREE.MathUtils.smoothstep(z, FAR_Z, FAR_Z + FADE_ZONE);
  const alpha = fadeNear * fadeFar * seed[i];
  const glow = 1 + speedGlow * 0.6;

  const di = i * 3;
  dotPositions[di] = sx[i];
  dotPositions[di + 1] = sy[i];
  dotPositions[di + 2] = z;
  dotColors[di] = STAR_COLOR.r * alpha * glow;
  dotColors[di + 1] = STAR_COLOR.g * alpha * glow;
  dotColors[di + 2] = STAR_COLOR.b * alpha * glow;

  const li = i * 6;
  const headAlpha = alpha * speedGlow;
  linePositions[li] = sx[i];
  linePositions[li + 1] = sy[i];
  linePositions[li + 2] = z;
  linePositions[li + 3] = sx[i];
  linePositions[li + 4] = sy[i];
  linePositions[li + 5] = z - streakLen;
  lineColors[li] = STREAK_COLOR.r * headAlpha;
  lineColors[li + 1] = STREAK_COLOR.g * headAlpha;
  lineColors[li + 2] = STREAK_COLOR.b * headAlpha;
  /* tail fades to black — the correct look for a light trail, not a cutout */
  lineColors[li + 3] = 0;
  lineColors[li + 4] = 0;
  lineColors[li + 5] = 0;
}

type SimState = {
  sx: Float32Array;
  sy: Float32Array;
  sz: Float32Array;
  seed: Float32Array;
};

function buildSimState(): SimState {
  const sx = new Float32Array(STAR_COUNT);
  const sy = new Float32Array(STAR_COUNT);
  const sz = new Float32Array(STAR_COUNT);
  const seed = new Float32Array(STAR_COUNT);
  for (let i = 0; i < STAR_COUNT; i++) spawnStar(i, sx, sy, sz, seed);
  return { sx, sy, sz, seed };
}

/** Zero-filled placeholders for the very first commit — invisible until the
    first useFrame tick fills in real positions/colors, since a zeroed color
    buffer already reads as fully black (nothing to flash). The live per-star
    simulation (sx/sy/sz/seed, which has no Three.js-side counterpart) lives
    in a ref that's only ever touched inside useFrame, never during render —
    reading `.current` during render (even to seed JSX) is exactly what trips
    the React Compiler's "no ref access during render" check. */
function Starfield() {
  const group = useRef<THREE.Group>(null);
  const dotsGeo = useRef<THREE.BufferGeometry>(null);
  const dotsMaterial = useRef<THREE.PointsMaterial>(null);
  const linesGeo = useRef<THREE.BufferGeometry>(null);
  const lineMaterial = useRef<THREE.LineBasicMaterial>(null);
  const sim = useRef<SimState | null>(null);

  useFrame(({ clock }) => {
    if (!sim.current) sim.current = buildSimState();
    const { sx, sy, sz, seed } = sim.current;

    const dotsAttr = dotsGeo.current?.attributes.position as THREE.BufferAttribute | undefined;
    const dotsColorAttr = dotsGeo.current?.attributes.color as THREE.BufferAttribute | undefined;
    const linesAttr = linesGeo.current?.attributes.position as THREE.BufferAttribute | undefined;
    const linesColorAttr = linesGeo.current?.attributes.color as THREE.BufferAttribute | undefined;
    if (!dotsAttr || !dotsColorAttr || !linesAttr || !linesColorAttr) return;

    const warp = THREE.MathUtils.clamp(warpVelocity.value, -140, 140);
    const travel = THREE.MathUtils.clamp(IDLE_DRIFT + warp * WARP_TO_Z, -MAX_TRAVEL, MAX_TRAVEL);
    const streakLen = THREE.MathUtils.clamp(warp * STREAK_TO_LEN, -MAX_STREAK, MAX_STREAK);
    const speedGlow = THREE.MathUtils.clamp(Math.abs(warp) / 55, 0, 1);
    const dark = 1 - lightProgress.value;

    const frame: StarState = {
      sx,
      sy,
      sz,
      seed,
      dotPositions: dotsAttr.array as Float32Array,
      dotColors: dotsColorAttr.array as Float32Array,
      linePositions: linesAttr.array as Float32Array,
      lineColors: linesColorAttr.array as Float32Array,
    };

    for (let i = 0; i < STAR_COUNT; i++) {
      const z = sz[i] + travel;
      if (z > NEAR_Z) {
        spawnStar(i, sx, sy, sz, seed, z - SPAN);
      } else if (z < FAR_Z) {
        spawnStar(i, sx, sy, sz, seed, z + SPAN);
      } else {
        sz[i] = z;
      }
      writeStar(i, frame, speedGlow, streakLen);
    }

    dotsAttr.needsUpdate = true;
    dotsColorAttr.needsUpdate = true;
    linesAttr.needsUpdate = true;
    linesColorAttr.needsUpdate = true;
    if (dotsMaterial.current) dotsMaterial.current.opacity = 0.85 * dark;
    if (lineMaterial.current) lineMaterial.current.opacity = 0.9 * dark;
    if (group.current) {
      group.current.rotation.z = clock.elapsedTime * 0.008;
      group.current.position.y = Math.sin(clock.elapsedTime * 0.12) * 0.35;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry ref={dotsGeo}>
          <bufferAttribute attach="attributes-position" args={[new Float32Array(STAR_COUNT * 3), 3]} />
          <bufferAttribute attach="attributes-color" args={[new Float32Array(STAR_COUNT * 3), 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={dotsMaterial}
          size={0.035}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry ref={linesGeo}>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(STAR_COUNT * 2 * 3), 3]}
          />
          <bufferAttribute attach="attributes-color" args={[new Float32Array(STAR_COUNT * 2 * 3), 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMaterial}
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/* Lenis keeps a much smaller field of warm particles alive after the light
   takeover. It must be a separate draw call: making unused dark-scene stars
   black would turn all 1,600 of them into soot on the cream background. */
const LIGHT_PARTICLE_COUNT = 100;

function LightParticles() {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const { width, height } = useThree((state) => state.viewport);
  const positions = useMemo(() => {
    const values = new Float32Array(LIGHT_PARTICLE_COUNT * 3);
    const seeded = (value: number) => {
      const raw = Math.sin(value * 12.9898) * 43758.5453;
      return raw - Math.floor(raw);
    };

    for (let index = 0; index < LIGHT_PARTICLE_COUNT; index++) {
      const offset = index * 3;
      values[offset] = (seeded(offset + 1) - 0.5) * 1.12;
      values[offset + 1] = (seeded(offset + 2) - 0.5) * 1.12;
      values[offset + 2] = -0.5 - seeded(offset + 3) * 1.5;
    }

    return values;
  }, []);

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.opacity = lightProgress.value * 0.4;
    }
    if (group.current) {
      group.current.rotation.z = -clock.elapsedTime * 0.006;
      group.current.position.y = Math.sin(clock.elapsedTime * 0.16) * 0.025;
    }
  });

  return (
    <group ref={group} scale={[width, height, 1]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={material}
          color="#de886d"
          size={0.026}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Arm models — C4D exports ship without materials and at ~70 units,   */
/* so every mesh gets the shared chrome and the rig is Box3-normalized */
/* ------------------------------------------------------------------ */

const chromeMaterial = new THREE.MeshStandardMaterial({
  color: "#efefef",
  metalness: 0.6,
  roughness: 0.4,
  side: THREE.DoubleSide,
});

const orangeHandMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uAccent: { value: new THREE.Color(PALETTE.accent) },
    uLightDirection: { value: new THREE.Vector3(-4, 3, 1).normalize() },
  },
  vertexShader: `
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uAccent;
    uniform vec3 uLightDirection;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vWorldNormal);
      if (!gl_FrontFacing) normal *= -1.0;
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      vec3 halfDirection = normalize(uLightDirection + viewDirection);

      float diffuse = max(dot(normal, uLightDirection), 0.0);
      float specular = pow(max(dot(normal, halfDirection), 0.0), 30.0);
      float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.3);
      float light = 0.012 + diffuse * 0.045 + rim * 0.34 + specular * 0.9;

      gl_FragColor = vec4(uAccent * light, 1.0);
    }
  `,
  side: THREE.DoubleSide,
  depthWrite: true,
  transparent: false,
  toneMapped: false,
});

/* The light section deliberately stays neutral silver. Only the early dark
   scene receives the orange Lenis-style lighting. */
const lateSilverHandMaterial = new THREE.MeshPhysicalMaterial({
  color: "#9f9996",
  emissive: "#000000",
  emissiveIntensity: 0,
  metalness: 1,
  roughness: 0.16,
  clearcoat: 0.15,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.45,
  side: THREE.DoubleSide,
});

function SilverChromeEnvironment() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    /* Prefiltering the room environment is a few hundred ms of synchronous
       GPU+CPU work. Running it on mount lands it squarely inside the intro
       loader's glyph animation, stalling the main thread long enough to
       visibly stutter the reveal and push back its timers. Nothing needs
       this map until the silver hand appears in the light half of the page,
       far below the fold, so it waits for an idle gap instead. The timeout
       guarantees it still resolves on busy machines that never go idle. */
    let cancelled = false;
    let environmentTarget: THREE.WebGLRenderTarget | null = null;

    const build = () => {
      if (cancelled) return;
      const pmrem = new THREE.PMREMGenerator(gl);
      const room = new RoomEnvironment();
      environmentTarget = pmrem.fromScene(room, 0.03);

      lateSilverHandMaterial.envMap = environmentTarget.texture;
      lateSilverHandMaterial.needsUpdate = true;

      room.dispose();
      pmrem.dispose();
    };

    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(build, { timeout: 2500 })
        : window.setTimeout(build, 1200);

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function" && typeof idle === "number") {
        window.cancelIdleCallback(idle);
      }
      window.clearTimeout(idle as number);
      if (environmentTarget) {
        if (lateSilverHandMaterial.envMap === environmentTarget.texture) {
          lateSilverHandMaterial.envMap = null;
          lateSilverHandMaterial.needsUpdate = true;
        }
        environmentTarget.dispose();
      }
    };
  }, [gl]);

  return null;
}

/** Center + scale factors so an object's longest axis spans `target` world units.
    No reparenting here — mutating the cached GLTF graph inside useMemo breaks
    under StrictMode double-invocation; transforms are applied via group props.
    The measurement is cached per object so it always reflects the bind pose,
    never a mid-animation state from an earlier mount. */
const measureCache = new WeakMap<THREE.Object3D, { size: THREE.Vector3; center: THREE.Vector3 }>();

function useNormalized(object: THREE.Object3D, target: number) {
  return useMemo(() => {
    let measured = measureCache.get(object);
    if (!measured) {
      const box = new THREE.Box3().setFromObject(object);
      measured = { size: box.getSize(new THREE.Vector3()), center: box.getCenter(new THREE.Vector3()) };
      measureCache.set(object, measured);
    }
    const { size, center } = measured;
    const scale = target / Math.max(size.x, size.y, size.z);
    return {
      scale,
      position: [-center.x * scale, -center.y * scale, -center.z * scale] as const,
    };
  }, [object, target]);
}

/** The arm GLBs ship without materials — every mesh gets the shared chrome.
    The cached GLTF scene is cloned per mount: attaching the shared instance
    directly breaks under StrictMode/HMR remounts (the unmounting tree detaches
    it from its new parent). */
function useChromeArm(
  url: string,
  targetHeight: number,
  material: THREE.Material = chromeMaterial,
) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const copy = cloneSkeleton(scene);
    copy.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.frustumCulled = false;
      }
    });
    return copy;
  }, [scene, material]);
  const normalized = useNormalized(cloned, targetHeight);
  return { scene: cloned, ...normalized };
}

type EarlyHandFrame = [number, number, number, number, number, number, number];

/* Lenis runtime poses, expressed as viewport-relative positions and raw-GLB
   scale ratios: progress, x/W, y/H, rawScale/H, rotation XYZ. */
const EARLY_HAND_KEYFRAMES: EarlyHandFrame[] = [
  [0, -0.1, -1.75, 0.045, 0, Math.PI / 2, 0],
  [0.4, 0.15, -0.4, 0.02, -Math.PI / 4, -3 * Math.PI / 4, -Math.PI / 4],
  [0.8, 0.15, -0.4, 0.02, Math.PI / 4, -7 * Math.PI / 4, -Math.PI / 4],
  [1, 0.68, -0.4, 0.018, Math.PI / 4, -7 * Math.PI / 4, -Math.PI / 4],
];

const RAW_ARM_HEIGHT = 73.3446655;
const NORMALIZED_ARM_HEIGHT = 5.15;

function sampleEarlyHand(p: number, width: number, height: number) {
  let index = 0;
  while (index < EARLY_HAND_KEYFRAMES.length - 2 && p > EARLY_HAND_KEYFRAMES[index + 1][0]) {
    index++;
  }
  const from = EARLY_HAND_KEYFRAMES[index];
  const to = EARLY_HAND_KEYFRAMES[index + 1];
  const t = THREE.MathUtils.clamp((p - from[0]) / Math.max(0.001, to[0] - from[0]), 0, 1);
  return {
    x: THREE.MathUtils.lerp(from[1], to[1], t) * width,
    y: THREE.MathUtils.lerp(from[2], to[2], t) * height,
    scale:
      THREE.MathUtils.lerp(from[3], to[3], t) * height * RAW_ARM_HEIGHT /
      NORMALIZED_ARM_HEIGHT,
    rx: THREE.MathUtils.lerp(from[4], to[4], t),
    ry: THREE.MathUtils.lerp(from[5], to[5], t),
    rz: THREE.MathUtils.lerp(from[6], to[6], t),
  };
}

function EarlyHandRig() {
  const group = useRef<THREE.Group>(null);
  const { width, height } = useThree((state) => state.viewport);
  const arm = useChromeArm(ARM_MODEL_URL, 5.15, orangeHandMaterial);

  useFrame(() => {
    const rig = group.current;
    if (!rig) return;
    const pose = sampleEarlyHand(earlyHandProgress.value, width, height);
    rig.position.set(pose.x, pose.y, 0);
    rig.rotation.set(pose.rx, pose.ry, pose.rz);
    rig.scale.setScalar(pose.scale);
    rig.visible = earlyHandProgress.value < 0.995 && lightProgress.value < 0.02;
  });

  return (
    <group ref={group}>
      <group scale={arm.scale} position={arm.position}>
        <primitive object={arm.scene} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Later hand rig — the same exact arm.glb remains continuously present */
/* through the light half of the page. No geometry swap is allowed.     */
/* ------------------------------------------------------------------ */

/** Piecewise keyframes: [progress, x, y, rotX, rotY, rotZ, scale]. Interpolated
    with smoothstep easing between the two bracketing stops. */
const HAND_KEYFRAMES: Array<
  [number, number, number, number, number, number, number]
> = [
  [0.0, 1.5, -8.5, 0.5, -0.5, 0.05, 0.9],
  [0.17, 1.7, -0.65, 0.42, -0.14, 0.05, 1.0], // OPEN pose
  [0.22, 1.2, -3.6, 0.4, 0.0, 0.05, 0.95], // offscreen pose swap
  [0.27, 0.7, -0.8, 0.16, 0.05, 0.02, 1.04], // POINT pose
  [0.34, 0.65, -1.55, 0.08, 3.49, -0.28, 1.34], // Lenis light-start pose
  [0.42, 0.0, -1.0, 0.0, -0.244, -0.279, 1.2], // exact Heat start
  [1.0, 1.7, -1.15, 0.0, -12.217, -0.279, 1.28], // page end: -700deg Y, matched to lenis.dev: bigger hand, finger high-right
];

function sampleHand(p: number) {
  const frames = HAND_KEYFRAMES;
  let i = 0;
  while (i < frames.length - 2 && p > frames[i + 1][0]) i++;
  const [p0, x0, y0, rx0, ry0, rz0, s0] = frames[i];
  const [p1, x1, y1, rx1, ry1, rz1, s1] = frames[i + 1];
  const t = p1 > p0 ? THREE.MathUtils.smoothstep((p - p0) / (p1 - p0), 0, 1) : 0;
  return {
    x: THREE.MathUtils.lerp(x0, x1, t),
    y: THREE.MathUtils.lerp(y0, y1, t),
    rotX: THREE.MathUtils.lerp(rx0, rx1, t),
    rotY: THREE.MathUtils.lerp(ry0, ry1, t),
    rotZ: THREE.MathUtils.lerp(rz0, rz1, t),
    scale: THREE.MathUtils.lerp(s0, s1, t),
  };
}

function HandRig() {
  const group = useRef<THREE.Group>(null);
  const arm = useChromeArm(ARM_MODEL_URL, 5.05, lateSilverHandMaterial);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const p = handProgress.value;
    const { x, y, rotX, rotY, rotZ, scale } = sampleHand(p);

    const idle = Math.sin(clock.elapsedTime * 0.8);
    g.position.set(x + idle * 0.025, y + idle * 0.055, 0);
    g.rotation.set(rotX + idle * 0.012, rotY, rotZ - idle * 0.01);
    g.scale.setScalar(scale);
    g.visible = p > 0.001 && handHidden.value < 0.5;
  });

  return (
    <group ref={group} visible={false}>
      <group rotation={[0.5, Math.PI, 0]}>
        <group scale={arm.scale} position={arm.position}>
          <primitive object={arm.scene} />
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene + canvas                                                      */
/* ------------------------------------------------------------------ */

function Scene() {
  return (
    <>
      <ambientLight color="#a29a92" intensity={1} />
      <directionalLight color="#efefef" position={[-6, 5, 2]} intensity={1} />
      <directionalLight color="#efefef" position={[8, -3, 4]} intensity={1} />
      <SilverChromeEnvironment />
      <ScrollSync />
      <Starfield />
      <LightParticles />
      <EarlyHandRig />
      <HandRig />
    </>
  );
}

/** Some privacy extensions and locked-down GPUs make WebGL context creation
    throw (three/r3f surface that as a render-time error). Without a boundary
    here, that error is uncaught and Next's root error boundary tears down
    the entire page for a failure that should only cost the decorative 3D
    layer. Also fires gl-ready so the intro loader isn't left waiting on a
    signal that will now never arrive from Canvas.onCreated. */
class GLErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("GLCanvas: WebGL scene failed, hiding the 3D layer.", error);
    window.dispatchEvent(new CustomEvent("gl-ready"));
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type GLPreferences = {
  reducedMotion: boolean;
  compactViewport: boolean;
  glSupported: boolean;
};

/** Synchronous WebGL2 capability probe. three r163+ only ever requests a
    'webgl2' context (no WebGL1 fallback — see WebGLRenderer's constructor),
    so that's the exact check that predicts whether mounting <Canvas> below
    can succeed. Running it upfront means a device without WebGL2 (no
    hardware acceleration on some corporate/VM setups, an old browser, WebGL
    disabled outright) skips the attempt entirely instead of relying on the
    failure path to catch it after the fact. The throwaway context is force-
    lost right away so it doesn't sit on the browser's small live-context
    budget before the real canvas asks for its own. */
function detectWebGL2Support() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2", { failIfMajorPerformanceCaveat: false });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function useGLPreferences() {
  const [preferences, setPreferences] = useState<GLPreferences | null>(null);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewportQuery = window.matchMedia("(max-width: 899px)");
    const glSupported = detectWebGL2Support();
    const syncPreferences = () => {
      const next = {
        reducedMotion: reducedMotionQuery.matches,
        compactViewport: compactViewportQuery.matches,
        glSupported,
      };
      setPreferences((current) =>
        current?.reducedMotion === next.reducedMotion &&
        current.compactViewport === next.compactViewport &&
        current.glSupported === next.glSupported
          ? current
          : next,
      );
    };

    /* Keep the server and first client render identical (initial state is
       null, matching SSR), then resolve both media queries as soon as this
       effect commits. This used to be deferred one requestAnimationFrame,
       but rAF is throttled or never fires at all in backgrounded/prerendered
       tabs — that left `preferences` stuck at null forever and silently
       dropped the whole 3D scene with no error. Reading matchMedia straight
       from the effect body has no such dependency on the paint loop. */
    syncPreferences();
    reducedMotionQuery.addEventListener("change", syncPreferences);
    compactViewportQuery.addEventListener("change", syncPreferences);

    return () => {
      reducedMotionQuery.removeEventListener("change", syncPreferences);
      compactViewportQuery.removeEventListener("change", syncPreferences);
    };
  }, []);

  return preferences;
}

export default function GLCanvas() {
  const preferences = useGLPreferences();
  /* Sticky for the lifetime of the page: once the runtime safety net below
     trips, we stop trying to render the scene rather than bouncing back and
     forth on every subsequent rejection. */
  const [glFailed, setGlFailed] = useState(false);
  const canRenderScene =
    !!preferences && !preferences.reducedMotion && preferences.glSupported && !glFailed;

  useEffect(() => {
    if (!preferences || canRenderScene) return;

    /* No Canvas gets mounted below — reduced motion, no WebGL2, or the
       runtime failure caught further down — but the intro loader must still
       receive the same readiness contract it would from Canvas.onCreated. */
    const readyFrame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("gl-ready"));
    });
    return () => window.cancelAnimationFrame(readyFrame);
  }, [preferences, canRenderScene]);

  useEffect(() => {
    if (!canRenderScene) return;

    /* Safety net for a real gap in react-three-fiber: Canvas constructs the
       WebGLRenderer inside an async function that gets called without being
       awaited or given a .catch(), so a context-creation failure that slips
       past the synchronous probe above (context lost mid-init, GPU process
       killed, a driver crash on first use) surfaces as an unhandled promise
       rejection instead of a thrown render error. It never enters React's
       render/commit cycle at all, so GLErrorBoundary can't see it. Treat
       that one failure mode the same way componentDidCatch does: warn once,
       stop trying to render the scene, and unblock the intro loader. */
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const { reason } = event;
      const message = reason instanceof Error ? reason.message : String(reason ?? "");
      if (!/webgl/i.test(message)) return;
      event.preventDefault();
      console.warn("GLCanvas: WebGL context failed after mount, hiding the 3D layer.", reason);
      setGlFailed(true);
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", onUnhandledRejection);
  }, [canRenderScene]);

  return (
    <div className="gl-canvas" aria-hidden="true">
      {preferences && canRenderScene && (
        <GLErrorBoundary>
          <Canvas
            dpr={preferences.compactViewport ? [1, 1.25] : [1, 1.75]}
            camera={{ position: [0, 0, 6], fov: 42 }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
              /* Let the browser fall back to a software/ANGLE renderer
                 instead of refusing context creation outright — locked-down
                 corporate machines and some older mobile GPUs disable
                 hardware acceleration but can still render WebGL. */
              failIfMajorPerformanceCaveat: false,
            }}
            onCreated={() => {
              /* the intro loader listens for this to complete its progress */
              window.dispatchEvent(new CustomEvent("gl-ready"));
            }}
          >
            <Scene />
          </Canvas>
        </GLErrorBoundary>
      )}
    </div>
  );
}
