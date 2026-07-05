import type { Article } from "@/lib/articles";

// Interactive explorables live as React pages (not markdown); this registry
// gives them list metadata so they appear alongside the file-based essays.
export const EXPLORABLES: Article[] = [
  {
    slug: "technical-debt",
    title: "Visualizing the Drag of Technical Debt",
    description:
      "An interactive model of technical debt as a drag coefficient on team velocity — the tension between shipping fast now and investing in design.",
    date: "2026-02-09",
    tags: ["Explorable", "Software Design"],
    lang: "en",
    featured: true,
    kind: "explorable",
    readingTime: 6,
  },
];
