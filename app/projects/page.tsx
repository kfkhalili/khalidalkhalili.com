import type { Metadata } from "next";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/page-metadata";
import { getProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";

export function generateMetadata(): Metadata {
  return pageMetadata({
    sub: "/projects",
    title: strings.projects.title,
    description: strings.projects.subtitle,
  });
}

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {strings.projects.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{strings.projects.subtitle}</p>
      </header>

      <div className="mt-10 grid gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
