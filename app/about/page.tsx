import type { Metadata } from "next";
import { StarPattern } from "@/components/geometry";
import { readContent, renderMarkdown } from "@/lib/content";

const { meta, body } = readContent("about");

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <section className="relative isolate">
        <div className="pointer-events-none absolute -inset-x-24 -top-20 -z-10 h-[300px] text-accent opacity-[0.05]">
          <StarPattern id="about-khatam" className="h-full w-full" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {meta.title}
        </h1>

        <div
          className="prose mt-8"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
        />
      </section>
    </div>
  );
}
