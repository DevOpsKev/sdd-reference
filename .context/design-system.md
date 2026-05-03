# Design System

This document is normative for all UI work. Tokens, fonts, grid, and the "forbidden" lists are binding. Agents must not introduce values, families, or patterns not defined here. Specs may override individual rules but must do so explicitly.

## Design direction

The product is a serious European strategic intelligence tool rendered in **modern Swiss International Style**. Reference points: Müller-Brockmann grids, Hofmann's posters, the Univers/Helvetica neo-grotesque tradition, and contemporary applications by Linear, Stripe, Vercel, and Werkplaats Typografie.

The aesthetic constants are:

- Strict grid; nothing floats free of it.
- One sans-serif family used masterfully across weights and sizes.
- Asymmetric balance; centered compositions are exceptional.
- Pure white surface, near-black ink. Color is information, not decoration.
- Whitespace is a design element, not absence.
- Rules and dividers as primary structural cues; shadows are exceptional.
- Tracked uppercase for labels and metadata.
- Numerals treated as design elements (tabular figures throughout).

## Principles (binding)

1. **Grid first.** Every element aligns to the 12-column grid and the 4px baseline. If content doesn't fit the grid, the grid is the question — not the alignment.
2. **Type does the work.** Hierarchy is established through scale, weight, and letter-spacing. Not boxes, not color, not decoration.
3. **One accent per view.** A view uses at most one non-semantic accent color. Ring colors are semantic and exempt.
4. **Rules over shadows.** Use 1px borders for separation. Shadow is reserved for floating elements, one level only.
5. **Black on white is the default.** If a color isn't communicating ring, status, or interactive state, it shouldn't be there.
6. **Asymmetric balance.** Center alignment is reserved for the radar canvas itself, modal overlays, and empty states.

## Color

All color values are tokens. Do not introduce new values without extending this section.

### Surface

| Token | Hex | Use |
|---|---|---|
| `--surface` | `#FFFFFF` | Default page background |
| `--surface-raised` | `#FAFAF8` | Cards, panels (use sparingly) |
| `--surface-sunken` | `#F4F4F2` | Wells, code blocks, inset regions |

### Ink

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0A0A0A` | Headings, primary text |
| `--ink-secondary` | `#3A3A3A` | Body text, secondary content |
| `--ink-muted` | `#6B6B6B` | Metadata, captions, eyebrows |
| `--ink-faint` | `#9A9A9A` | Disabled, tertiary captions |
| `--ink-inverse` | `#FFFFFF` | Text on dark or saturated backgrounds |

### Rules

| Token | Hex | Use |
|---|---|---|
| `--rule` | `#E5E5E2` | Default 1px dividers, table rules |
| `--rule-strong` | `#0A0A0A` | Heavy structural rules, section dividers |
| `--rule-faint` | `#F0F0ED` | Subtle separation |

### Brand accent (single)

| Token | Hex | Use |
|---|---|---|
| `--accent` | `#1B3A6B` | Brand accent, interactive primary, focus rings |
| `--accent-hover` | `#0F2848` | Hover state for accent surfaces |

### Ring semantics (used only for ring placement)

| Ring | Fill | Edge/Text | Notes |
|---|---|---|---|
| Adopt | `#1F5F4A` | `#143F30` | Settled green; confidence without celebration |
| Trial | `#1B3A6B` | `#0F2848` | Same hue as `--accent`; intentional reuse |
| Assess | `#A66E12` | `#6B470A` | Cautionary ochre; not alarmed |
| Divest | `#7A2419` | `#4D160F` | Action signal; restrained, not panic |

**Ring color rules:**
- Used only on radar dots, ring legends, ring filter chips, and ring badges in entry detail.
- Always paired with a non-color cue (icon, position, label, or shape).
- Never used as background for non-ring UI.
- Never lightened, brightened, or saturated for emphasis.

### Forbidden colors

- Pure red `#FF0000`, pure green `#00FF00`, any saturated primary.
- Decorative purples, teals, pinks, "AI gradients."
- Any color not defined above.

## Typography

One sans-serif family for all UI: **Inter**. One monospace: **JetBrains Mono**. Both from Google Fonts.

> Note: this is a deliberate reversal of the previous draft's ban on Inter. That ban applied to a warm editorial aesthetic; for modern Swiss International Style, Inter is the correct neo-grotesque choice. IBM Plex is no longer used.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
>
```

### Stacks and feature settings

```css
--font-sans: "Inter", system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace;

body {
  font-family: var(--font-sans);
  font-feature-settings: "cv11", "ss01", "ss03", "tnum";
  font-optical-sizing: auto;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

The `tnum` (tabular figures) setting is mandatory across the product — all numerals must align in tables, version strings, dates, and metrics.

### Type scale

| Token | Size | Line | Weight | Letter-spacing | Use |
|---|---|---|---|---|---|
| `--type-display` | 48px | 52px | 600 | -0.03em | Page title; one per page |
| `--type-h1` | 32px | 40px | 600 | -0.02em | Section headings |
| `--type-h2` | 22px | 28px | 600 | -0.015em | Subsection, entry titles |
| `--type-h3` | 16px | 24px | 600 | -0.005em | Minor headings, panel titles |
| `--type-body-lg` | 17px | 26px | 400 | 0 | Lede paragraphs, entry rationale |
| `--type-body` | 15px | 24px | 400 | 0 | Default body |
| `--type-small` | 13px | 20px | 400 | 0 | Captions, table cells |
| `--type-micro` | 11px | 16px | 500 | 0.08em | All-caps eyebrows, labels |
| `--type-mono` | 13px | 20px | 400 | 0 | Identifiers, dates, versions |
| `--type-mono-small` | 11px | 16px | 400 | 0 | Inline mono in dense tables |

### Typographic conventions

- **Eyebrow labels**: `--type-micro`, uppercase, `--ink-muted`, tracked `0.08em`. Example: `QUADRANT · DATA & IDENTITY`.
- **Numerals**: tabular figures via `font-feature-settings: "tnum"`. Mandatory for ring counts, version numbers, dates, and any column of numbers.
- **Quotes**: typographic quotes only (`" " ' '`). Never straight quotes in prose.
- **Dashes**: em `—` for parenthetical breaks, en `–` for ranges, hyphen `-` for compounds.
- **Ellipsis**: `…` (single character), never three periods.
- **Sentence case** for all headings except `--type-micro` eyebrows.

### Forbidden

- Roboto, Helvetica, Arial, Calibri, Open Sans, Lato, system-ui in production.
- Serif typefaces anywhere in the product.
- Mixed weights within a sentence.
- More than two weights in any single component (e.g., a card uses 400 and 600 only).
- Mono for prose.
- Italics for emphasis (use weight or color instead).
- Underlines except on links in body prose.

## Grid

12-column fluid grid. 4px baseline. All vertical and horizontal measurements derive from these two systems.

### Columns

| Breakpoint | Columns | Gutter | Margin | Max content |
|---|---|---|---|---|
| `sm` (≥640px) | 6 | 16px | 24px | — |
| `md` (≥1024px) | 12 | 24px | 32px | — |
| `lg` (≥1280px) | 12 | 24px | 48px | 1200px |
| `xl` (≥1536px) | 12 | 32px | auto | 1440px |

### Baseline

All `line-height`, `padding`, and `margin` values are multiples of 4. Components must not introduce sub-pixel offsets.

### Spacing tokens

```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;
--space-10: 128px;
```

### Vertical rhythm

- H1 to following content: `--space-5` (24px).
- Between major sections: `--space-8` (64px).
- Between paragraphs: `--space-4` (16px).
- Between list items: `--space-2` (8px).
- Between a card and its surrounding content: `--space-5` minimum.

## Layout

### Asymmetric balance

The default page composition is asymmetric. Navigation rail is left-aligned at fixed width (240px on `lg`+); primary content offsets right. Tension comes from grid placement, not center alignment. Centered compositions are reserved for:

- The radar canvas itself.
- Modal overlays and dialogs.
- Empty states and 404s.

### Density

- **Marketing/landing surfaces**: low density, generous whitespace, large type.
- **Radar canvas**: medium density; the radar dominates, surrounding chrome is minimal.
- **Tables and detail panes**: high density; tight padding (`--space-2` to `--space-3`), `--type-small` body.

### Border radius

| Token | Value | Use |
|---|---|---|
| `--radius-0` | 0 | Default — most UI is square |
| `--radius-1` | 2px | Inputs, small buttons |
| `--radius-2` | 4px | Cards, modals, popovers |

No pills. No fully rounded buttons. No `border-radius: 9999px` anywhere.

### Shadows

One level only. No shadow on cards. No shadow on hover.

```css
--shadow-overlay: 0 8px 24px rgba(10, 10, 10, 0.08), 0 1px 2px rgba(10, 10, 10, 0.04);
```

Reserved for: dropdowns, popovers, modal overlays. Nothing else.

## Components

### Buttons

- **Primary**: `--accent` background, `--ink-inverse` text, weight 500, `--type-small`, padding `8px 16px`, `--radius-1`.
- **Secondary**: transparent background, 1px solid `--rule-strong`, `--ink` text.
- **Tertiary**: transparent, `--ink` text, no border. Inline actions only.
- **Hover**: primary shifts to `--accent-hover`; secondary gains `--surface-sunken` background.
- **Focus**: 2px outline `--accent`, 2px offset.
- **Disabled**: `--ink-faint` text, `--surface-sunken` background, no hover effect.
- **Heights**: 40px large, 32px standard, 24px compact.

### Inputs

- 1px border `--rule-strong`, `--radius-1`, padding `8px 12px`, `--type-body`.
- Focus: 2px outline `--accent` with 1px offset; border becomes `--accent`.
- Label: `--type-micro` eyebrow above input, `--ink-muted`.
- Helper text: `--type-small`, `--ink-muted`, `--space-1` below input.
- Error: 2px outline `#7A2419`, error text `--type-small` in `#7A2419`.

### Tables

- 1px `--rule` between rows. No vertical rules.
- Header row: `--type-micro` uppercase, `--ink-muted`, 1px `--rule-strong` bottom border.
- Cell padding: `12px 16px` standard, `8px 12px` compact.
- Tabular numerals throughout.
- No striping. No hover unless rows are interactive.

### Cards

- 1px border `--rule`, `--radius-2`, padding `--space-5` (24px).
- No shadow.
- No background tint unless on `--surface-sunken` context.

### Radar entry

- Dot fill: ring fill color.
- Dot border: ring edge color, 1.5px.
- Label inside detail card: weight 500, `--ink-inverse` for Adopt/Trial/Divest, `--ink` for Assess.
- Version and date in mono with tabular figures.

### Filter chips

- `--type-small`, weight 500, padding `6px 12px`, `--radius-1`.
- Default: 1px border `--rule-strong`, `--ink` text.
- Active: `--ink` background, `--ink-inverse` text.
- Ring filter chips use ring fill colors when active.

## Motion

All durations and curves are explicit. No "magic" timings.

| Token | Duration | Curve | Use |
|---|---|---|---|
| `--motion-instant` | 80ms | `cubic-bezier(0.2, 0, 0, 1)` | Hover, focus, button press |
| `--motion-quick` | 160ms | `cubic-bezier(0.2, 0, 0, 1)` | Filter chips, dropdowns, tooltips |
| `--motion-default` | 240ms | `cubic-bezier(0.2, 0, 0, 1)` | Panel transitions, ring filter |
| `--motion-considered` | 400ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Inter-release entry movement |

**Allowed properties for transition:** `opacity`, `transform`, `background-color`, `border-color`. Nothing else.

**Forbidden:**

- Bounce, spring, elastic curves.
- `cubic-bezier` values not derived from the tokens above.
- Parallax, scroll-jacking, scroll-triggered animation beyond simple fade-in.
- Loading spinners with personality. Use a 2px progress rule along the affected region's top edge.
- Transitions on `font-size`, `width`, `height`, or layout-affecting properties.

`prefers-reduced-motion: reduce` disables all transitions except essential state changes (focus rings, validation feedback).

## Content voice

Concise, direct, defensible. Editorial restraint. Opinionated but not inflammatory.

| Avoid | Prefer |
|---|---|
| "Vendor lock-in nightmare" | "High exit cost due to proprietary managed services" |
| "American spying risk" | "Subject to US extraterritorial data access under the CLOUD Act" |
| "Not really European" | "Limited operator presence in the EU" |
| "Best in class" | "Currently the strongest sovereignty profile in this category" |
| "Game-changing" | (omit) |
| "Cutting-edge" | (omit) |
| "Trusted by leaders" | (omit) |

Style:

- Sentence case for headings (except eyebrows).
- Oxford comma.
- British English.
- Dates: `2026-05-03` in metadata; `3 May 2026` in prose.
- Versions: `v0.4.1` in mono.

## Accessibility

Binding requirements.

- WCAG 2.2 AA contrast minimum across all text and non-text UI.
- `--ink-muted` requires `--type-body` size or larger.
- Ring fills meet 4.5:1 against `--ink-inverse` for any text overlaid on them.
- All color-encoded meaning (rings, status, validation) must also be encoded in icon, position, label, or shape.
- Focus visible at all times during keyboard navigation: 2px outline, 2px offset, color `--accent`.
- Touch targets ≥44×44px on touch devices, ≥24×24px on pointer devices.
- `prefers-reduced-motion: reduce` honored.
- `prefers-color-scheme: dark` is **not** supported in v1. Document this to users.
- Skip-to-content link on every page.
- All data visualizations expose a tabular alternative reachable via a single keyboard interaction.

## Anti-patterns (do not produce)

These are explicit prohibitions. An agent producing any of these is producing wrong output.

- Glassmorphic panels (any `backdrop-filter: blur`).
- Gradient backgrounds, gradient text, gradient borders.
- Drop shadows on cards, buttons, inputs, or hover states.
- Pill-shaped buttons or chips with `border-radius: 9999px`.
- Emoji in headings, buttons, navigation, or table headers.
- Animated illustrations, decorative SVG waves, or background blobs.
- Hero sections with centered oversized type and a CTA pair.
- Full-width images bleeding to the viewport edge.
- Decorative icons (icons must communicate function).
- Sidebar navigation with collapsed icon-only mode (the rail is always labeled).
- Marketing-style testimonials or "trusted by" logo strips.
- Three-column feature grids with circular icon-on-tinted-background cards.
- Any "AI shimmer" effect on text or borders.
- Centered single-column layouts longer than the radar canvas itself.
