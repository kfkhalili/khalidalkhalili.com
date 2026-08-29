import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { readMarkdown, renderMarkdown, renderInline, readContent } from "./content";

const CONTENT_DIR = path.join(process.cwd(), "content");

describe("readMarkdown", () => {
  it("splits frontmatter from a trimmed body", () => {
    const file = path.join(CONTENT_DIR, "home.md");
    const { meta, body } = readMarkdown(file);
    expect(meta.heading).toBeTypeOf("string");
    expect(body).toBe(body.trim());
  });

  it("throws when the file is missing", () => {
    expect(() => readMarkdown(path.join(CONTENT_DIR, "nope.md"))).toThrow();
  });
});

describe("renderMarkdown", () => {
  it("renders block markdown to HTML", () => {
    const html = renderMarkdown("# Title\n\nA paragraph with *emphasis*.");
    expect(html).toContain("<h1");
    expect(html).toContain("<p>");
    expect(html).toContain("<em>emphasis</em>");
  });

  it("renders lists", () => {
    const html = renderMarkdown("- one\n- two");
    expect(html).toContain("<ul>");
    expect(html.match(/<li>/g)).toHaveLength(2);
  });

  it("opens external links in a new tab, safely", () => {
    const html = renderMarkdown("[out](https://example.com/x)");
    expect(html).toContain('href="https://example.com/x"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("rewrites http links too, and every external link on the page", () => {
    const html = renderMarkdown("[a](http://a.test) and [b](https://b.test)");
    expect(html.match(/target="_blank"/g)).toHaveLength(2);
  });

  it("leaves internal links alone", () => {
    const html = renderMarkdown("[home](/writing)");
    expect(html).toContain('href="/writing"');
    expect(html).not.toContain("target=");
  });
});

describe("renderInline", () => {
  it("renders a single line with no wrapping paragraph", () => {
    const html = renderInline("a *lead* line");
    expect(html).toBe("a <em>lead</em> line");
  });

  it("still opens external links in a new tab", () => {
    expect(renderInline("[out](https://example.com)")).toContain('target="_blank"');
  });
});

describe("readContent", () => {
  it("reads the home copy", () => {
    const { meta, body, html } = readContent("home");
    expect(meta.heading).toBeTruthy();
    expect(meta.eyebrow).toBeTruthy();
    expect(meta.lead).toBeTruthy();
    expect(body).toBeTypeOf("string");
    expect(html).toBeTypeOf("string");
  });

  it("reads the about copy and renders its body", () => {
    const { meta, html } = readContent("about");
    expect(meta.title).toBeTruthy();
    expect(html).toContain("<p>");
  });

  it("throws when the slug does not exist", () => {
    expect(() => readContent("not-a-page")).toThrow();
  });

  it("covers every page the site reads", () => {
    for (const slug of ["home", "about"]) {
      expect(fs.existsSync(path.join(CONTENT_DIR, `${slug}.md`))).toBe(true);
    }
  });
});
