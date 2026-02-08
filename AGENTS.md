# Guide for Cursor Agents

This doc helps agents work effectively on this repo. See also the rules in `.cursor/rules/` (they always apply).

## What this repo is

- **Eleventy** static site + **Obsidian Digital Garden** plugin. Notes are written in Obsidian and published into `src/site/notes/`. The plugin manages that content; the repo provides the theme, layouts, and custom components.
- **Never edit** `src/site/notes/`, `src/site/styles/_theme.*.css`, or plugin-critical keys in `.env`. See rule **do-not-edit-plugin-managed**.

## Conventions

- **Functional programming and typing**: Prefer pure functions, immutability, no `any`/`unknown`. See rule **functional-and-typed**.
- **User-facing copy** that belongs in notes (e.g. explainers for the tech-debt sim) lives in a **reference file** in the repo (e.g. `tech-debt-simulator-note-copy.md`). The user copies from that into Obsidian; we do not edit the note files in `src/site/notes/`.

## Adding an embeddable widget (e.g. a sim that appears only where the user embeds it)

1. Create the widget: `src/site/_includes/snippets/<widget-name>.njk` (HTML + optional `<script>`).
2. In `.eleventy.js`, in the markdown-it **fence** handler (where `tech-debt-sim` is handled), add a branch: if `token.info.trim() === "<widget-name>"`, return `<div data-dg-embed="<widget-name>"></div>`.
3. In `.eleventy.js`, add an **Eleventy transform** (e.g. after `embed-tech-debt-sim`): on HTML containing `data-dg-embed="<widget-name>"`, parse the HTML, find all such elements, read `snippets/<widget-name>.njk`, set `element.innerHTML = snippetHtml`, remove the attribute.
4. User embeds in a note with ` ```<widget-name>``` ` in Obsidian.

Use **classes** (not IDs) for elements inside the snippet if the same widget can appear more than once on a page.

## Adding a slot component (on every note or every page)

1. Create a file under `src/site/_includes/components/user/<namespace>/<slot>/<name>.njk`, e.g. `common/afterContent/my-component.njk`.
2. The dynamics system (`.eleventy.js` + `_data/dynamics.js`) already scans that tree; no config change needed. The layout includes `dynamics.common.afterContent` (and other slots) in `note.njk` / `index.njk`.

## Git when Obsidian has pushed

If the user pushed from Obsidian and you have local commits, history may have diverged. Run:

```bash
git pull --rebase origin main
```

Then the user (or you, if credentials work) can `git push origin main`. If push fails with "could not read Username", the user must push from their terminal or run `gh auth login` and complete the browser flow so subsequent pushes can use the GitHub CLI.

## Key paths

| Purpose | Path |
|--------|------|
| Note content (read-only for agents) | `src/site/notes/` |
| Slot components | `src/site/_includes/components/user/<namespace>/<slot>/` |
| Embeddable snippets | `src/site/_includes/snippets/` |
| Fence + transform for embeds | `.eleventy.js` |
| Custom styles | `src/site/styles/custom-style.scss`, `src/site/styles/user/` |
| Layouts | `src/site/_includes/layouts/` |
