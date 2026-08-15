# Lunar Luxuries — frontend

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4, implementing
the Organic design system. Planning, scope and phasing live in the
[root README](../README.md) — this file covers only how to work in this package.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Or drive everything from the repo root (`npm run setup && npm run dev`), which
starts this and any sibling apps together. The scripts below all have root-level
equivalents — see the [root README §0](../README.md#0-running-it-locally).

| Script              | Does                                        |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Dev server on :3000                         |
| `npm run build`     | Production build                            |
| `npm run start`     | Serve the production build                  |
| `npm run lint`      | ESLint                                      |
| `npm run typecheck` | Regenerate route types, then `tsc --noEmit` |
| `npm run format`    | Prettier (sorts Tailwind classes)           |

## Layout

```
src/
  app/
    layout.tsx              Root layout — fonts, metadata, <html>/<body>
    globals.css             ← the design system. Read this first.
    not-found.tsx           404
    (user)/                 Customer routes: nav + footer shell
    (admin)/admin/          Admin routes: sidebar shell, noindex
    dev/kitchen-sink/       Every primitive on one page (404s in production)
  components/
    layout/                 SiteHeader, SiteFooter, AdminSidebar
    ui/                     Button, Input, Card, StatusPill, WashedImage
  lib/
    site.ts                 Build-time store config, nav, categories
    utils.ts                cn(), formatPrice()
```

Route groups (`(user)`, `(admin)`) do not appear in URLs — they exist so
the two halves of the app can have different shells under one root layout.

## Working with the design system

**Never hard-code a hex, font or px value outside `globals.css`.** If you need a
value that isn't tokenized, add the token first. Tokens live in the `@theme`
block and generate utilities automatically:

| Token namespace | Example tokens                                     | Generated utilities                       |
| --------------- | -------------------------------------------------- | ----------------------------------------- |
| `--color-*`     | `accent-600`, `sage-700`, `bg`, `surface`, `muted` | `bg-accent-600`, `text-muted`             |
| `--radius-*`    | `pill`, `card`, `panel`, `nav`                     | `rounded-pill`, `rounded-card`            |
| `--shadow-*`    | `card`, `panel`, `button`                          | `shadow-card`                             |
| `--spacing-*`   | `control`, `section-y`, `gutter`, `column`         | `h-control`, `py-section-y`, `gap-gutter` |
| `--text-*`      | `h1`, `h2`, `kicker`, `wordmark`                   | `text-h1` (line-height included)          |
| `--font-*`      | `display` (Caprasimo), `sans` (Figtree)            | `font-display`                            |

Custom utilities: `washed` (the photo treatment), `scrim` (hero overlay),
`kicker` (uppercase display label), `shell` (centered 1440px column + gutters).

Tailwind scans source as **plain text**, so `bg-accent-${step}` never generates.
Write class names out in full or map them explicitly.

Run `/dev/kitchen-sink` to review every primitive against the design.

## Accessibility decisions already baked in

These are the README §2 items, fixed once at the component level so they can't
regress:

1. **Primary button fills with `accent-600`, not `accent-500`.** The design's
   `#c67139` under a white label measures **3.61:1** and fails AA for normal
   text; `accent-600` is **4.90:1** and reads as the same terracotta. Body-size
   accent _text_ uses `accent-700` (5.72:1 on cream).
2. **The Shop menu is a disclosure, not a hover menu.** Click or Enter toggles,
   `aria-expanded` is set, Escape closes and restores focus, outside-click
   dismisses. The hover-only prototype was unusable on touch and by keyboard.
3. **Muted text is `0.78` alpha**, up from the design's `0.70`, which sat under
   4.5:1 at 12px on `surface`.
4. **Global `:focus-visible` ring** in `globals.css`. Do not add `outline-none`
   to a control — style the ring instead.
5. Storefront routes start with a **skip link**; admin nav marks the active item
   with `aria-current="page"`.

## Not yet wired

No database, auth, payments or data fetching — those arrive in Phase 1+ per the
root README. Every image is an intentional placeholder: `WashedImage` renders a
striped fill when `src` is absent, so missing art is visible rather than silent
(root README §7 tracks the blocking asset list).

**Responsive behaviour is undesigned** (root README §10, open question 2). The
shells use sensible breakpoints, but they are a developer's guess, not comps.
