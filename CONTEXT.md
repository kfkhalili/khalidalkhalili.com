# Context

Domain language for **khalidalkhalili.com** — a multilingual personal site of
interactive explorable explanations, essays, and notes.

## Domain terms

- **Explorable** — an interactive explanation rendered as a React page (e.g. the
  technical-debt sim). Appears in the writing index via the explorables registry
  (`lib/explorables.ts`).
- **Essay** — a prose piece authored as a markdown file in `content/writing/`,
  rendered on the dynamic `writing/[slug]` route.
- **Article** — either an Explorable or an Essay; the writing index merges both.
- **Locale** — a supported language (`en`, `de`, `ar`). Arabic is right-to-left.
- **Page copy** — the chrome-adjacent prose (home hero, about) authored per locale
  in `content/<locale>/*.md`, falling back to the default locale.

## Deepened modules

- **Content document** (`lib/content.ts`) — the one module that turns a markdown
  file on disk into `{ meta, body, html }`. `readMarkdown` is the shared
  read-plus-frontmatter primitive; `readContent` adds locale fallback + render.
  Both page copy and essays cross this interface — nothing else reads markdown.
- **Resolved locale** (`lib/i18n.ts` → `resolveLocale`) — one interface returning
  everything a page needs about its locale: `dict`, `dir`, and directional
  `back` / `forward` arrows. `languageBadge` gives an article's language label.
  Pages cross this one interface instead of assembling from `getDictionary` +
  `dirOf` + `LOCALE_META`.
