import type { Metadata } from "next";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { getProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  return pageMetadata({
    lang,
    sub: "/projects",
    title: dict.projects.title,
    description: dict.projects.subtitle,
    dict,
  });
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  const projects = getProjects(lang);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {dict.projects.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{dict.projects.subtitle}</p>
      </header>

      <div className="mt-10 grid gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} dict={dict} />
        ))}
      </div>
    </div>
  );
}
