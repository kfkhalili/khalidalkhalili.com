# khalidalkhalili.com

My personal site: a home for interactive **explorable explanations**, essays, and
notes. Multilingual (English · German · Arabic), built to make ideas playable.

## Stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack): fully native TSX
- **Locale-routed i18n** (`/en`, `/de`, `/ar`) with **RTL** for Arabic: no library, just a `proxy` + a dictionaries folder
- **[Tailwind CSS v4](https://tailwindcss.com)**: CSS-first theming
- **Content in markdown** (`gray-matter` + `marked`)
- **[next-themes](https://github.com/pacocoursey/next-themes)**: light/dark
- Deployed on **[Vercel](https://vercel.com)**

## Develop

```bash
npm install
npm run dev      # http://localhost:3000  (redirects to /en)
```

## Structure

```
app/
  [lang]/
    layout.tsx                 # root: <html lang/dir>, fonts (Latin + Arabic), header/footer
    page.tsx                   # home
    about/page.tsx
    projects/page.tsx
    reading/page.tsx           # live Goodreads shelves (rendered per request)
    chess/page.tsx             # live Chess.com ratings + last game (per request)
    writing/
      page.tsx                 # index: merges essays + explorables
      [slug]/page.tsx          # one route, two adapters: essays and explorables
      [slug]/opengraph-image.tsx # the share card, drawn per article per locale
  globals.css
  icon.svg
  robots.ts                    # → /robots.txt
  sitemap.ts                   # → /sitemap.xml (every indexable page; not reading/chess)
assets/fonts/                  # TTFs for the share card (satori can't use next/font)
components/explorables/        # each explorable's body + its per-locale copy
proxy.ts                       # locale detection + redirect (Next 16 middleware convention)
dictionaries/{en,de,ar}.json   # translated chrome strings (site metadata, nav, buttons, labels)
content/
  {en,de,ar}/home.md, about.md # per-locale page copy (missing locale → falls back to en)
  writing/<slug>.md            # essays
lib/
  i18n.ts                      # locales, direction, dictionaries
  content.ts                   # markdown reader/renderer
  articles.ts                  # essays (files) + explorables (registry), merged
  explorables.ts               # registry for interactive code-page explorables
  share.ts                     # page + article URLs, hreflang sets, intent links
  page-metadata.ts             # a page's canonical, hreflang set, and og block
  site.ts                      # name, origin, external profiles
  projects.ts                  # registry for the projects page
  goodreads.ts                 # shelf RSS → Book[]
  chess.ts                     # Chess.com stats + last game → typed shapes
```

## Write an essay

Drop a markdown file in `content/writing/<slug>.md`. The filename becomes the
slug and then a sitemap URL, so it must be kebab-case (`my-essay.md`); the build
fails loudly otherwise.

```markdown
---
title: My essay
description: One-line summary for the card + meta.
date: "2026-07-05" # must be an ISO day; anything else is treated as undated
tags: ["Essay"]
lang: en          # en | de | ar   (ar renders right-to-left)
---

Body in plain markdown…
```

An essay is one document in one language. It stays readable at every locale, but
it is listed in the sitemap once, under `lang`, and its other locale URLs
canonicalise there: it has translated chrome, not translated prose. An essay
also shadows an explorable that shares its slug.

It appears in the writing index automatically (newest first), with a language
badge for non-English posts, at `/<locale>/writing/<slug>`.

## Translate

- **Page copy:** add `content/<locale>/home.md` or `about.md` (missing → English is shown).
- **Chrome (nav/buttons/labels):** edit `dictionaries/<locale>.json`.

## Add a language

1. Add its code to `LOCALES` + `LOCALE_META` in [`lib/i18n.ts`](lib/i18n.ts) (label, `dir`, `dateLocale`, `ogLocale`).
2. Add `dictionaries/<code>.json`.

Routing, the language switcher, share links, `hreflang` alternates, and static
generation pick it up automatically. A language in a script neither Inter nor
Noto Sans Arabic covers also needs its face added to `assets/fonts/`, or its
share cards render as empty boxes.

## Explorables

Interactive explorables (like the technical-debt sim) are React components under
`components/explorables/`, each paired with a content module holding its copy per
locale. They are registered in [`lib/explorables.ts`](lib/explorables.ts) and render
through the same `writing/[slug]` route as essays, so they appear alongside them in
the index and in the sitemap. Prose = markdown; interactive = code.

An explorable added as its own route file instead of a registry entry is invisible
to both the writing index and the sitemap.
