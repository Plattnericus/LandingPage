import { ArrowUpRight, Star } from "lucide-react";
import MagneticButton from "@/components/motion/MagneticButton";
import ProjectVisual from "@/components/mockups/ProjectVisual";
import { formatRepoDate, type GithubRepoStats } from "@/lib/github";
import type { Project } from "@/lib/projects";

type ProjectSlideProps = {
  project: Project;
  index: number;
  stats: GithubRepoStats | null;
};

export default function ProjectSlide({ project, index, stats }: ProjectSlideProps) {
  return (
    <article className={`project-slide ${index === 0 ? "is-active" : ""}`}>
      <div className="slide-copy">
        <p className="slide-index mono">{String(index + 1).padStart(2, "0")}</p>
        <p className="eyebrow">{project.eyebrow}</p>
        <h3 className="slide-name">{project.name}</h3>
        <p className="body slide-desc">{project.description}</p>
        <ul className="slide-tags" aria-label="Technologies">
          {project.tech.map((tech) => (
            <li key={tech} className="tag">
              {tech}
            </li>
          ))}
        </ul>
        {stats ? (
          <p className="slide-stats">
            <Star aria-hidden="true" />
            {stats.stars} stars
            <span aria-hidden="true">·</span>
            Updated {formatRepoDate(stats.pushedAt)}
          </p>
        ) : null}
        <div className="slide-actions">
          {project.liveUrl ? (
            <MagneticButton
              href={project.liveUrl}
              external
              variant="primary"
              icon={<ArrowUpRight aria-hidden="true" />}
            >
              Open Live
            </MagneticButton>
          ) : null}
          {project.githubUrl ? (
            <MagneticButton href={project.githubUrl} external icon={<ArrowUpRight aria-hidden="true" />}>
              View on GitHub
            </MagneticButton>
          ) : null}
        </div>
      </div>
      <div className="slide-visual" aria-hidden="true">
        <div className="slide-visual-inner" data-parallax>
          <ProjectVisual id={project.visual} />
        </div>
      </div>
    </article>
  );
}
