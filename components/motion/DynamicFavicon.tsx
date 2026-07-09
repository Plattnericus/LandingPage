"use client";

import { useEffect } from "react";
import { ScrollTrigger, gsap } from "@/lib/animation";

/**
 * Canvas-drawn favicon: a warm "N" mark with a progress ring that fills while
 * scrolling, dims with a notification dot when the tab is hidden, and spins
 * briefly when the tab becomes visible again.
 */
export default function DynamicFavicon() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx || typeof ctx.roundRect !== "function") return;

    let links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]'),
    );
    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
      links = [link];
    }

    let progress = 0;
    const draw = (mode: "active" | "hidden", spin = 0) => {
      ctx.clearRect(0, 0, 64, 64);

      ctx.beginPath();
      ctx.roundRect(2, 2, 60, 60, 16);
      ctx.fillStyle = "#17100c";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(237, 224, 212, 0.18)";
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.strokeStyle = mode === "hidden" ? "rgba(201, 170, 140, 0.5)" : "#ddb892";
      const startAngle = -Math.PI / 2 + spin * Math.PI * 2;
      ctx.arc(32, 32, 25, startAngle, startAngle + Math.max(0.03, progress) * Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = mode === "hidden" ? "rgba(237, 224, 212, 0.45)" : "#ede0d4";
      ctx.font = "700 30px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("N", 32, 34);

      if (mode === "hidden") {
        ctx.beginPath();
        ctx.arc(50, 14, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#e6ccb2";
        ctx.fill();
      }

      const url = canvas.toDataURL("image/png");
      links.forEach((link) => {
        link.type = "image/png";
        link.href = url;
      });
    };

    draw("active");

    let lastDrawn = 0;
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        progress = self.progress;
        if (Math.abs(progress - lastDrawn) > 0.02 && !document.hidden) {
          lastDrawn = progress;
          draw("active");
        }
      },
    });

    const spinProxy = { value: 0 };
    let spinTween: gsap.core.Tween | null = null;
    const onVisibility = () => {
      if (document.hidden) {
        spinTween?.kill();
        draw("hidden");
      } else {
        spinProxy.value = 0;
        spinTween = gsap.to(spinProxy, {
          value: 1,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => draw("active", spinProxy.value),
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      trigger.kill();
      spinTween?.kill();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
