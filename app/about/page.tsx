import type { Metadata } from "next";
import { readContent } from "@/lib/content";
import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata(): Metadata {
  const { meta } = readContent("about");
  return pageMetadata({
    sub: "/about",
    title: meta.title,
    description: meta.description,
  });
}

export default function AboutPage() {
  const { meta, html } = readContent("about");

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <section className="relative isolate">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {meta.title}
        </h1>

        <div
          className="prose mt-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    </div>
  );
}
