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
  usePathname: () => "/",
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
  "---",
  "",
  "## The sheet",
  "",
  "It appears where a shared tool gave up. See [the model](https://example.com).",
].join("\n");

function renderEssay(slug = "excel-sheets") {
  return ArticlePage({ params: Promise.resolve({ slug }) }).then(render);
}

beforeEach(() => {
  files = { [path.join(WRITING_DIR, "excel-sheets.md")]: ESSAY };
});

describe("ArticlePage, essay branch", () => {
  it("renders the essay's frontmatter into the header", async () => {
    const { container } = await renderEssay();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Excel Sheets");
    expect(screen.getByText("Essay")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(container.querySelector("time")).toHaveAttribute("dateTime", "2026-05-04");
  });

  it("renders the markdown body as prose, with external links opened safely", async () => {
    const { container } = await renderEssay();
    const prose = container.querySelector(".prose")!;
    expect(prose.querySelector("h2")).toHaveTextContent("The sheet");
    expect(prose.querySelector("a")).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("dates and times the essay", async () => {
    await renderEssay();
    expect(screen.getByText("May 4, 2026")).toBeInTheDocument();
    expect(screen.getByText(/min read/)).toBeInTheDocument();
  });

  it("prefers the essay when a slug exists as both", async () => {
    files[path.join(WRITING_DIR, "technical-debt.md")] =
      "---\ntitle: Essay wins\ndate: 2026-01-01\n---\nbody";
    await renderEssay("technical-debt");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Essay wins");
  });

  it("builds a page for every essay as well as every explorable", () => {
    expect(generateStaticParams()).toEqual(
      [{ slug: "excel-sheets" }, ...EXPLORABLE_SLUGS.map((slug) => ({ slug }))],
    );
  });

  it("titles the page from the essay's own frontmatter", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "excel-sheets" }),
    });
    expect(metadata).toMatchObject({
      title: "Excel Sheets",
      description: "On the sheets that grow where systems fail.",
    });
  });

  it("canonicalises the essay to its own address", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "excel-sheets" }),
    });
    expect(metadata.alternates).toEqual({ canonical: "/writing/excel-sheets" });
    expect(metadata.openGraph).toMatchObject({
      url: "/writing/excel-sheets",
      locale: "en_US",
    });
  });
});
