import type { Metadata } from "next";
import { readContent } from "@/lib/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { meta } = readContent(lang, "about");
  return { title: meta.title, description: meta.description };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { meta, html } = readContent(lang, "about");

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
