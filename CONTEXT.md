# Context

Domain language for **khalidalkhalili.com**: a multilingual personal site of
interactive explorable explanations, essays, and notes.

## Domain terms

- **Explorable**: an interactive explanation whose body is a React component (e.g.
  the technical-debt sim), carried in the explorables registry (`lib/explorables.ts`)
  and shown through the shared article route. Its copy (title, prose, and the sim's
  labels) lives per locale in a co-located content module, so the whole explorable
  renders in the page's language (RTL included).
- **Essay**: a prose piece authored as a markdown file in `content/writing/`,
  rendered on the dynamic `writing/[slug]` route.
- **Article**: either an Explorable or an Essay; the writing index merges both.
- **Collection**: which body of work an Article belongs to, set by the
  `collection` frontmatter field and defaulting to `writing`. `writing` is the
  current work; `prose` is the short literary pieces written 2012-13. Where
  `kind` says how an Article renders, `collection` says where it came from,
  which is what the reader filters by on the index.
- **Locale**: a supported language (`en`, `de`, `ar`). Arabic is right-to-left.
- **Page copy**: the chrome-adjacent prose (home hero, about) authored per locale
  in `content/<locale>/*.md`, falling back to the default locale.

## Deepened modules

- **Content document** (`lib/content.ts`): the one module that turns a markdown
  file on disk into `{ meta, body, html }`. `readMarkdown` is the shared
  read-plus-frontmatter primitive; `readContent` adds locale fallback + render.
  Both page copy and essays cross this interface; nothing else reads markdown.
- **Resolved locale** (`lib/i18n.ts` → `resolveLocale`): one interface returning
  everything a page needs about its locale: `dict`, `dir`, and directional
  `back` / `forward` arrows. `languageBadge` flags an article whose language differs
  from the page it's shown on.
  Pages cross this one interface instead of assembling from `getDictionary` +
  `dirOf` + `LOCALE_META`.
- **Article render seam** (`app/[lang]/writing/[slug]`): the one place an article
  renders. Two adapters satisfy it: a **markdown adapter** (essays → HTML) and a
  **component adapter** (explorables → their `Body`, rendered in the page's locale).
  Registry entries carry a typed `Body`, so the registry↔renderer link can't silently
  break.
- **Goodreads parse** (`parseShelf` in `lib/goodreads.ts`): the pure RSS → `Book[]`
  transform, exposed as the test surface. `lib/goodreads.test.ts` feeds it fixtures
  with no network.
