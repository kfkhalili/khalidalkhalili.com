export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  readingTime: string;
  tags: string[];
  featured?: boolean;
};

export const articles: Article[] = [
  {
    slug: "technical-debt",
    title: "Visualizing the Drag of Technical Debt",
    description:
      "An interactive model of technical debt as a drag coefficient on team velocity — the tension between shipping fast now and investing in design.",
    date: "2026-02-09",
    readingTime: "6 min read",
    tags: ["Explorable", "Software Design"],
    featured: true,
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
