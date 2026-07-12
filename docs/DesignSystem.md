# Design System

## Typography

**Primary font:** Geist (loaded via CDN in `index.html`) — a modern, precise grotesk
chosen for its association with trust and engineering rigor (Vercel's font, widely used
across developer/fintech tooling). Falls back to `system-ui` if the CDN is unavailable.

**Numeral font:** Geist Mono — used specifically for financial figures (KPI values,
table amounts, transaction hashes). Distinct monospaced numerals are a deliberate signal
of precision, matching the pattern used by Stripe, Mercury, and similar financial products.
Applied via the `.metric-value` component class (combines `font-mono`, `tabular-nums`,
and tight letter-spacing) — use this class alongside a size token whenever displaying a
monetary or numeric figure that should read as authoritative.

### Type Scale

| Token | Size | Weight | Use |
|---|---|---|---|
| `display-lg` | 48px | 700 | Rare — largest hero numbers only |
| `display` | 44px | 700 | Page-level hero figures |
| `display-md` | 24px | 700 | Secondary display figures |
| `metric-lg` | 40px | 700 | **The headline number in a KPI card.** Out-ranks page titles — this is what an executive should see first. |
| `metric` | 30px | 700 | Secondary metric figures (smaller KPI cards, inline stats) |
| `page-title` | 28px | 700 | Page headers (TopBar title) |
| `h1` | 22px | 600 | Section headers |
| `h2` | 28px | 600 | Rare — large section breaks |
| `h3` / `title` | 18px | 500 | Card/panel titles |
| `body-lg` | 16px | 400 | Emphasized body text |
| `body` | 14px | 400 | Default body text |
| `small` | 12px | 500 | Secondary text, table cells, form labels |
| `label` | 11px | 600, uppercase, tracked | **Overline captions only** — KPI card titles, table column headers. Never body content. |
| `caption` | 12px | 700 | Badges, small emphasized tags |
| `micro` | 11px | 500 | Rare — smallest supporting text |

**Fixed in this pass:** `label` was previously 18px/600 — nearly as large as a metric
value itself, which inverted the intended hierarchy everywhere it was used (`MetricCard`'s
KPI title, `Table`'s column headers). It's now correctly small, quiet, and uppercase — the
overline it was always meant to be. This is a token-level fix; no component code needed to
change for it to take effect everywhere the token is already used.

### Hierarchy Principle

The single most important number on any given screen (a KPI, a project budget, a
settlement amount) should be the loudest thing on that screen — louder than the page
title. That's why `metric-lg` (40px) exceeds `page-title` (28px). A judge or executive
glancing at the Dashboard should see the wallet balance before they consciously read
any label around it.

## Spacing System

### Cards

- **Padding:** `24px` (`p-6`) — consistent across `MetricCard`, `Panel`, and all card-style containers
- **Grid gap:** `24px` (`gap-6`) — the standard rhythm between cards in a KPI row or card grid
- Named tokens (`card-padding`, `card-gap`) are available in `tailwind.config.js` for
  documentation clarity, aliasing the same `24px` value already in consistent use

### Tables

- **Cell padding:** `16px` vertical (`py-4`), horizontal inherited from parent — consistent
  across all `Table.tsx` usages
- **Header:** `pb-3 pt-1`, uppercase, tracked, now correctly small (`text-label`, 11px)
- Named tokens (`table-cell-y`, `table-cell-x`) available for the same reason as above

### Section Rhythm

- **Between major page sections:** `32px` (`gap-8` / `space-y-8`) — named as `section-gap`

These tokens formalize spacing values that were already in consistent use across the
codebase — they don't change existing layout, they make the existing rhythm
self-documenting so future components can reference `theme('spacing.card-padding')`
instead of remembering "24px" by convention.

## Applying This Elsewhere

The `label` token fix cascades automatically to every existing usage — no other files
need to change for that specific fix. For any *new* component displaying a headline
metric (a new KPI card, a settlement total, a treasury figure), use:

```tsx
<p className="text-metric-lg metric-value text-text-main">{value}</p>
```

For overline captions (section eyebrows, table headers, KPI titles):

```tsx
<p className="text-label text-text-dim uppercase">{label}</p>
```
