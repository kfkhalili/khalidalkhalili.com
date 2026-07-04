# khalidalkhalili.com

My personal site — a home for interactive **explorable explanations**, essays, and
notes. Built to make ideas playable, not just readable.

## Stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack) — fully native TSX, no MDX
- **[Tailwind CSS v4](https://tailwindcss.com)** — CSS-first theming (`@theme` in `app/globals.css`)
- **[next-themes](https://github.com/pacocoursey/next-themes)** — light/dark toggle
- Deployed on **[Vercel](https://vercel.com)**

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Structure

```
app/
  layout.tsx                        # root layout: fonts, theme provider, header/footer
  page.tsx                          # home
  globals.css                       # Tailwind + theme tokens + prose + sim styles
  icon.svg                          # favicon (emerald khatam star)
  about/page.tsx
  writing/
    page.tsx                        # writing index
    technical-debt/page.tsx         # the article — native TSX, embeds <TechDebtSim/>
components/
  tech-debt-sim.tsx                 # the interactive technical-debt simulation
  site-header.tsx / site-footer.tsx
  theme-provider.tsx / theme-toggle.tsx
  article-card.tsx
  geometry.tsx                      # subtle eight-pointed-star (khatam) motif
lib/
  site.ts                           # site metadata + nav
  articles.ts                       # article registry + date helpers
```

## Adding an article

1. Register it in [`lib/articles.ts`](lib/articles.ts) (slug, title, description, date, tags).
2. Create `app/writing/<slug>/page.tsx` — a native React component. Copy the
   technical-debt article as a template: export `metadata`, render the header from the
   registry, and write the body as JSX inside a `<div className="prose">` wrapper
   (the `.prose` styles in `app/globals.css` handle typography).
3. Embed any interactive component by importing it directly into the page.
