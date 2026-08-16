/**
 * Prose that arrives from another platform, made renderable. Feeds hand this
 * site fragments of HTML (a Goodreads review, a QuranReflect body, the
 * rendering under a quoted ayah), and the places that show an opening rather
 * than the whole (the reading page's latest review, the Elsewhere teasers)
 * cut it on a word boundary. The rules are the same wherever they are used
 * and belong to no one feed, so they live here: pure, no network, no locale.
 */

/**
 * A fragment of someone's HTML flattened to text. The pages render these as
 * text in JSX, which React escapes, so this is about reading well rather than
 * about safety: tags that carry a break become one, everything else goes, and
 * the paragraphs survive as blank lines for the page to honour.
 *
 * Callers decode entities before this runs, so prose that spelled out `&lt;b&gt;`
 * arrives here as a real tag and is stripped rather than resurrected.
 */
export function plainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/[^\S\n]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * The opening of a piece, cut to a budget on a word boundary so the page can
 * link out for the rest. Separate from any one feed's parse: how much a page
 * shows is the page's business, and the feed keeps the whole of it either way.
 */
export function excerpt(text: string, maxChars = 420): string {
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;

  const cut = clean.slice(0, maxChars);
  const boundary = cut.search(/\s\S*$/); // start of the word being severed
  // A cut can land mid-clause, and "illiteracy,…" reads as a typo rather than
  // as an ellipsis. Dangling separators go; sentence-enders are left alone.
  const kept = (boundary > 0 ? cut.slice(0, boundary) : cut).replace(
    /[\s,;:،؛-]+$/u,
    "",
  );
  return `${kept}…`;
}
