import type { ComponentType } from "react";
import type { Article } from "@/lib/articles";
import { TechnicalDebtArticle } from "@/components/explorables/technical-debt";

/** An explorable = article metadata + the component that renders its body. */
export type Explorable = Article & { Body: ComponentType };

// Interactive explorables render via a React component (the "component adapter"
// behind the article render seam), listed alongside file-based essays. Carrying
// the component here makes the registry↔renderer link typed, not a slug string.
export const EXPLORABLES: Explorable[] = [
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
    Body: TechnicalDebtArticle,
  },
];
