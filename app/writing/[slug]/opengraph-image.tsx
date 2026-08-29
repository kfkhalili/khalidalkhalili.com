import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getEssayContent, getExplorable } from "@/lib/articles";
import { articleDate, articleReadingTime } from "@/lib/format";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageParams = { slug: string };

/** The article an OG card is for, however it's authored. */
function articleFor({ slug }: ImageParams) {
  return getEssayContent(slug)?.article ?? getExplorable(slug);
}

export async function generateImageMetadata({
  params,
}: {
  // Route params arrive as a promise; the image-metadata hook is documented
  // with a plain object. Awaiting covers both shapes.
  params: ImageParams | Promise<ImageParams>;
}) {
  const p = await params;
  const article = articleFor(p);
  return [
    {
      id: "card",
      size,
      contentType,
      alt: article ? `${article.title} · ${site.name}` : site.name,
    },
  ];
}

// Satori can't see next/font, so the faces are vendored and read off disk. Both
// scripts are registered on every card: satori falls back per glyph, which is
// what keeps an Arabic term quoted inside an English title from tofu.
// The UI cut of Noto Sans Arabic is deliberate: satori's shaper rejects the
// standard cut's required-ligature table, and this is the same design.
const ARABIC = "Noto Sans Arabic UI";
const FACES = [
  { name: "Inter", file: "Inter-Regular.ttf", weight: 400 },
  { name: "Inter", file: "Inter-SemiBold.ttf", weight: 600 },
  { name: ARABIC, file: "NotoSansArabicUI-Regular.ttf", weight: 400 },
  { name: ARABIC, file: "NotoSansArabicUI-SemiBold.ttf", weight: 600 },
] as const;

let fontCache: Promise<
  { name: string; data: Buffer; weight: 400 | 600; style: "normal" }[]
> | null = null;

function fonts() {
  fontCache ??= Promise.all(
    FACES.map(async (f) => ({
      name: f.name,
      data: await readFile(join(process.cwd(), "assets/fonts", f.file)),
      weight: f.weight,
      style: "normal" as const,
    })),
  );
  return fontCache;
}

// The site's light palette, inlined: the card is paper, not a screenshot of it.
const PAPER = "#f8f6f1";
const INK = "#1b1b19";
const MUTED = "#6d6d66";
const FAINT = "#90908a";
const ACCENT = "#0f9d76";

const MOTIF = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <g fill="none" stroke="${ACCENT}" stroke-width="1.1">
      <polygon points="22.5,22.5 73.5,22.5 73.5,73.5 22.5,73.5" />
      <polygon points="48,12 84,48 48,84 12,48" />
      <circle cx="48" cy="48" r="9" />
    </g>
  </svg>`,
)}`;

/** Long titles step down a size rather than wrapping into the description. */
function titleSize(title: string): number {
  if (title.length <= 38) return 68;
  if (title.length <= 72) return 56;
  return 46;
}

/** Truncate on a word boundary, so a card never ends mid-word. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

// The text box the title and description wrap inside.
const PROSE_WIDTH = 940;

export default async function Image({
  params,
}: {
  params: Promise<ImageParams>;
}) {
  const { slug } = await params;
  const article = articleFor({ slug });

  const title = article?.title ?? site.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "68px 76px",
          background: PAPER,
          color: INK,
          fontFamily: `"Inter", "${ARABIC}"`,
          position: "relative",
        }}
      >
        {/* The Rub el Hizb from the site backdrop, bled off the leading corner. */}
        <img
          src={MOTIF}
          alt=""
          width={560}
          height={560}
          style={{
            position: "absolute",
            top: -150,
            right: -160,
            opacity: 0.16,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600 }}>
            {site.shortName.toLowerCase()}
            <span style={{ color: ACCENT }}>.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
            {(article?.tags ?? []).slice(0, 3).map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  border: `1px solid ${ACCENT}55`,
                  borderRadius: 999,
                  padding: "4px 16px",
                  fontSize: 20,
                  color: MUTED,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            textAlign: "left",
            maxWidth: PROSE_WIDTH,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: titleSize(title),
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: -1.5,
            }}
          >
            {clamp(title, 110)}
          </div>
          {article?.description ? (
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 27,
                lineHeight: 1.45,
                color: MUTED,
              }}
            >
              {clamp(article.description, 130)}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <div
            style={{ width: 72, height: 4, background: ACCENT, borderRadius: 2 }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 22,
              fontSize: 23,
              color: FAINT,
            }}
          >
            {/* One text node: satori collapses the gap between sibling spans. */}
            <div style={{ display: "flex" }}>
              {article
                ? `${articleDate(article)} · ${articleReadingTime(article)}`
                : ""}
            </div>
            <div style={{ display: "flex" }}>
              {site.url.replace("https://", "")}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}
