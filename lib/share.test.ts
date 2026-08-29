import { describe, it, expect } from "vitest";
import { articlePath, articleUrl, pagePath, pageUrl, shareIntent } from "./share";

describe("articleUrl", () => {
  it("is absolute", () => {
    expect(articleUrl("the-third-thing")).toBe(
      "https://khalidalkhalili.com/writing/the-third-thing",
    );
  });
});

describe("articlePath", () => {
  it("addresses an article under /writing", () => {
    expect(articlePath("technical-debt")).toBe("/writing/technical-debt");
  });
});

describe("pagePath", () => {
  it("addresses the home page as the bare root", () => {
    expect(pagePath("")).toBe("/");
  });

  it("addresses a page by its sub", () => {
    expect(pagePath("/about")).toBe("/about");
  });
});

describe("pageUrl", () => {
  it("addresses the home page without a trailing slash beyond the root", () => {
    expect(pageUrl("")).toBe("https://khalidalkhalili.com");
  });

  it("addresses a page absolutely", () => {
    expect(pageUrl("/about")).toBe("https://khalidalkhalili.com/about");
  });
});

describe("shareIntent", () => {
  const article = {
    url: "https://khalidalkhalili.com/writing/the-third-thing",
    title: "الشيء الثالث",
  };

  it("hands LinkedIn the URL alone, encoded", () => {
    expect(shareIntent("linkedin", article)).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fkhalidalkhalili.com%2Fwriting%2Fthe-third-thing",
    );
  });

  it("encodes a non-Latin title for X", () => {
    const href = shareIntent("x", article);
    expect(href).toContain("text=%D8%A7%D9%84%D8%B4%D9%8A%D8%A1");
    expect(href).not.toContain("الشيء");
  });

  it("puts title and URL in one WhatsApp message", () => {
    expect(shareIntent("whatsapp", { url: "https://x.test/a", title: "A B" }))
      .toBe("https://wa.me/?text=A%20B%20https%3A%2F%2Fx.test%2Fa");
  });
});
