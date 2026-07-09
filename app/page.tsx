import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import ContactSection from "@/components/sections/ContactSection";
import CybersecurityScan from "@/components/sections/CybersecurityScan";
import FutureVision from "@/components/sections/FutureVision";
import HeroPinnedStory from "@/components/sections/HeroPinnedStory";
import InfrastructurePipeline from "@/components/sections/InfrastructurePipeline";
import IntroReveal from "@/components/sections/IntroReveal";
import PokyhStory from "@/components/sections/PokyhStory";
import ProjectShowcase from "@/components/sections/ProjectShowcase";
import StatementSection from "@/components/sections/StatementSection";
import StreamDeckStory from "@/components/sections/StreamDeckStory";
import TechStackSection from "@/components/sections/TechStackSection";
import { getGithubSummary } from "@/lib/github";
import { projects } from "@/lib/projects";
import { absoluteUrl, siteConfig } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteConfig.url}#webpage`,
      url: siteConfig.url,
      name: siteConfig.title,
      headline: "Nexor / Plattnericus",
      description: siteConfig.description,
      inLanguage: "en",
      isPartOf: {
        "@id": `${siteConfig.url}#website`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
      },
      dateModified: "2026-07-09",
      about: {
        "@id": `${siteConfig.url}#person`,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}#person`,
      name: "Nexor / Plattnericus",
      alternateName: ["Nexor", "Plattnericus"],
      url: siteConfig.url,
      email: `mailto:${siteConfig.email}`,
      image: absoluteUrl("/opengraph-image"),
      sameAs: [
        siteConfig.github,
        ...projects.flatMap((project) => (project.liveUrl ? [project.liveUrl] : [])),
      ],
      jobTitle: "Fullstack Developer",
      hasOccupation: {
        "@type": "Occupation",
        name: "Fullstack Developer",
        skills:
          "Next.js, TypeScript, React, Three.js, DevOps, Docker, Linux, Cloudflare, cybersecurity fundamentals",
      },
      description:
        "Student developer from South Tyrol building fullstack web apps, selfhosted systems, DevOps workflows and security-focused infrastructure.",
      knowsAbout: [
        "Fullstack Development",
        "Next.js",
        "TypeScript",
        "React",
        "DevOps",
        "Docker",
        "Linux",
        "Cloudflare",
        "Cybersecurity",
        "Selfhosting",
        "WebGL",
        "React Three Fiber",
        "Search Engine Optimization",
        "AI answer engine optimization",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "email",
        email: siteConfig.email,
        availableLanguage: ["en", "de", "it"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: {
        "@id": `${siteConfig.url}#person`,
      },
      potentialAction: {
        "@type": "ReadAction",
        target: [siteConfig.url, absoluteUrl("/ai"), absoluteUrl("/llms.txt")],
      },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteConfig.url}#profile-page`,
      url: siteConfig.url,
      name: siteConfig.title,
      description: siteConfig.description,
      isPartOf: {
        "@id": `${siteConfig.url}#website`,
      },
      mainEntity: {
        "@id": `${siteConfig.url}#person`,
      },
      about: [
        "Fullstack development",
        "DevOps infrastructure",
        "Cybersecurity learning",
        "Real deployed software projects",
      ],
      significantLink: [
        siteConfig.github,
        absoluteUrl("/ai"),
        absoluteUrl("/llms.txt"),
        absoluteUrl("/llms-full.txt"),
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${siteConfig.url}#projects`,
      name: "Nexor / Plattnericus project showcase",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareSourceCode",
          "@id": `${siteConfig.url}#project-${project.slug}`,
          name: project.name,
          alternateName: project.repoName,
          description: project.description,
          ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
          ...(project.liveUrl ? { url: project.liveUrl } : {}),
          creator: {
            "@id": `${siteConfig.url}#person`,
          },
          keywords: project.tech.join(", "),
        },
      })),
    },
  ],
};

export default async function Home() {
  const github = await getGithubSummary();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SmoothScrollProvider>
        <IntroReveal />
        <main>
          <HeroPinnedStory />
          <StatementSection />
          <ProjectShowcase github={github} />
          <PokyhStory />
          <StreamDeckStory github={github} />
          <InfrastructurePipeline />
          <CybersecurityScan />
          <TechStackSection />
          <FutureVision />
          <ContactSection github={github} />
        </main>
      </SmoothScrollProvider>
    </>
  );
}
