"use client";

import { useRef } from "react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import { useDepth } from "@/components/motion/useDepth";
import DeviceMockup from "@/components/mockups/DeviceMockup";
import { PokyhMacScreens, PokyhPhoneScreen } from "@/components/mockups/PokyhScreens";
import SystemMap from "@/components/mockups/SystemMap";
import { MM_DESKTOP, MM_MOBILE, PIN, gsap, useGSAP } from "@/lib/animation";
import { pokyhBeats, pokyhChips } from "@/lib/content";

const chipByBeat: Record<string, string[]> = {
  Interface: ["Web App"],
  API: ["Backend", "API", "Authentication"],
  Mobile: ["Mobile App"],
  Deployment: ["Docker Deployment", "Cloudflare", "Server Infrastructure"],
};

export default function PokyhStory() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useDepth(sectionRef);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM_DESKTOP, mobile: MM_MOBILE }, (ctx) => {
        const isDesktop = Boolean(ctx.conditions?.desktop);
        const screens = gsap.utils.toArray<HTMLElement>(".pokyh-screen", section);
        const beats = gsap.utils.toArray<HTMLElement>(".pokyh-beat", section);
        const chips = gsap.utils.toArray<HTMLElement>(".pokyh-chip", section);
        const chipEls = (beat: string) =>
          chips.filter((chip) => (chipByBeat[beat] ?? []).includes(chip.dataset.chip ?? ""));

        /* resting states (restored when scrolling back up) */
        gsap.set(screens.slice(1), { autoAlpha: 0 });
        gsap.set(".pokyh-phone-device", { yPercent: 34, rotation: -5, autoAlpha: 0 });
        gsap.set(chips, { autoAlpha: 0.28, scale: 0.96 });
        gsap.set(".map-line", { drawSVG: "0%" });
        gsap.set(".map-node, .map-label", { autoAlpha: 0 });
        gsap.set(".map-pulse", { autoAlpha: 0 });
        gsap.set(".pokyh-map", { autoAlpha: 0.14 });
        gsap.set(".map-vps", { filter: "drop-shadow(0 0 0px rgba(221, 184, 146, 0))" });

        const showScreen = (tl: gsap.core.Timeline, index: number, at: number) => {
          tl.to(screens[index - 1], { autoAlpha: 0, filter: "blur(6px)", duration: 0.5 }, at).fromTo(
            screens[index],
            { autoAlpha: 0, scale: 1.04, filter: "blur(8px)" },
            {
              autoAlpha: 1,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.6,
              ease: "power2.out",
              immediateRender: false,
            },
            at + 0.15,
          );
        };
        const activateBeat = (tl: gsap.core.Timeline, index: number, at: number) => {
          tl.to(
            beats[index],
            { color: "var(--text)", duration: 0.35, ease: "power2.out" },
            at,
          ).to(
            beats[index].querySelector(".beat-dot"),
            { backgroundColor: "var(--tan)", scale: 1.5, duration: 0.35, ease: "back.out(2)" },
            at,
          );
        };
        const popChips = (tl: gsap.core.Timeline, beat: string, at: number) => {
          const els = chipEls(beat);
          if (!els.length) return;
          tl.fromTo(
            els,
            { autoAlpha: 0.28, scale: 0.96 },
            {
              autoAlpha: 1,
              scale: 1,
              color: "var(--text)",
              borderColor: "rgba(221, 184, 146, 0.45)",
              stagger: 0.12,
              duration: 0.45,
              ease: "back.out(1.7)",
              immediateRender: false,
            },
            at,
          );
        };

        /* idle floats while the story is on screen */
        const floats = [
          gsap.to(".pokyh-mac", {
            yPercent: -2.4,
            duration: 3.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            paused: true,
          }),
          gsap.to(".pokyh-phone-device", {
            xPercent: -2,
            duration: 3.0,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            paused: true,
            delay: 0.4,
          }),
          gsap.to(".pokyh-avatar", {
            opacity: 0.55,
            duration: 1.4,
            ease: "sine.inOut",
            stagger: 0.25,
            yoyo: true,
            repeat: -1,
            paused: true,
          }),
        ];

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: isDesktop
            ? {
                id: "pokyh",
                trigger: section,
                start: "top top",
                end: `+=${PIN.pokyh}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onToggle: (self) =>
                  floats.forEach((float) => (self.isActive ? float.play() : float.pause())),
              }
            : {
                id: "pokyh",
                trigger: section,
                start: "top 62%",
                end: "bottom 96%",
                scrub: 1,
              },
        });

        /* Idea */
        activateBeat(tl, 0, 0);
        tl.fromTo(
          ".wire-path",
          { drawSVG: "0%" },
          { drawSVG: "100%", stagger: 0.1, duration: 0.9, ease: "power1.inOut", immediateRender: false },
          0.1,
        );

        /* Interface */
        showScreen(tl, 1, 1.2);
        activateBeat(tl, 1, 1.35);
        popChips(tl, "Interface", 1.5);
        tl.fromTo(
          ".pokyh-period",
          { autoAlpha: 0.2, scale: 0.82 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
            stagger: 0.016,
            ease: "back.out(1.7)",
            immediateRender: false,
          },
          1.5,
        );

        /* API */
        showScreen(tl, 2, 2.5);
        activateBeat(tl, 2, 2.65);
        popChips(tl, "API", 2.8);
        tl.fromTo(
          '[data-screen="api"] p',
          { autoAlpha: 0, x: -14 },
          { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.05, immediateRender: false },
          2.75,
        );
        tl.to(".map-line", { drawSVG: "34%", duration: 0.8, ease: "power1.inOut" }, 2.9);

        /* Mobile */
        activateBeat(tl, 3, 3.9);
        tl.to(
          ".pokyh-phone-device",
          { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.9, ease: "back.out(1.2)" },
          3.9,
        );
        tl.fromTo(
          ".pokyh-msg",
          { autoAlpha: 0, x: 18 },
          { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.08, immediateRender: false },
          4.3,
        );
        popChips(tl, "Mobile", 4.2);

        /* Deployment */
        showScreen(tl, 3, 5.1);
        activateBeat(tl, 4, 5.25);
        popChips(tl, "Deployment", 5.4);
        tl.fromTo(
          '[data-screen="deploy"] p',
          { autoAlpha: 0, x: -14 },
          { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.06, immediateRender: false },
          5.35,
        );
        tl.to(".map-line", { drawSVG: "100%", stagger: 0.12, duration: 1.0, ease: "power1.inOut" }, 5.5)
          .to(".map-node", { autoAlpha: 1, stagger: 0.07, duration: 0.5 }, 5.9);

        /* Real Usage — everything becomes a system map */
        activateBeat(tl, 5, 7.0);
        tl.to(".pokyh-devices", { scale: 0.6, xPercent: -24, yPercent: 18, autoAlpha: 0.05, duration: 1.4, ease: "power2.inOut" }, 7.0)
          .fromTo(
            ".pokyh-map",
            { scale: 0.92 },
            { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.inOut", immediateRender: false },
            7.1,
          )
          .to(".map-label", { autoAlpha: 1, stagger: 0.06, duration: 0.5 }, 7.4)
          .fromTo(
            ".map-pulse",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.2, stagger: 0.5, immediateRender: false },
            7.8,
          )
          .to(
            ".map-pulse",
            {
              motionPath: { path: "#map-route", align: "#map-route", alignOrigin: [0.5, 0.5] },
              duration: 1.8,
              stagger: 0.5,
              ease: "power1.inOut",
            },
            7.8,
          )
          .to(".map-pulse", { autoAlpha: 0, duration: 0.25, stagger: 0.5 }, 9.5)
          .to(".map-vps", { filter: "drop-shadow(0 0 22px rgba(221, 184, 146, 0.4))", duration: 0.8 }, 9.2)
          .to({}, { duration: 0.8 });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="pokyh section" id="pokyh" aria-labelledby="pokyh-title">
      <div className="section-inner pokyh-inner">
        <div className="pokyh-copy">
          <p className="eyebrow">Case Study 01</p>
          <AnimatedHeadline as="h2" id="pokyh-title" className="section-title pokyh-title">
            POKYH - from idea to deployed system.
          </AnimatedHeadline>
          <p className="body pokyh-lead">
            A school-focused platform built around real student workflows: timetable, grades,
            absences, messages, mobile app, backend, APIs and deployment.
          </p>
          <ol className="pokyh-beats" aria-label="From idea to real usage">
            {pokyhBeats.map((beat) => (
              <li key={beat} className="pokyh-beat">
                <span className="beat-dot" aria-hidden="true" />
                {beat}
              </li>
            ))}
          </ol>
          <ul className="pokyh-chips" aria-label="Platform building blocks">
            {pokyhChips.map((chip) => (
              <li key={chip} className="tag pokyh-chip" data-chip={chip}>
                {chip}
              </li>
            ))}
          </ul>
        </div>
        <div className="pokyh-stage">
          <SystemMap className="pokyh-map" />
          <div className="pokyh-devices" data-depth="14">
            <DeviceMockup variant="macbook" className="pokyh-mac">
              <PokyhMacScreens />
            </DeviceMockup>
            <DeviceMockup variant="iphone" className="pokyh-phone-device">
              <PokyhPhoneScreen />
            </DeviceMockup>
          </div>
        </div>
      </div>
    </section>
  );
}
