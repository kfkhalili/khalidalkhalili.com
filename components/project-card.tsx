import Image from "next/image";
import type { Project, ProjectStatus } from "@/lib/projects";
import type { Dictionary } from "@/lib/i18n";

const STATUS_CLASS: Record<ProjectStatus, string> = {
  live: "border-accent/50 text-accent-strong",
  beta: "border-accent/30 text-accent",
  building: "border-border text-faint",
};

export function ProjectCard({
  project,
  dict,
}: {
  project: Project;
  dict: Dictionary;
}) {
  const host = project.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/60"
    >
      <div className="flex items-center gap-3">
        {project.icon && (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border ${project.iconBg ? "p-1.5" : "bg-card-2"}`}
            style={
              project.iconBg ? { backgroundColor: project.iconBg } : undefined
            }
          >
            <Image
              src={project.icon}
              alt=""
              width={44}
              height={44}
              className={
                project.iconBg
                  ? "h-full w-full object-contain"
                  : "h-11 w-11 object-cover"
              }
            />
          </span>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent-strong">
            {project.name}
          </h3>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_CLASS[project.status]}`}
          >
            {dict.projects.status[project.status]}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        {project.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-faint"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-3 font-mono text-xs text-accent transition-colors group-hover:text-accent-strong">
        <span dir="ltr">{host}</span> ↗
      </div>
    </a>
  );
}
