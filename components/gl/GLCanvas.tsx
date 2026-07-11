"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { PALETTE } from "@/lib/palette";

type Progress = { value: number };

/* module-level singletons: written once per frame, read by every child */
const lightProgress: Progress = { value: 0 };
const handProgress: Progress = { value: 0 };
/** Signed, lightly smoothed px/frame scroll speed — positive while scrolling
    down. Drives the starfield's warp-tunnel travel and streak length. */
const warpVelocity: Progress = { value: 0 };

const prefersStill =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ARM_OPEN_URL = "/models/arm/arm.glb";
const ARM_POINT_URL = "/models/arm/arm2.glb";

useGLTF.preload(ARM_OPEN_URL);
useGLTF.preload(ARM_POINT_URL);

/* ------------------------------------------------------------------ */
/* Scroll sync — measured straight from the DOM every frame, so pin    */
/* spacers and refreshes can never knock the ranges out of alignment   */
/* ------------------------------------------------------------------ */

function ScrollSync() {
  const rethink = useRef<HTMLElement | null>(null);
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

    if (!rethink.current) {
      rethink.current = document.querySelector<HTMLElement>(".rethink");
      if (!rethink.current) return;
    }
    const bounds = rethink.current.getBoundingClientRect();
    const top = bounds.top + scrollY;
    const viewportHeight = window.innerHeight;
    const docEnd = document.documentElement.scrollHeight - window.innerHeight;
    const solutionStart = top + viewportHeight * 0.5;
    const solutionEnd = top + bounds.height - viewportHeight;
    const solutionProgress = THREE.MathUtils.clamp(
      (scrollY - solutionStart) / Math.max(1, solutionEnd - solutionStart),
      0,
      1,
    );

    /* Match the exact late horizontal wipe used by the DOM takeover. */
    lightProgress.value = THREE.MathUtils.clamp((solutionProgress - 0.545) / 0.455, 0, 1);

    /* The hand begins halfway through the same normalized scene and then
       continues through the remaining light-page content. */
    const handStart = solutionStart + (solutionEnd - solutionStart) * 0.45;
    handProgress.value = THREE.MathUtils.clamp(
      (scrollY - handStart) / Math.max(1, docEnd - handStart),
      0,
      1,
    );
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

/* ------------------------------------------------------------------ */
/* Arm models — C4D exports ship without materials and at ~70 units,   */
/* so every mesh gets the shared chrome and the rig is Box3-normalized */
/* ------------------------------------------------------------------ */

const chromeMaterial = new THREE.MeshStandardMaterial({
  color: "#e8e6e3",
  metalness: 0.95,
  roughness: 0.25,
  envMapIntensity: 1.3,
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
function useChromeArm(url: string, targetHeight: number) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const copy = cloneSkeleton(scene);
    copy.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = chromeMaterial;
        child.frustumCulled = false;
      }
    });
    return copy;
  }, [scene]);
  const normalized = useNormalized(cloned, targetHeight);
  return { scene: cloned, ...normalized };
}

/* ------------------------------------------------------------------ */
/* Hand rig — modeled on lenis.dev's own hand sequence: the model stays */
/* visibly, continuously present from its entrance onward (it never    */
/* drifts fully offscreen the way our first pass did) — pointing up    */
/* through the solution paragraph, holding that pose through the heat  */
/* cards, then leaning in from the right for the footer. The two GLBs  */
/* we have (an open/cupped presenting pose and a pointing pose) still  */
/* require one hard swap since neither is a rigged blend target of the */
/* other; that swap is compressed into a short, brief dip (SWAP_START– */
/* SWAP_END below) so the hand reads as continuously on screen, the    */
/* same way lenis.dev's single rigged hand never disappears.           */
/* ------------------------------------------------------------------ */

/** Piecewise keyframes: [progress, x, y, rotX, rotY, scale]. Interpolated
    with smoothstep easing between the two bracketing stops. */
const HAND_KEYFRAMES: Array<[number, number, number, number, number, number]> = [
  [0.0, 1.5, -8.5, 0.5, -0.5, 0.9],
  [0.16, 1.7, -0.6, 0.42, -0.14, 1.0], // entrance complete, OPEN pose
  [0.2, 1.2, -3.6, 0.4, 0.0, 0.95], // dips just offscreen — pose swaps here
  [0.24, 0.7, -0.75, 0.16, 0.05, 1.0], // rises back in, already POINT pose
  [0.46, 0.0, -0.5, 0.1, 0.0, 1.05], // drifts to center through the solution copy
  [0.62, 1.4, -1.15, 0.08, -0.1, 1.18], // settles center-right, holds through heat
  [0.85, 2.1, -1.55, 0.06, -0.22, 1.26], // leans in from the right for the footer
  [1.0, 2.6, -1.9, 0.05, -0.28, 1.3],
];

/** Progress value at which the visible pose switches from OPEN to POINT —
    kept inside the brief SWAP_START–SWAP_END dip above, while y is at its
    most negative (offscreen), so the swap itself is never seen. */
const POSE_SWAP_AT = 0.22;

function sampleHand(p: number) {
  const frames = HAND_KEYFRAMES;
  let i = 0;
  while (i < frames.length - 2 && p > frames[i + 1][0]) i++;
  const [p0, x0, y0, rx0, ry0, s0] = frames[i];
  const [p1, x1, y1, rx1, ry1, s1] = frames[i + 1];
  const t = p1 > p0 ? THREE.MathUtils.smoothstep((p - p0) / (p1 - p0), 0, 1) : 0;
  return {
    x: THREE.MathUtils.lerp(x0, x1, t),
    y: THREE.MathUtils.lerp(y0, y1, t),
    rotX: THREE.MathUtils.lerp(rx0, rx1, t),
    rotY: THREE.MathUtils.lerp(ry0, ry1, t),
    scale: THREE.MathUtils.lerp(s0, s1, t),
  };
}

function HandRig() {
  const group = useRef<THREE.Group>(null);
  const openArm = useChromeArm(ARM_OPEN_URL, 4.6);
  const pointArm = useChromeArm(ARM_POINT_URL, 5.2);
  const openRef = useRef<THREE.Group>(null);
  const pointRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const p = handProgress.value;
    const { x, y, rotX, rotY, scale } = sampleHand(p);

    const idle = Math.sin(clock.elapsedTime * 0.8) * 0.07;
    g.position.set(x, y + idle, 0);
    g.rotation.set(rotX, rotY, 0.05);
    g.scale.setScalar(scale);
    g.visible = p > 0.001;

    /* pose handover happens while the rig is at its lowest (offscreen) point */
    if (openRef.current) openRef.current.visible = p < POSE_SWAP_AT;
    if (pointRef.current) pointRef.current.visible = p >= POSE_SWAP_AT;
  });

  return (
    <group ref={group} visible={false}>
      <group ref={openRef} rotation={[0.5, 0, 0]}>
        {/* palm-up: the export faces the palm away, so flip around the long axis */}
        <group rotation={[0, Math.PI, 0]}>
          <group scale={openArm.scale} position={openArm.position}>
            <primitive object={openArm.scene} />
          </group>
        </group>
      </group>
      <group ref={pointRef} visible={false}>
        <group scale={pointArm.scale} position={pointArm.position}>
          <primitive object={pointArm.scene} />
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene + canvas                                                      */
/* ------------------------------------------------------------------ */

function Scene() {
  const width = useThree((state) => state.size.width);
  const withHand = width >= 900 && !prefersStill;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />
      <ScrollSync />
      <Starfield />
      {withHand && <HandRig />}
      {withHand && (
        <Environment resolution={256} frames={1}>
          {/* soft dome plus fills — keeps the chrome bright instead of stripey */}
          <Lightformer intensity={1.6} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[22, 22, 1]} />
          <Lightformer intensity={1.1} position={[0, 2, 6]} scale={[14, 8, 1]} />
          <Lightformer intensity={0.9} position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[12, 8, 1]} />
          <Lightformer intensity={0.9} position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[12, 8, 1]} />
          <Lightformer intensity={0.5} color={PALETTE.accentSoft} position={[0, -5, 3]} scale={[10, 4, 1]} />
        </Environment>
      )}
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
