"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { PALETTE } from "@/lib/palette";

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

const prefersStill =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ARM_MODEL_URL = "/models/arm/arm.glb";

useGLTF.preload(ARM_MODEL_URL);

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

const orangeHandMaterial = new THREE.MeshPhysicalMaterial({
  color: "#1c0b08",
  emissive: PALETTE.accent,
  emissiveIntensity: 0.03,
  metalness: 0.86,
  roughness: 0.38,
  clearcoat: 0.42,
  clearcoatRoughness: 0.28,
  sheen: 0.55,
  sheenColor: new THREE.Color(PALETTE.accent),
  sheenRoughness: 0.42,
  transparent: true,
  opacity: 0.84,
  depthWrite: true,
  side: THREE.DoubleSide,
});

/* The light section uses the same exact arm.glb with a fully opaque physical
   orange metal. Opacity there would expose the model's internal surfaces. */
const lateOrangeHandMaterial = new THREE.MeshPhysicalMaterial({
  color: PALETTE.accent,
  metalness: 0.76,
  roughness: 0.28,
  clearcoat: 0.48,
  clearcoatRoughness: 0.2,
  side: THREE.DoubleSide,
});

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

type EarlyHandFrame = [number, number, number, number, number, number, number, number];

/* Lenis hero path: rise from the lower-left, cross toward center, then roll
   onto its side alongside the sticky Why headline before leaving the scene. */
const EARLY_HAND_KEYFRAMES: EarlyHandFrame[] = [
  [0, -1.58, -2.28, 0.48, 0.2, -0.28, 1.46, 0.32],
  [0.18, -1.12, -1.72, 0.46, 0.12, -0.16, 1.34, 0.35],
  [0.4, 0.18, -1.08, 0.38, -0.08, 0.02, 1.12, 0.37],
  [0.66, 0.02, -0.2, 0.2, -0.16, 0.84, 0.82, 0.32],
  [0.84, 0.38, 0.08, 0.16, -0.25, 1.1, 0.7, 0.2],
  [1, 2.65, -0.02, 0.12, -0.32, 1.38, 0.68, 0],
];

function catmullRom(a: number, b: number, c: number, d: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    2 * b +
    (-a + c) * t +
    (2 * a - 5 * b + 4 * c - d) * t2 +
    (-a + 3 * b - 3 * c + d) * t3
  );
}

function sampleEarlyHand(p: number) {
  let index = 0;
  while (index < EARLY_HAND_KEYFRAMES.length - 2 && p > EARLY_HAND_KEYFRAMES[index + 1][0]) {
    index++;
  }
  const from = EARLY_HAND_KEYFRAMES[index];
  const to = EARLY_HAND_KEYFRAMES[index + 1];
  const before = EARLY_HAND_KEYFRAMES[Math.max(0, index - 1)];
  const after = EARLY_HAND_KEYFRAMES[Math.min(EARLY_HAND_KEYFRAMES.length - 1, index + 2)];
  const t = THREE.MathUtils.clamp((p - from[0]) / Math.max(0.001, to[0] - from[0]), 0, 1);
  const value = (slot: number) => catmullRom(before[slot], from[slot], to[slot], after[slot], t);
  return {
    x: value(1),
    y: value(2),
    rx: value(3),
    ry: value(4),
    rz: value(5),
    scale: value(6),
    opacity: THREE.MathUtils.clamp(value(7), 0, 1),
  };
}

function EarlyHandRig() {
  const group = useRef<THREE.Group>(null);
  const orangeLight = useRef<THREE.PointLight>(null);
  const arm = useChromeArm(ARM_MODEL_URL, 5.15, orangeHandMaterial);
  const motion = useRef({ ...sampleEarlyHand(0) });

  useFrame(({ clock }, delta) => {
    const rig = group.current;
    if (!rig) return;
    const target = sampleEarlyHand(earlyHandProgress.value);
    const pose = motion.current;
    const follow = 9.5;
    pose.x = THREE.MathUtils.damp(pose.x, target.x, follow, delta);
    pose.y = THREE.MathUtils.damp(pose.y, target.y, follow, delta);
    pose.rx = THREE.MathUtils.damp(pose.rx, target.rx, follow, delta);
    pose.ry = THREE.MathUtils.damp(pose.ry, target.ry, follow, delta);
    pose.rz = THREE.MathUtils.damp(pose.rz, target.rz, follow, delta);
    pose.scale = THREE.MathUtils.damp(pose.scale, target.scale, follow, delta);
    pose.opacity = THREE.MathUtils.damp(pose.opacity, target.opacity, 7.5, delta);
    const breathe = Math.sin(clock.elapsedTime * 0.72);

    rig.position.set(pose.x + breathe * 0.018, pose.y + breathe * 0.035, 0.1);
    rig.rotation.set(pose.rx + breathe * 0.008, pose.ry, pose.rz - breathe * 0.008);
    rig.scale.setScalar(pose.scale);
    rig.visible = pose.opacity > 0.01 && lightProgress.value < 0.02;
    orangeHandMaterial.opacity = THREE.MathUtils.clamp(pose.opacity * 2.05, 0, 0.74);
    if (orangeLight.current) {
      orangeLight.current.position.set(
        pose.x - 1.1 + breathe * 0.2,
        pose.y + 1.8,
        3.8,
      );
      orangeLight.current.intensity = pose.opacity * 8;
    }
  });

  return (
    <>
      <pointLight
        ref={orangeLight}
        color={PALETTE.accent}
        position={[-2.6, -0.4, 3.8]}
        intensity={3.5}
        distance={9}
        decay={2}
      />
      <group ref={group}>
        <group rotation={[0.5, Math.PI, 0]}>
          <group scale={arm.scale} position={arm.position}>
            <primitive object={arm.scene} />
          </group>
        </group>
      </group>
    </>
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
  const arm = useChromeArm(ARM_MODEL_URL, 5.05, lateOrangeHandMaterial);

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
  const withHand = !prefersStill;

  return (
    <>
      <ambientLight color="#a29a92" intensity={1} />
      <directionalLight color="#efefef" position={[-6, 5, 2]} intensity={1} />
      <directionalLight color="#efefef" position={[8, -3, 4]} intensity={1} />
      <ScrollSync />
      <Starfield />
      <LightParticles />
      {withHand && <EarlyHandRig />}
      {withHand && <HandRig />}
    </>
  );
}

export default function GLCanvas() {
  return (
    <div className="gl-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={() => {
          /* the intro loader listens for this to complete its progress */
          window.dispatchEvent(new CustomEvent("gl-ready"));
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
