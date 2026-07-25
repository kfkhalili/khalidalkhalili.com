# Vendored fonts

These faces exist for one reason: `ImageResponse` (satori) renders the OG cards
in `app/[lang]/writing/[slug]/opengraph-image.tsx` outside the browser, so it
can't use the `next/font` faces the site itself loads. It needs font bytes on
disk, in TTF or OTF (it does not read WOFF2).

| File                            | Family           | Source                                                    |
| ------------------------------- | ---------------- | --------------------------------------------------------- |
| `Inter-Regular.ttf`             | Inter 400        | Google Fonts (`fonts.gstatic.com`), static instance        |
| `Inter-SemiBold.ttf`            | Inter 600        | Google Fonts (`fonts.gstatic.com`), static instance        |
| `NotoSansArabic-Regular.ttf`    | Noto Sans Arabic 400 | Google Fonts (`fonts.gstatic.com`), static instance    |
| `NotoSansArabic-SemiBold.ttf`   | Noto Sans Arabic 600 | Google Fonts (`fonts.gstatic.com`), static instance    |

Both families are licensed under the SIL Open Font License 1.1, which permits
bundling and redistribution.

They are committed rather than fetched at build time so a card renders the same
offline as it does on Vercel, and so a Google Fonts outage can't fail a build.
