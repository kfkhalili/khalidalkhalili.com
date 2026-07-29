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
  which is one of the two things the reader narrows the index by.
- **Tag**: what a piece is about, written in the piece's own language and shown
  on its card and in its header. A tag is a place rather than a label: it links
  to the writing index narrowed to it, so it reads the same from a card, from a
  piece, or from a link someone was sent. Where a Collection is a glance at the
  same shelf and so lives in the index's own state, a Tag lives in the URL
  (`?tag=`), because it is somewhere the reader arrived. Matched exactly, and
  refused when the URL names more than one, which would ask for two shelves at
  once. Both filter rows on the index describe the whole index rather than the
  shelf currently shown, so neither appears, disappears, or shortens as it is
  used: what the reader is aiming at stays where it was.
- **Hidden**: an Article kept in the repo but off the site, set by `hidden: true`
  in an essay's frontmatter or on an explorable's registry entry. Hidden is not
  unlisted: the piece leaves the index, the home page and the sitemap, and no
  page is built for it, so its URL 404s. Both registries drop hidden entries at
  the source, so no page has to remember the rule.
- **Sim**: the interactive widget an Explorable is built around, and the thing the
  piece argues through rather than about. A **running sim** keeps a clock and
  steps a model over time (the technical-debt and watermelon sims); a **discrete
  sim** answers whatever the reader has entered so far and holds still until
  they change it (the contract diagnostic). Every sim splits the same way: a
  **Sim model** that is pure and has no Locale, and a view that renders it.
- **Sim caption**: the line that tells the reader how to work a Sim ("you can run
  this machine yourself"). It addresses the machine rather than continuing the
  argument, so it is not set as essay prose: caption and Sim render as one
  `figure`, the caption in monospace, tight against the machine and standing off
  from the column. Only a Sim that needs operating gets one; prose that merely
  happens to precede a Sim stays prose, and a Sim that says what it is needs no
  caption at all. What the Sim itself says, the prose leaves to it: the contract
  diagnostic asks the four questions and the technical-debt sim explains each of
  the four archetypes as you pick it, so the piece names the count and points the
  reader at the machine rather than enumerating first.
- **Layered copy** (`Layered` in `components/tech-debt-sim.tsx`): a block of Sim
  copy that swaps lines without changing height. Every line it can show is laid
  into one grid cell, so the cell is as tall as the longest line at whatever
  width it is rendered at, and the lines not showing are `invisible` (holding the
  box open, out of the a11y tree) rather than unmounted. A Sim that resized to
  the line in play would jog the bars underneath on every pick, which is the
  moment the reader is watching them. Lines that share a block are written to a
  similar length in every Locale, so the reserve is the copy rather than padding.
- **Locale**: a supported language (`en`, `de`, `ar`). Arabic is right-to-left.
- **Page copy**: the chrome-adjacent prose (home hero, about) authored per locale
  in `content/<locale>/*.md`, falling back to the default locale.
- **Share link**: a page's absolute, locale-qualified URL. For an article the same
  string is what a reader copies, what `og:url` claims, what the canonical tag
  points at, and what the sitemap lists, so an article shared from the Arabic
  page opens in Arabic.
- **Byline**: an Article's date and reading time, always written in the language
  the piece itself was written in, wherever the piece is shown. An Arabic essay
  listed on the English index dates itself in Arabic, because the date belongs to
  the writing rather than to the page around it; the language badge is what tells
  the reader they differ. `lib/format.ts` takes the Article rather than a Locale,
  so the page's language is not reachable from the byline at all.
- **Alternate set**: one page's address in every locale, keyed for `hreflang`.
  Reciprocal by construction (each locale lists every locale, itself included)
  plus `x-default` on the locale the proxy falls back to. Claimed only where the
  locales are genuine translations: the chrome pages and the explorables. An
  Essay is one document in one language, so its three URLs canonicalise to the
  language it was written in and claim no alternates.
- **Share card**: the 1200×630 image a shared link unfurls into, drawn per
  article per locale from the article's own metadata.

## Deepened modules

- **Sim model** (`*.model.ts` beside each sim): the pure model a Sim draws,
  holding the state, the step, and the thresholds, and knowing nothing about
  React, CSS, or Locale. It answers in domain terms: a step returns the next
  state, a log line comes back as a key the view looks up in its own strings, a
  reading comes back as a tone rather than a colour. That is what makes the
  claims each piece rests on assertable directly, so the calibration the prose
  promises (that 30% really is a steady state, that the Watermelon preset really
  does settle green outside and red inside) is a test rather than a comment. The
  state a sim opens on is settled on first use rather than at import, so a test
  that only reads the surrounding prose does not pay for it.
- **Sim clock** (`components/use-sim-clock.ts`): the one clock every running Sim
  keeps. It steps on an interval, but only while the sim is both on screen and in
  a visible tab, so a sim left in a background tab stops rather than running
  forever, and an Explorable carrying two sims pays for neither while unread.
  Living here rather than in each sim means a new running sim gets the rule by
  calling this at all. What the sim draws, and how, is deliberately not behind
  this interface: sims are content and vary by piece.
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
- **Locale coercion** (`lib/i18n.ts` → `toLocale`): the one place the site decides
  what an unrecognised language means. Route params, frontmatter fields and stored
  strings all arrive untrusted, and every locale-keyed record is read as
  `RECORD[toLocale(x)]`, so the dictionaries, the explorables registry, the projects
  registry, each sim's content module, the sitemap and the Open Graph tags cannot
  answer differently. Where `resolveLocale` serves pages, this serves content:
  it is the half that a page-level interface could not reach.
- **Article render seam** (`app/[lang]/writing/[slug]`): the one place an article
  renders. Two adapters satisfy it: a **markdown adapter** (essays → HTML) and a
  **component adapter** (explorables → their `Body`, rendered in the page's locale).
  Registry entries carry a typed `Body`, so the registry↔renderer link can't silently
  break.
- **Goodreads parse** (`parseShelf` in `lib/goodreads.ts`): the pure RSS → `Book[]`
  transform, exposed as the test surface. `lib/goodreads.test.ts` feeds it fixtures
  with no network.
- **Chess parse** (`parseStats` and `parseGame` in `lib/chess.ts`): the same seam
  for chess.com, which answers with JSON rather than RSS. `parseStats` reads a
  profile into ratings; `parseGame` decides whether a payload is a game worth
  showing, which side was played, how it ended, and replays the PGN into the
  positions the board steps through. Both are pure, so the rules the page depends
  on are asserted directly, and the fetchers above them are left holding only the
  transport: one request for the stats, two for the newest archived game, and the
  degradation when either fails.
- **Share link** (`lib/share.ts`): the one module that knows where a page lives
  and how that address is handed to someone else. The article route's canonical
  tag, its `hreflang` alternates, its `og:url`, the reader-facing copy button,
  and every entry in the sitemap read from it, so they cannot drift apart.
  `…Path` is relative, for metadata that resolves against `metadataBase`; `…Url`
  is absolute, for the copy button and the sitemap, which inherits no base.
  Pure and tested (`lib/share.test.ts`).
- **Tag link** (`lib/tags.ts`): the one module that knows a tag is a place. It
  names the query key, writes the href a tag is shown as, reads the key back on
  the index, narrows the list, and counts the index's tags for the filter row. The tag on a card, the tag in an article's
  header, and the index answering them all cross it, so a tag cannot be written
  one way and read another; escaping happens once, which is what keeps an
  Arabic tag or an ampersand from rewriting the query. Type-only import of
  `Article`, so it stays free of the libraries that read from disk and can be
  reached from a Client Component. Pure and tested (`lib/tags.test.ts`).
- **Page self-description** (`lib/page-metadata.ts`): the one place a page says
  which address it lives at. Next replaces an inherited Open Graph block rather
  than merging into it, so a page that names any of it must name all of it; this
  is that block, built from the page's own locale and path. The layout therefore
  claims no `url` of its own, which would otherwise have every page report the
  site root.
- **Site inventory** (`app/sitemap.ts`): the one statement of which pages the
  site offers for indexing, in which locales, and when each was published. It
  reads the same registries the pages render from, so a new article or locale
  appears in it without anyone remembering to. Where the repo holds no date it
  claims none, rather than stamping the build time. Pages whose body is a live
  third-party API (`reading`, `chess`) are linked by the site and crawlable, but
  deliberately not nominated here.
- **Share card** (`app/[lang]/writing/[slug]/opengraph-image`): the article's
  metadata rendered as an image, prerendered per locale. It carries the site's
  own constraints: satori can't see `next/font`, so the faces are vendored in
  `assets/fonts/`; satori has no bidi engine, so the Arabic card's lines are
  broken and reversed in the route before they are handed over.
