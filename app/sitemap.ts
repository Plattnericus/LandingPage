import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { absoluteUrl, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      /* Portfolio screenshots surfaced for Google Images discovery. */
      images: projects.map((project) => absoluteUrl(project.preview.poster)),
    },
    {
      url: `${siteConfig.url}/ai`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
