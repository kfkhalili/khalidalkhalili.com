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
    writing/
      page.tsx                 # index: merges essays + explorables
      [slug]/page.tsx          # file-based essays
      technical-debt/page.tsx  # an interactive explorable (React page)
  globals.css
  icon.svg
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
```

## Write an essay

Drop a markdown file in `content/writing/<slug>.md`:

```markdown
---
title: My essay
description: One-line summary for the card + meta.
date: "2026-07-05"
tags: ["Essay"]
lang: en          # en | de | ar   (ar renders right-to-left)
---

Body in plain markdown…
```

It appears in the writing index automatically (newest first), with a language
badge for non-English posts, at `/<locale>/writing/<slug>`.

## Translate

- **Page copy:** add `content/<locale>/home.md` or `about.md` (missing → English is shown).
- **Chrome (nav/buttons/labels):** edit `dictionaries/<locale>.json`.

## Add a language

1. Add its code to `LOCALES` + `LOCALE_META` in [`lib/i18n.ts`](lib/i18n.ts) (label, `dir`, `dateLocale`).
2. Add `dictionaries/<code>.json`.

Routing, the language switcher, and static generation pick it up automatically.

## Explorables

Interactive explorables (like the technical-debt sim) are React pages under
`app/[lang]/writing/<slug>/`, listed via [`lib/explorables.ts`](lib/explorables.ts) so
they appear alongside file-based essays. Prose = markdown; interactive = code.
