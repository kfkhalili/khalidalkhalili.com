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

### Environment

Every feed but one is public and needs nothing. The Islam page reads my
QuranReflect posts through the [Quran Foundation
gateway](https://api-docs.quran.foundation), which wants an OAuth2
client-credentials pair. Put it in `.env.local` (and in the Vercel project for
deploys):

```
QURAN_FOUNDATION_CLIENT_ID=…
QURAN_FOUNDATION_CLIENT_SECRET=…
QURAN_FOUNDATION_ENV=prelive     # optional; omit once the credentials are production ones
```

The pair needs two scopes: `post.read` for the reflections, `content` for the
surah names and the ayat they cite. A client granted neither still renders the
page, which
degrades to a link rather than an error, so the site runs without any of this
set. The credentials are read on the server only and never reach the browser.

## Test

[Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com), in
jsdom. Every page, component, and library module is covered: statements, lines,
and functions at 100%, branches above 99%. The thresholds are enforced, so a gap
fails the run.

```bash
npm test             # run the suite
npm run test:coverage
```

Tests sit next to what they test (`lib/i18n.test.ts`, `components/site-header.test.tsx`),
and pure transforms are tested apart from the I/O around them: `articles.test.ts`
covers the seams, `articles.essays.test.ts` the reading of files.

Nothing touches the network or the disk it doesn't own. Goodreads, Chess.com and
the Quran Foundation gateway run through a stubbed `fetch`; the essay tests back `content/writing` with an
in-memory filesystem; the share card captures the element tree satori would be
handed rather than rasterizing it.

## Structure

```
app/
  [lang]/
    layout.tsx                 # root: <html lang/dir>, fonts (Latin + Arabic), header/footer
    page.tsx                   # home
    about/page.tsx
    projects/page.tsx
    reading/page.tsx           # live Goodreads shelves + latest review (per request)
    islam/page.tsx             # live QuranReflect reflections (per request, authenticated)
    chess/page.tsx             # live Chess.com ratings + last game (per request)
    writing/
      page.tsx                 # index: merges essays + explorables
      [slug]/page.tsx          # one route, two adapters: essays and explorables
      [slug]/opengraph-image.tsx # the share card, drawn per article per locale
  globals.css
  favicon.ico                  # the KA mark, 16/32/48 in one file
  icon0.png, icon1.png         # the same mark at 96 and 192
  apple-icon.png               # 180, square and opaque: iOS masks it itself
  robots.ts                    # → /robots.txt
  sitemap.ts                   # → /sitemap.xml (every indexable page; not the live feeds)
assets/fonts/                  # TTFs for the share card (satori can't use next/font)
assets/khatam-star-icon.svg    # the favicon before the KA mark; kept, not served
archive/mindful-mantra/        # images from the retired blog; kept, not served (see its README)
components/explorables/        # each explorable's body + its per-locale copy
proxy.ts                       # locale detection + redirect (Next 16 middleware convention)
dictionaries/{en,de,ar}.json   # translated chrome strings (site metadata, nav, buttons, labels)
content/
  {en,de,ar}/home.md, about.md # per-locale page copy (missing locale → falls back to en)
  writing/<slug>.md            # essays and prose
lib/
  i18n.ts                      # locales, direction, dictionaries
  content.ts                   # markdown reader/renderer
  articles.ts                  # essays (files) + explorables (registry), merged
  explorables.ts               # registry for interactive code-page explorables
  format.ts                    # date + reading-time strings (safe on the client)
  share.ts                     # page + article URLs, hreflang sets, intent links
  page-metadata.ts             # a page's canonical, hreflang set, and og block
  site.ts                      # name, origin, external profiles
  projects.ts                  # registry for the projects page
  prose.ts                     # someone else's writing → text, and an excerpt of it
  goodreads.ts                 # shelf RSS → Book[], reviews included
  chess.ts                     # Chess.com stats + last game → typed shapes
  quran-reflect.ts             # QuranReflect posts + quoted ayat via the Quran Foundation gateway
```

## Write an essay

Drop a markdown file in `content/writing/<slug>.md`. The filename becomes the
slug and then a sitemap URL, so it must be kebab-case (`my-essay.md`); the build
fails loudly otherwise.

```markdown
---
title: My essay
description: One-line summary for the card + meta.   # optional
date: "2026-07-05" # must be an ISO day; anything else is treated as undated
tags: ["Essay"]
lang: en          # en | de | ar   (ar renders right-to-left)
collection: writing  # writing (default) | prose
hidden: true      # optional; keeps the piece in the repo but off the site
---

Body in plain markdown…
```

An essay is one document in one language. It stays readable at every locale, but
it is listed in the sitemap once, under `lang`, and its other locale URLs
canonicalise there: it has translated chrome, not translated prose. An essay
also shadows an explorable that shares its slug.

It appears in the writing index automatically (newest first), with a language
badge for non-English posts, at `/<locale>/writing/<slug>`.

`collection` decides which filter chip on the index the piece sits behind:
`writing` for current essays and explorables, `prose` for the short literary
pieces from 2012-13. The chips only appear once more than one collection has
something in it.

`tags` are the other way into the index. Every tag is a link to
`/<locale>/writing?tag=<tag>`, wherever it is shown: on a card and in a piece's
own header. The index reads that query parameter and shows only the pieces
carrying it. It also carries a row of every tag it holds, with counts and an
"All" chip, which is always the same row whichever tag is in force, so choosing
one never moves the articles underneath. Tags are matched exactly, so keep the
spelling steady across pieces, and write them in the language of the piece: an
explorable's tags are localized alongside its title in its content module.

`hidden: true` takes a piece off the site without deleting it. It disappears
from the writing index, the home page, and the sitemap, and no page is built for
it, so its URL 404s rather than staying quietly reachable. The file stays where
it is; remove the line to publish. Explorables take the same flag on their
registry entry in [`lib/explorables.ts`](lib/explorables.ts).

`description` is optional. Left out, the card and the meta description fall back
to the piece's opening (whole sentences from the first paragraph, up to roughly
160 characters). That suits short prose, which is often too short to summarize
without giving away its turn. Write one when the first paragraph isn't the real
opening, such as a dateline or a note to the reader.

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
