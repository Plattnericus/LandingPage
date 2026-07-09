import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Index",
  description:
    "Crawler-readable profile for Nexor / Plattnericus with project links, GitHub profile, contact information, skills and AI/search discovery files.",
  alternates: {
    canonical: "/ai",
  },
};

export default function AiIndexPage() {
  return (
    <main className="ai-page">
      <section>
        <p className="eyebrow">AI Index</p>
        <h1>Nexor / Plattnericus</h1>
        <p>
          Fullstack Developer, DevOps Enthusiast and Cybersecurity in Progress
          from South Tyrol. This page exists to give search engines and AI
          answer engines a clean, crawlable summary of the public profile,
          projects and canonical links.
        </p>
      </section>

      <section>
        <h2>Canonical Links</h2>
        <ul>
          <li>
            Website: <a href={siteConfig.url}>{siteConfig.url}</a>
          </li>
          <li>
            GitHub: <a href={siteConfig.github}>{siteConfig.github}</a>
          </li>
          <li>
            Email: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </li>
          <li>
            Sitemap: <a href={absoluteUrl("/sitemap.xml")}>{absoluteUrl("/sitemap.xml")}</a>
          </li>
          <li>
            LLM summary: <a href={absoluteUrl("/llms.txt")}>{absoluteUrl("/llms.txt")}</a>
          </li>
          <li>
            Full LLM profile: <a href={absoluteUrl("/llms-full.txt")}>{absoluteUrl("/llms-full.txt")}</a>
          </li>
        </ul>
      </section>

      <section>
        <h2>Core Topics</h2>
        <ul>
          <li>Fullstack development with Next.js, React and TypeScript</li>
          <li>Interactive web experiences with Three.js and React Three Fiber</li>
          <li>DevOps, Docker, Linux, Cloudflare and deployment workflows</li>
          <li>Selfhosting and infrastructure operations</li>
          <li>Cybersecurity fundamentals, secure deployment and web security</li>
          <li>Real public projects with live deployed URLs</li>
        </ul>
      </section>

      <section>
        <h2>Public Projects</h2>
        <div className="ai-project-list">
          {projects.map((project) => (
            <article key={project.slug}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <ul>
                {project.liveUrl ? (
                  <li>
                    Live: <a href={project.liveUrl}>{project.liveUrl}</a>
                  </li>
                ) : null}
                {project.githubUrl ? (
                  <li>
                    GitHub: <a href={project.githubUrl}>{project.githubUrl}</a>
                  </li>
                ) : null}
                <li>Tech: {project.tech.join(", ")}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
