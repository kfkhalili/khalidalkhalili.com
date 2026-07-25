import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import path from "node:path";

/**
 * The essay branch of the article route: `content/writing` holds no prose yet,
 * so back the filesystem with an in-memory map and render markdown of our own.
 */
const WRITING_DIR = path.join(process.cwd(), "content/writing");
let files: Record<string, string> = {};

vi.mock("node:fs", async (importActual) => {
  const actual = await importActual<typeof import("node:fs")>();
  const fake = {
    ...actual,
    existsSync: (p: string) =>
      p === WRITING_DIR ? true : p in files || actual.existsSync(p),
    readdirSync: ((p: string) =>
      p === WRITING_DIR
        ? Object.keys(files).map((f) => path.basename(f))
        : actual.readdirSync(p)) as unknown as typeof actual.readdirSync,
    readFileSync: ((p: string, enc?: unknown) =>
      p in files
        ? files[p]
        : actual.readFileSync(p, enc as never)) as unknown as typeof actual.readFileSync,
  };
  return { ...fake, default: fake };
});

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  usePathname: () => "/en",
}));

const ArticlePage = (await import("./page")).default;
const { generateStaticParams, generateMetadata } = await import("./page");
const { EXPLORABLE_SLUGS } = await import("@/lib/explorables");

const ESSAY = [
  "---",
  "title: Excel Sheets",
  "description: On the sheets that grow where systems fail.",
  "date: 2026-05-04",
  "tags: [Essay, Work]",
  "lang: en",
  "---",
  "",
  "## The sheet",
  "",
  "It appears where a shared tool gave up. See [the model](https://example.com).",
].join("\n");

function renderEssay(lang: string, slug = "excel-sheets") {
  return ArticlePage({ params: Promise.resolve({ lang, slug }) }).then(render);
}

beforeEach(() => {
  files = { [path.join(WRITING_DIR, "excel-sheets.md")]: ESSAY };
});

describe("ArticlePage, essay branch", () => {
  it("renders the essay's frontmatter into the header", async () => {
    const { container } = await renderEssay("en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Excel Sheets");
    expect(screen.getByText("Essay")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(container.querySelector("time")).toHaveAttribute("dateTime", "2026-05-04");
  });

  it("renders the markdown body as prose, with external links opened safely", async () => {
    const { container } = await renderEssay("en");
    const prose = container.querySelector(".prose")!;
    expect(prose.querySelector("h2")).toHaveTextContent("The sheet");
    expect(prose.querySelector("a")).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("badges an essay written in another language, and keeps its own direction", async () => {
    const { container } = await renderEssay("ar");
    expect(screen.getByText("English")).toBeInTheDocument();
    const body = container.querySelector("[lang]")!;
    expect(body).toHaveAttribute("lang", "en");
    expect(body).toHaveAttribute("dir", "ltr");
  });

  it("dates and times the essay in its own language, not the page's", async () => {
    await renderEssay("ar");
    expect(screen.getByText("May 4, 2026")).toBeInTheDocument();
    expect(screen.getByText(/min read/)).toBeInTheDocument();
  });

  it("prefers the essay when a slug exists as both", async () => {
    files[path.join(WRITING_DIR, "technical-debt.md")] =
      "---\ntitle: Essay wins\ndate: 2026-01-01\n---\nbody";
    await renderEssay("en", "technical-debt");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Essay wins");
  });

  it("files an essay in an unknown language under the default locale", async () => {
    files[path.join(WRITING_DIR, "foreign.md")] =
      "---\ntitle: Foreign\nlang: fr\ndate: 2026-01-01\n---\nbody";
    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: "en", slug: "foreign" }),
    });
    expect(metadata.alternates?.canonical).toBe("/en/writing/foreign");
  });

  it("builds a page for every essay as well as every explorable", () => {
    expect(generateStaticParams()).toEqual(
      [{ slug: "excel-sheets" }, ...EXPLORABLE_SLUGS.map((slug) => ({ slug }))],
    );
  });

  it("titles the page from the essay's own frontmatter", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: "de", slug: "excel-sheets" }),
    });
    expect(metadata).toMatchObject({
      title: "Excel Sheets",
      description: "On the sheets that grow where systems fail.",
    });
  });

  it("canonicalises every locale of an essay to the language it was written in", async () => {
    // An essay is one document. It renders under any locale, but that is the
    // same prose with translated chrome, so it claims no translations.
    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: "ar", slug: "excel-sheets" }),
    });
    expect(metadata.alternates).toEqual({ canonical: "/en/writing/excel-sheets" });
    expect(metadata.openGraph).toMatchObject({
      url: "/en/writing/excel-sheets",
      locale: "en_US",
    });
  });
});
