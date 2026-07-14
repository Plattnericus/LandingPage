"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProjectPreview as ProjectPreviewData } from "@/lib/projects";

const SWAP_DWELL_MS = [3990, 3670] as const;

type ProjectPreviewProps = {
  preview: ProjectPreviewData;
  name: string;
  eyebrow: string;
};

export default function ProjectPreview({ preview, name, eyebrow }: ProjectPreviewProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wasSwapActiveRef = useRef(false);
  const [loadMedia, setLoadMedia] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeFrame, setActiveFrame] = useState<0 | 1>(0);
  const [replayKeys, setReplayKeys] = useState<[number, number]>([0, 0]);
  const [loadedFrames, setLoadedFrames] = useState<[boolean, boolean]>([false, false]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setReducedMotion(motionQuery.matches);
    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    if (!("IntersectionObserver" in window)) {
      /* deferred a frame so setState stays out of the effect body itself */
      const raf = requestAnimationFrame(() => {
        setLoadMedia(true);
        setIsActive(true);
      });
      return () => {
        motionQuery.removeEventListener("change", syncMotionPreference);
        cancelAnimationFrame(raf);
      };
    }

    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoadMedia(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: "0px 640px", threshold: 0.01 },
    );
    const activityObserver = new IntersectionObserver(
      (entries) => setIsActive(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.08 },
    );

    loadObserver.observe(root);
    activityObserver.observe(root);

    return () => {
      motionQuery.removeEventListener("change", syncMotionPreference);
      loadObserver.disconnect();
      activityObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (preview.kind !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    if (!isActive || reducedMotion) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      /* The muted poster stays visible if a browser blocks autoplay. */
    });
  }, [isActive, preview.kind, reducedMotion]);

  useEffect(() => {
    if (preview.kind !== "swap") {
      wasSwapActiveRef.current = false;
      return;
    }

    const ready = loadedFrames[0] && loadedFrames[1];
    const shouldRun = isActive && !reducedMotion && ready;
    if (shouldRun && !wasSwapActiveRef.current) {
      setReplayKeys((keys) => {
        const next: [number, number] = [...keys];
        next[activeFrame] += 1;
        return next;
      });
    }
    wasSwapActiveRef.current = shouldRun;
  }, [activeFrame, isActive, loadedFrames, preview.kind, reducedMotion]);

  useEffect(() => {
    if (
      preview.kind !== "swap" ||
      !isActive ||
      reducedMotion ||
      !loadedFrames[0] ||
      !loadedFrames[1]
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextFrame = activeFrame === 0 ? 1 : 0;
      setReplayKeys((keys) => {
        const next: [number, number] = [...keys];
        next[nextFrame] += 1;
        return next;
      });
      setActiveFrame(nextFrame);
    }, SWAP_DWELL_MS[activeFrame]);

    return () => window.clearTimeout(timer);
  }, [activeFrame, isActive, loadedFrames, preview.kind, reducedMotion]);

  const objectPosition = preview.objectPosition ?? "center center";

  return (
    <span
      className="sc-frame"
      ref={rootRef}
      role="img"
      aria-label={`${name} — ${eyebrow} preview`}
      data-preview-kind={preview.kind}
      data-active-frame={preview.kind === "swap" ? activeFrame + 1 : undefined}
    >
      {preview.kind === "video" ? (
        <>
          <video
            className="sc-media sc-video"
            ref={videoRef}
            src={loadMedia ? preview.src : undefined}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            aria-hidden="true"
            style={{ objectPosition }}
            onPlaying={() => setVideoPlaying(true)}
          />
          {(!videoPlaying || reducedMotion) && (
            <Image
              className="sc-media sc-poster"
              src={preview.poster}
              alt=""
              fill
              quality={78}
              sizes="(max-width: 899px) 84vw, 640px"
              aria-hidden="true"
              style={{ objectPosition }}
            />
          )}
        </>
      ) : reducedMotion ? (
        <Image
          className="sc-media"
          src={preview.poster}
          alt=""
          fill
          quality={78}
          sizes="(max-width: 899px) 84vw, 640px"
          aria-hidden="true"
          style={{ objectPosition }}
        />
      ) : (
        <>
          {!loadedFrames[0] && (
            <Image
              className="sc-media sc-poster"
              src={preview.poster}
              alt=""
              fill
              quality={78}
              sizes="(max-width: 899px) 84vw, 640px"
              aria-hidden="true"
              style={{ objectPosition }}
            />
          )}
          {preview.sources.map((src, index) => (
            <span
              className="sc-swap-layer"
              data-frame-state={index === activeFrame ? "active" : "inactive"}
              key={src}
            >
              {/* The user supplied animated GIFs are kept as the source of truth. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`${src}-${replayKeys[index]}`}
                className="sc-media"
                src={loadMedia ? src : undefined}
                alt=""
                loading="lazy"
                decoding="async"
                aria-hidden="true"
                style={{ objectPosition }}
                onLoad={() =>
                  setLoadedFrames((frames) => {
                    if (frames[index]) return frames;
                    const next: [boolean, boolean] = [...frames];
                    next[index] = true;
                    return next;
                  })
                }
              />
            </span>
          ))}
        </>
      )}

      <span className="sc-arrow" aria-hidden="true">
        <ArrowUpRight />
      </span>
    </span>
  );
}
