"use client";

import { useRef } from "react";
import { EASE, gsap, useGSAP } from "@/lib/animation";

const beats = [
  {
    title: "Interfaces that pull you in",
    copy: "Scroll choreography, WebGL scenes and motion that has a purpose. The frontend is not a form — it is the product, and it should feel like one from the first frame.",
  },
  {
    title: "One stack, every layer",
    copy: "From the component tree down to the database schema: Next.js, React and TypeScript on top, APIs and backends underneath — designed together instead of glued together.",
  },
  {
    title: "Ship it for real",
    copy: "A project only counts once it runs on a server. Docker, Linux, Cloudflare and selfhosted infrastructure turn side projects into things people actually use every day.",
  },
  {
    title: "Locked down by default",
    copy: "Security is not a feature request. Hardened deployments, sane auth and a growing offensive-security skill set keep what ships online actually safe.",
  },
];

export default function Why() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".why-item", sectionRef.current).forEach((item) => {
        gsap.fromTo(
          item,
          { y: 64, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: EASE.soft,
            scrollTrigger: { trigger: item, start: "top 74%" },
          },
        );
      });

      gsap.fromTo(
        ".why-sticky",
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: EASE.soft,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="why" id="why" aria-labelledby="why-title">
      <div className="why-sticky">
        <h2 className="why-title" id="why-title">
          Why
          <br />
          full
          <br />
          stack?
        </h2>
        <p className="why-intro">
          Because the interesting problems live between the layers. Here is what building
          across all of them unlocks.
        </p>
      </div>
      <div className="why-items">
        {beats.map((beat) => (
          <div key={beat.title} className="why-item">
            <h3>{beat.title}</h3>
            <p>{beat.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
