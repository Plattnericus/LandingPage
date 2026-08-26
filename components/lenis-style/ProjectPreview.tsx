"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProjectPreview as ProjectPreviewData } from "@/lib/projects";

const SWAP_DWELL_MS = [3990, 3670] as const;

/** Two extra goes after the first failure, spaced far enough apart to ride out
    a brief drop rather than hammering a server that's already struggling. */
const RETRY_LIMIT = 2;
const RETRY_BACKOFF_MS = 900;

/** A failed media request is usually a blip — a dropped connection, a proxy
    hiccup, an extension racing the request. Re-requesting the identical URL
    can simply be answered from the browser's cached failure, so every retry
    carries a marker that forces a genuinely new fetch. */
function withAttempt(src: string, attempt: number) {
  if (attempt === 0) return src;
  return `${src}${src.includes("?") ? "&" : "?"}reload=${attempt}`;
}

type ProjectPreviewProps = {
  preview: ProjectPreviewData;
  name: string;
  eyebrow: string;
};

export default function ProjectPreview({ preview, name, eyebrow }: ProjectPreviewProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wasSwapActiveRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [activeFrame, setActiveFrame] = useState<0 | 1>(0);
  const [replayKeys, setReplayKeys] = useState<[number, number]>([0, 0]);
  const [loadedFrames, setLoadedFrames] = useState<[boolean, boolean]>([false, false]);

  /* Retry bookkeeping for every media element this card can show. Bumping
     an attempt count re-requests the same asset through withAttempt, so a
     blip self-heals instead of leaving the card stuck on a broken frame
     for good. */
  const [videoAttempt, setVideoAttempt] = useState(0);
  const [frameAttempts, setFrameAttempts] = useState<[number, number]>([0, 0]);
  const retryTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    const timers = retryTimers.current;
    return () => {
      Object.values(timers).forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const retry = (key: string, run: () => void) => {
    window.clearTimeout(retryTimers.current[key]);
    retryTimers.current[key] = window.setTimeout(run, RETRY_BACKOFF_MS);
  };

  const handleVideoError = () => {
    if (videoAttempt >= RETRY_LIMIT) return;
    retry("video", () => setVideoAttempt((attempt) => attempt + 1));
  };

  const handleFrameError = (index: 0 | 1) => {
    if (frameAttempts[index] >= RETRY_LIMIT) return;
    retry(`frame${index}`, () =>
      setFrameAttempts((attempts) => {
        const next: [number, number] = [...attempts];
        next[index] += 1;
        return next;
      }),
    );
  };

  /* Media itself is requested straight away on mount (no lazy/intersection
     gate) — with only six cards total the eager bandwidth cost is small,
     and it means every card already has its clip decoded well before a
     visitor scrolls to it instead of racing the network once it's on
     screen. isActive is the one thing still intersection-driven: it just
     pauses playback for off-screen cards to save CPU/battery. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!("IntersectionObserver" in window)) {
      const raf = requestAnimationFrame(() => setIsActive(true));
      return () => cancelAnimationFrame(raf);
    }

    const activityObserver = new IntersectionObserver(
      (entries) => setIsActive(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.08 },
    );
    activityObserver.observe(root);

    return () => activityObserver.disconnect();
  }, []);

  useEffect(() => {
    if (preview.kind !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    if (!isActive) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      /* A browser that blocks autoplay just leaves the card on its last
         decoded frame — there's no poster to fall back to anymore. */
    });
  }, [isActive, preview.kind]);

  useEffect(() => {
    if (preview.kind !== "swap") {
      wasSwapActiveRef.current = false;
      return;
    }

    const ready = loadedFrames[0] && loadedFrames[1];
    const shouldRun = isActive && ready;
    if (shouldRun && !wasSwapActiveRef.current) {
      setReplayKeys((keys) => {
        const next: [number, number] = [...keys];
        next[activeFrame] += 1;
        return next;
      });
    }
    wasSwapActiveRef.current = shouldRun;
  }, [activeFrame, isActive, loadedFrames, preview.kind]);

  useEffect(() => {
    if (
      preview.kind !== "swap" ||
      !isActive ||
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
  }, [activeFrame, isActive, loadedFrames, preview.kind]);

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
        <video
          className="sc-media sc-video"
          ref={videoRef}
          src={withAttempt(preview.src, videoAttempt)}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          style={{ objectPosition }}
          onError={handleVideoError}
        />
      ) : (
        <>
          {preview.sources.map((src, index) => (
            <span
              className="sc-swap-layer"
              data-frame-state={index === activeFrame ? "active" : "inactive"}
              key={src}
            >
              {/* The user supplied animated GIFs are kept as the source of truth. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`${src}-${replayKeys[index]}-${frameAttempts[index]}`}
                className="sc-media"
                src={withAttempt(src, frameAttempts[index])}
                alt=""
                loading="eager"
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
                onError={() => handleFrameError(index as 0 | 1)}
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
