"use client";

import Image from "next/image";
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
  const [loadMedia, setLoadMedia] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [activeFrame, setActiveFrame] = useState<0 | 1>(0);
  const [replayKeys, setReplayKeys] = useState<[number, number]>([0, 0]);
  const [loadedFrames, setLoadedFrames] = useState<[boolean, boolean]>([false, false]);

  /* Retry bookkeeping for every media element this card can show. Bumping
     an attempt count re-requests the same asset through withAttempt, so a
     blip self-heals instead of leaving the card stuck on a broken frame or
     poster for good. */
  const [posterAttempt, setPosterAttempt] = useState(0);
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

  const handlePosterError = () => {
    if (posterAttempt >= RETRY_LIMIT) return;
    retry("poster", () => setPosterAttempt((attempt) => attempt + 1));
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

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!("IntersectionObserver" in window)) {
      /* deferred a frame so setState stays out of the effect body itself */
      const raf = requestAnimationFrame(() => {
        setLoadMedia(true);
        setIsActive(true);
      });
      return () => cancelAnimationFrame(raf);
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
      loadObserver.disconnect();
      activityObserver.disconnect();
    };
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
      /* The muted poster stays visible if a browser blocks autoplay. */
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
        <>
          <video
            className="sc-media sc-video"
            ref={videoRef}
            src={loadMedia ? withAttempt(preview.src, videoAttempt) : undefined}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            aria-hidden="true"
            style={{ objectPosition }}
            onPlaying={() => setVideoPlaying(true)}
            onError={handleVideoError}
          />
          {!videoPlaying && (
            <Image
              className="sc-media sc-poster"
              src={withAttempt(preview.poster, posterAttempt)}
              alt=""
              fill
              quality={78}
              sizes="(max-width: 899px) 84vw, 640px"
              aria-hidden="true"
              style={{ objectPosition }}
              onError={handlePosterError}
            />
          )}
        </>
      ) : (
        <>
          {!loadedFrames[0] && (
            <Image
              className="sc-media sc-poster"
              src={withAttempt(preview.poster, posterAttempt)}
              alt=""
              fill
              quality={78}
              sizes="(max-width: 899px) 84vw, 640px"
              aria-hidden="true"
              style={{ objectPosition }}
              onError={handlePosterError}
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
                key={`${src}-${replayKeys[index]}-${frameAttempts[index]}`}
                className="sc-media"
                src={loadMedia ? withAttempt(src, frameAttempts[index]) : undefined}
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
