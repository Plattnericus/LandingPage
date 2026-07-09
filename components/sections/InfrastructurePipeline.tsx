"use client";

import { useRef } from "react";
import AnimatedHeadline from "@/components/motion/AnimatedHeadline";
import PipelineDiagram from "@/components/mockups/PipelineDiagram";
import { EASE, MM_DESKTOP, MM_MOBILE, PIN, ScrollTrigger, gsap, useGSAP } from "@/lib/animation";

export default function InfrastructurePipeline() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM_DESKTOP, mobile: MM_MOBILE }, (ctx) => {
        const isDesktop = Boolean(ctx.conditions?.desktop);

        gsap.from(".devops-lead", {
          autoAlpha: 0,
          y: 26,
          duration: 0.9,
          ease: EASE.soft,
          scrollTrigger: { trigger: section, start: "top 62%" },
        });

        if (!isDesktop) {
          gsap.from(".pipe-vnode", {
            autoAlpha: 0,
            x: -26,
            stagger: 0.14,
            duration: 0.7,
            ease: EASE.soft,
            scrollTrigger: { trigger: ".pipeline-vertical", start: "top 74%" },
          });
          return;
        }

        const nodes = gsap.utils.toArray<HTMLElement>(".pipe-node", section);
        const packets = gsap.utils.toArray<SVGCircleElement>(".packet:not(.packet-loop)", section);
        const lastNode = nodes[nodes.length - 1];
        const cloudflareNode = nodes[nodes.length - 2];

        gsap.set(nodes, { autoAlpha: 0, y: 40 });
        gsap.set("#pipe-path", { drawSVG: "0%" });
        gsap.set(".packet", { autoAlpha: 0 });
        gsap.set([cloudflareNode, lastNode], {
          boxShadow: "0 0 0px rgba(221, 184, 146, 0)",
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            id: "devops",
            trigger: section,
            start: "top top",
            end: `+=${PIN.devops}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(nodes, { autoAlpha: 1, y: 0, stagger: 0.18, duration: 0.5, ease: "back.out(1.2)" }, 0.2)
          .to("#pipe-path", { drawSVG: "100%", duration: 2.0, ease: "power1.inOut" }, 0.45);

        packets.forEach((packet, index) => {
          const at = 2.9 + index * 0.45;
          tl.to(packet, { autoAlpha: 1, duration: 0.12 }, at)
            .to(
              packet,
              {
                motionPath: { path: "#pipe-path", align: "#pipe-path", alignOrigin: [0.5, 0.5] },
                duration: 1.7,
                ease: "power1.inOut",
              },
              at,
            )
            .to(packet, { autoAlpha: 0, duration: 0.15 }, at + 1.62);
        });

        tl.to(
          cloudflareNode,
          {
            boxShadow: "0 0 38px rgba(221, 184, 146, 0.45)",
            scale: 1.07,
            repeat: 1,
            yoyo: true,
            duration: 0.35,
            ease: "power2.inOut",
          },
          4.7,
        )
          .to(
            lastNode,
            {
              boxShadow: "0 0 44px rgba(221, 184, 146, 0.5)",
              borderColor: "rgba(230, 204, 178, 0.75)",
              color: "var(--text)",
              scale: 1.05,
              duration: 0.5,
              ease: "back.out(1.6)",
            },
            5.2,
          )
          .to({}, { duration: 0.8 });

        /* one calm looping packet while the section is on screen */
        const loop = gsap.fromTo(
          ".packet-loop",
          { autoAlpha: 0.85 },
          {
            motionPath: { path: "#pipe-path", align: "#pipe-path", alignOrigin: [0.5, 0.5] },
            duration: 7,
            repeat: -1,
            ease: "none",
            paused: true,
          },
        );
        ScrollTrigger.create({
          trigger: section,
          start: "top 85%",
          end: () => `+=${PIN.devops + section.offsetHeight}`,
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="devops section" id="devops" aria-labelledby="devops-title">
      <div className="section-inner devops-inner">
        <div className="devops-head">
          <p className="eyebrow">DevOps Lab</p>
          <AnimatedHeadline as="h2" id="devops-title" className="section-title devops-title">
            Code is only half the story.
          </AnimatedHeadline>
          <p className="body devops-lead">
            I like understanding what happens after code is written: how apps are built, deployed,
            routed, secured and kept online.
          </p>
        </div>
        <PipelineDiagram />
      </div>
    </section>
  );
}
