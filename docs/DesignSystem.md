# Design System

ConstructOS uses a strict design token system defined in `frontend/tailwind.config.js` and `frontend/src/index.css`. All components must use these tokens — no raw pixel values, no default Tailwind scales, no arbitrary hex colors.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0B1220` | Page background |
| `surface` | `#111827` | Card/panel backgrounds |
| `elevated` | `#1A2438` | Input fields, hover states |
| `primary` | `#356DFF` | Primary actions, links, active states |
| `primary-hover` | `#2554CC` | Primary button hover |
| `success` | `#22C55E` | Positive states, low risk |
| `warning` | `#FACC15` | Caution states, medium risk |
| `danger` | `#EF4444` | Errors, critical risk |
| `info` | `#3B82F6` | Informational states |
| `text-main` | `#F9FAFB` | Primary text |
| `text-muted` | `#9CA3AF` | Secondary text |
| `text-dim` | `#8B95A5` | Placeholder, tertiary text |
| `border-main` | `#1F2937` | Borders, dividers |

## Typography

The type scale has 11 levels. Use semantic names, never default Tailwind sizes (`text-sm`, `text-base`, `text-lg`, etc.).

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-display-lg` | 56px | 700 | 1.05 | Hero numbers, major KPIs |
| `text-display` | 44px | 700 | 1.1 | Dashboard hero |
| `text-h1` | 36px | 600 | 1.2 | Page titles |
| `text-h2` | 30px | 600 | 1.3 | Section headings |
| `text-h3` | 24px | 600 | 1.4 | Subsection headings |
| `text-title` | 20px | 500 | 1.5 | Card titles, important labels |
| `text-body-lg` | 16px | 500 | 1.5 | Emphasized body text |
| `text-body` | 16px | 400 | 1.5 | Default body text |
| `text-small` | 14px | 400 | 1.5 | Secondary content, table cells |
| `text-caption` | 12px | 400 | 1.5 | Labels, metadata, timestamps |
| `text-micro` | 10px | 500 | 1.5 | Badges, tiny labels |

**Font family**: Inter (with system-ui fallback).

## Spacing

The spacing scale uses a strict 4px base grid. Only these values are valid:

| Token | Value |
|-------|-------|
| `1` | 4px |
| `2` | 8px |
| `3` | 12px |
| `4` | 16px |
| `6` | 24px |
| `8` | 32px |
| `12` | 48px |
| `16` | 64px |

Non-token values like `p-2.5`, `gap-1.5`, `mt-0.5` are prohibited. Use the nearest token value.

## Border Radius

Use semantic aliases wherever possible:

| Alias | Value | Usage |
|-------|-------|-------|
| `rounded-btn` | 6px | Buttons, small interactive elements |
| `rounded-input` | 8px | Form inputs |
| `rounded-card` | 12px | Cards, panels |
| `rounded-dialog` | 16px | Dialogs, drawers, modals |
| `rounded-badge` | 999px | Pills, badges, tags |

Raw values (`rounded-6`, `rounded-8`, `rounded-12`, `rounded-16`) are available but semantic aliases are preferred. Never use `rounded-lg`, `rounded-xl`, or `rounded-2xl` (Tailwind defaults).

## Shadows

Four elevation levels, from flat to floating:

| Token | Visual | Usage |
|-------|--------|-------|
| `shadow-surface` | Subtle (1px offset) | Default card state |
| `shadow-raised` | Medium (4px offset) | Hovered cards, dropdowns |
| `shadow-floating` | High (12px offset) | Drawers, popovers |
| `shadow-overlay` | Maximum (24px offset) | Dialogs, modals |

**Card hover pattern**: Use the `.card-interactive` CSS class instead of `hover:-translate-y-*`. It applies `shadow-raised` on hover and `shadow-surface` on active for a natural elevation change.

## Animation

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `duration-fast` | 150ms | Button press, toggle |
| `duration-normal` | 250ms | Page transitions, expand/collapse |
| `duration-slow` | 350ms | Drawer open, dialog appear |

Never use raw durations like `duration-200`, `duration-300`, `duration-500`.

### Easing

| Token | Curve | Usage |
|-------|-------|-------|
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entering elements |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exiting elements |
| `ease-panel` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Panels, drawers |

### Built-in Animations

| Class | Keyframes | Duration |
|-------|-----------|----------|
| `animate-fade-in` | opacity 0→1, translateY 8px→0 | 250ms |
| `animate-scale-in` | opacity 0→1, scale 0.98→1 | 250ms |
| `animate-slide-in-right` | translateX 100%→0 | 350ms |
| `animate-toast-in` | translateX 100%→0 | 350ms |
| `animate-shimmer` | background position -200%→200% | 2s infinite |

### Reduced Motion

All animations respect `prefers-reduced-motion: reduce`. When enabled, durations collapse to 0.01ms and iteration counts become 1.

## Component Classes

Defined in `index.css` `@layer components`:

| Class | Purpose |
|-------|---------|
| `.btn-primary` | Primary action button |
| `.btn-ghost` | Secondary/ghost button |
| `.form-input` | Text inputs, textareas |
| `.search-input` | Search field with expanding behavior |
| `.card-interactive` | Hoverable card with shadow elevation |
| `.panel` | Surface card wrapper (via `<Panel>` component) |
| `.drawer-panel` | Right-side drawer animation |
| `.dialog-backdrop` | Modal backdrop with blur |
| `.dialog-content` | Modal content scale-in |
| `.toast-enter` / `.toast-exit` | Toast notification animations |
| `.skeleton-shimmer` | Loading placeholder animation |
| `.page-enter` | Page transition fade-in |
| `.table-row` | Staggered table row entrance |

## Accessibility

- **Focus**: All interactive elements show a 2px `#356DFF` outline on `:focus-visible` (WCAG AA).
- **Screen readers**: `.sr-only` class for visually hidden labels. `aria-label` on all icon-only buttons.
- **Tables**: All `<th>` elements use `scope="col"`.
- **Progress**: `<ProgressBar>` uses `role="progressbar"` with `aria-valuenow`.
- **Drawers**: Focus trap + ESC close + `aria-modal`.
- **Select**: Keyboard navigation (Arrow keys, Enter, Escape) with `role="listbox"`.
- **Toasts**: `role="alert"` for screen reader announcements.