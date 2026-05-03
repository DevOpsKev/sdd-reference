# Design System

This document is normative for all UI work. Agents should treat tokens, fonts, and the "do not" lists as binding unless a spec explicitly overrides them.

## Design direction

The product should feel like a serious European strategic intelligence tool: sober, editorial, precise, and quietly opinionated. The reference points are policy briefings, standards body publications, and analyst terminals — not SaaS marketing sites, cyberpunk dashboards, or compliance tools.

**Avoid:** startup gloss, gradients-as-decoration, glassmorphism, neon accents, mascots, emoji in UI chrome, alarmist red-alert aesthetics, generic dashboard "dark mode with purple highlights."

## Visual tone

Dense but legible. Strong hierarchy, disciplined spacing, generous whitespace around the radar itself, tighter density in supporting tables and detail panes. Borders and rules over drop shadows. Flat over skeuomorphic. Editorial restraint over visual excitement.

## Color

All colors are defined as tokens. Do not introduce new colors without extending this section.

### Foundation

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F4F1EA` | Primary background, warm off-white |
| `--paper-raised` | `#FAF8F3` | Cards, panels, raised surfaces |
| `--ink` | `#14181F` | Primary text, carbon near-black |
| `--ink-muted` | `#4A5260` | Secondary text, metadata |
| `--ink-faint` | `#8A909B` | Tertiary text, captions, disabled |
| `--rule` | `#D9D4C7` | Borders, dividers, table rules |
| `--rule-strong` | `#A8A294` | Emphasized borders |

### Brand

| Token | Hex | Use |
|---|---|---|
| `--navy` | `#0F1B2D` | Primary brand, headers, key UI structure |
| `--navy-muted` | `#1F3252` | Secondary brand, hover states |
| `--eu-blue` | `#1B3A6B` | Accent for European/standards emphasis |

### Ring semantic colors

These are the only colors used to encode ring placement. Each pairs a fill with a darker text/border variant for accessibility.

| Ring | Fill | Edge/Text | Rationale |
|---|---|---|---|
| Adopt | `#2D6A4F` | `#1B4332` | Settled blue-green; reads as endorsed without celebration |
| Trial | `#2C5282` | `#1A365D` | Measured navy-blue; serious, not enthusiastic |
| Assess | `#B8801E` | `#7C5614` | Ochre amber; cautionary without alarm |
| Divest | `#8B2C20` | `#5C1D15` | Restrained rust; signals action without panic |

**Rules:**
- Ring color must always be paired with a non-color cue (icon, label, or shape) per accessibility.
- Do not use ring colors for any non-ring purpose.
- Do not saturate or brighten these values for "emphasis." If something needs more weight, use type, position, or rules.

### Status (non-ring)

| Token | Hex | Use |
|---|---|---|
| `--info` | `#1B3A6B` | Informational notes |
| `--warn` | `#B8801E` | Warnings, deprecation notices |
| `--error` | `#8B2C20` | Errors, validation failures |

## Typography

All fonts are loaded from Google Fonts. The product uses the **IBM Plex** family across all three roles for visual coherence.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
  rel="stylesheet"
>
```

| Role | Family | Weights | Use |
|---|---|---|---|
| Body | IBM Plex Sans | 400, 500, 600 | All UI text, paragraphs, labels, controls |
| Display | IBM Plex Serif | 600, 700 | Headings, radar title, entry names in detail view |
| Mono | IBM Plex Mono | 400, 500 | Identifiers, dates, version tags, technical references |

### Type scale

| Token | Size / Line | Use |
|---|---|---|
| `--type-display` | 40px / 48px | Page title, radar title |
| `--type-h1` | 28px / 36px | Section headings |
| `--type-h2` | 20px / 28px | Subsection headings, entry titles |
| `--type-h3` | 16px / 24px | Minor headings, panel titles |
| `--type-body` | 15px / 24px | Default body |
| `--type-small` | 13px / 20px | Metadata, captions, table cells |
| `--type-mono` | 13px / 20px | Identifiers, dates |

**Rules:**
- Headings use IBM Plex Serif. Body uses IBM Plex Sans. Do not invert this.
- Do not use Inter, Roboto, Arial, Helvetica, or system-ui anywhere.
- Do not use IBM Plex Mono for prose, ever. Mono is reserved for identifiers and technical metadata.
- Maximum two weights per visual block.

## Layout

- 8px spacing grid. Tokens: `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-6` (24px), `--space-8` (32px), `--space-12` (48px), `--space-16` (64px).
- Page max-width: 1440px. Radar canvas is the center of gravity; detail panes and tables flank or stack below.
- Use rules (1px borders in `--rule`) over shadows. One shadow level only, reserved for floating elements (`0 4px 16px rgba(20, 24, 31, 0.08)`).
- Border radius: 2px for inputs and small UI, 4px for cards. No pill shapes, no fully rounded buttons.

## Motion

- Default transition: `150ms ease-out` for hover, focus, and small state changes.
- Filter and ring transitions: `240ms ease-out`.
- Inter-release entry movement (when comparing releases): `400ms ease-in-out`.
- No bounce, no spring, no parallax, no scroll-triggered animation. No loading spinners with character; use a 1px progress rule.

## Content voice

Concise, direct, defensible. Opinionated but not inflammatory.

- Prefer "high exit cost due to proprietary managed services" over "vendor lock-in nightmare."
- Prefer "subject to US extraterritorial data access under the CLOUD Act" over "American spying risk."
- Prefer "limited operator presence in the EU" over "not really European."
- Use specific, verifiable claims. Date them. Link to primary sources where possible.

## Accessibility

- WCAG AA contrast minimum across all text and UI. Ring fills meet 4.5:1 against `--paper` for any text overlaid on them.
- Ring placement, status, and any other meaning encoded in color must also be encoded in a second channel (icon, label, position, or shape).
- Full keyboard navigation; visible focus rings using a 2px `--navy` outline with 2px offset.
- Respect `prefers-reduced-motion`: disable all non-essential transitions.
- Minimum touch target 44x44px on interactive elements.
