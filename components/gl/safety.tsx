"use client";

import { Component, type ReactNode } from "react";

/** Some privacy extensions and locked-down GPUs make WebGL context creation
    throw (three/r3f surface that as a render-time error). Without a boundary
    here, that error is uncaught and Next's root error boundary tears down
    the entire page for a failure that should only cost the decorative 3D
    layer. Also fires gl-ready so the intro loader isn't left waiting on a
    signal that will now never arrive from Canvas.onCreated. */
export class GLErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
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

/** Synchronous WebGL2 capability probe. three r163+ only ever requests a
    'webgl2' context (no WebGL1 fallback — see WebGLRenderer's constructor),
    so that's the exact check that predicts whether mounting <Canvas> below
    can succeed. Running it upfront means a device without WebGL2 (no
    hardware acceleration on some corporate/VM setups, an old browser, WebGL
    disabled outright) skips the attempt entirely instead of relying on the
    failure path to catch it after the fact. The throwaway context is force-
    lost right away so it doesn't sit on the browser's small live-context
    budget before the real canvas asks for its own. */
export function detectWebGL2Support() {
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
