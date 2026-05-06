# Design System

## Principle

The unit's design language is **shabby outside, serious inside**.

The page should look like documents on a working desk in an industrial unit — paper, ink, packing tape, rubber stamps, the occasional handwritten note. The information underneath should be expert: real format codes, real condition vocabulary, real pressing-plant references, accurate prices, current stock counts.

The tension between the two is the whole aesthetic. If a page reads as too clean, it has lost the unit. If it reads as too rough, it has lost the expertise. We aim to look like a working document, not a designed website.

## Paper, ink, accent

We think of the page as paper on a desk. The paper is warm photocopier off-white, the ink is dark warm not-quite-black, and one of two accents — packing-tape orange or customs-stamp red — does work that the ink can't.

| Token             | Value                          | Use                                                  |
| ----------------- | ------------------------------ | ---------------------------------------------------- |
| `--paper`         | `#ece6d4`                      | Default page background. Photocopier-paper off-white.|
| `--paper-dark`    | `#d8d0b8`                      | Aged-paper variant for ageing gradient lower right.  |
| `--paper-stain`   | `#c8bfa3`                      | Subtle staining on stockroom-card edges, footer.     |
| `--ink`           | `#1a1410`                      | Primary text, primary rules, primary borders.        |
| `--ink-soft`      | `#4a4135`                      | Secondary text, blurbs, body copy in cards.          |
| `--ink-faded`     | `#6a604f`                      | Tertiary text, dashed rule colour, captions.         |
| `--orange`        | `#c95028`                      | Packing-tape accent. Counts, queue states, stamps.   |
| `--orange-bright` | `#d8612e`                      | Hover/active states only. Restrained.                |
| `--red`           | `#a83228`                      | Customs-stamp accent. NO RETURNS, HELD, RESTRICTED.  |
| `--tape`          | `rgba(232, 210, 138, 0.65)`    | Translucent yellow for masking-tape strips.          |
| `--sharpie`       | `#1d2e4a`                      | Dark blue Sharpie/biro for handwritten annotations.  |
| `--void`          | `#0c0a08`                      | Black for the Under the Counter section only.        |
| `--bone`          | `#f0e8d2`                      | Bone-on-void text inside Under the Counter.          |
| `--hairline`      | `rgba(26, 20, 16, 0.18)`       | Default 1px hairline (faint dotted/dashed).          |

A paper-grain noise overlay sits on the body background at low opacity. A faint coffee-ring stain top-right and a corner stain bottom-left are present at very low saturation. These are not decoration — they are the *paper*. Without them the design language reads as flat-and-designed rather than printed-and-photocopied.

Ratio guidance. Ink does most of the work. Orange appears as accent on roughly one in eight elements. Red is rare — reserved for stamps and statuses where the customs reading is correct. Tape and Sharpie are used **once or twice per page**, not as patterns.

## Type

The unit uses five typefaces, each with one job. Voices do not blur into each other. If a piece of text is doing more than one job, it is using more than one voice; if it is doing only one job, it is using only one voice.

| Voice          | Family            | Role                                                                              |
| -------------- | ----------------- | --------------------------------------------------------------------------------- |
| **Body**       | Special Elite     | The typewriter. Primary face for almost all reading text — copy, blurbs, notes.   |
| **Display**    | Anton             | Heavy condensed industrial. Section heads, the wordmark, shouted labels.          |
| **Stencil**    | Stardos Stencil   | Used only on stamps where the stencil reading is right (FRAGILE, NO RETURNS).     |
| **Hand**       | Permanent Marker  | Handwritten Sharpie/marker for genuine annotation moments. Sparingly.             |
| **Mono**       | JetBrains Mono    | Codes, prices, dates, tracking numbers, catalogue IDs, barcodes.                  |

All five are loaded from Google Fonts. Each has a tightly defined role; do not substitute, do not fall back to alternatives without updating this document.

Type scale (mobile-first, desktop overrides via `clamp()`):

| Token              | Value                              | Use                                              |
| ------------------ | ---------------------------------- | ------------------------------------------------ |
| `--type-wordmark`  | `clamp(2.5rem, 7vw, 5rem)`         | Masthead wordmark only.                          |
| `--type-section`   | `clamp(1.8rem, 3.5vw, 2.6rem)`     | Anton section heads (`<h2>`).                    |
| `--type-h3`        | `1.2rem`                           | Sub-section headings, card titles in stockroom.  |
| `--type-body`      | `1rem`                             | Default body, Special Elite.                     |
| `--type-small`     | `0.92rem`                          | Card body, secondary blurbs.                     |
| `--type-mono`      | `0.78rem`                          | JetBrains Mono default for codes/data.           |
| `--type-mono-sm`   | `0.7rem`                           | Meta-strip, status pills, captions.              |
| `--type-mono-xs`   | `0.62rem`                          | Smallest legible mono — column headers, labels.  |

Letter-spacing and case are part of the system, not decorative choices:

- Anton display is set in **uppercase** with `letter-spacing: 0.04em`.
- Mono labels are set in **uppercase** with `letter-spacing: 0.10em–0.18em` depending on context.
- Stencil stamps are set in **uppercase** with `letter-spacing: 0.15em`.
- Body Special Elite is set in **sentence case** with default tracking.
- Permanent Marker is set in **sentence case** with no tracking adjustment; rotation does the work.

Line-height. Body copy 1.5 to 1.6. Display heads 0.85 to 1.0. Mono labels 1.0. Tight display creates the "stamped" reading; loose body creates the "typed letter" reading. Both are needed.

## Spacing and rhythm

Base spacing unit is 8px (0.5rem). All vertical rhythm is a multiple. The horizontal gutter is the same on every page edge; the page is centred in a maximum width with that gutter on either side. Concrete values live in the token table below (and in `tokens.css`).

| Token              | Value                          | Use                                              |
| ------------------ | ------------------------------ | ------------------------------------------------ |
| `--gutter`         | `clamp(1rem, 3vw, 2.5rem)`     | Horizontal gutter on every page edge.            |
| `--page-max-width` | `1280px`                       | Maximum width of centred page content.           |

Sections are separated by 1px dashed rules in `--ink-faded`, except the section *immediately under* the masthead, which is separated by a 2px solid rule in `--ink`. This single-rule weighting is deliberate: the page reads as a stack of stapled documents, with the top one having a slightly heavier separator.

Inside a section, sub-blocks are separated by 1px solid rules at 12% ink opacity. Tables get dashed row separators, not solid. Cards get one outer 2px solid border in `--ink` and either dashed or dotted internal dividers depending on density.

Horizontal rhythm follows a 4-column logic on most layouts, collapsing to 2 columns at ~720px and 1 at ~480px. Specific component grids follow their own rules where they need to (the stockroom is `auto-fill, minmax(280px, 1fr)`; the dispatch sheet is a strict 4-cell grid).

## Idiomatic moves

The design language is built from a small set of idioms that show up across the site. Each is a *recipe*, not a freeform style. Use these; do not invent close-but-different variants.

### Stamps

Used to label, status, or warn. A stamp is an outlined rectangle with stencil-cap type inside, slightly rotated, in either ink, orange, or red.

```
display: inline-block;
padding: 0.35em 0.75em;
border: 2px solid <colour>;
color: <colour>;
font-family: 'Stardos Stencil', sans-serif;
font-weight: 700;
letter-spacing: 0.15em;
text-transform: uppercase;
transform: rotate(-3deg | 2deg | -1deg);
background: transparent;
```

Rotation must be small and **never random** — pick one of three values and stick to it within a row. Stamps that share a row should have alternating rotations. A stamp in `--ink` is neutral information ("EU + UK ONLY"), a stamp in `--orange` is operational ("FRAGILE · DO NOT BEND"), a stamp in `--red` is restrictive ("NO RETURNS · NO REFUNDS").

### Wordmark stamp

The wordmark itself is a stamp at scale. Anton type, all caps, inside a 4px outlined rectangle, rotated `-1.8deg`. A second outline at 2px ink with `opacity: 0.4` and `transform: translate(2px, 1.5px)` sits behind for double-print "ink-bleed" effect. Faint stippled dots at 35% opacity are scattered inside the rectangle to suggest worn ink.

This is the only place the double-stamp treatment is used. Do not apply it to other stamps.

### Tape

Translucent yellow rectangles representing masking tape. Used very sparingly — at most one or two pieces per page — to "fix" a piece of paper to the page (typically the Friday Note paper) or to reinforce a corner.

```
position: absolute;
background: var(--tape);
background-image: linear-gradient(
  90deg,
  transparent 0%,
  rgba(255,255,255,0.15) 50%,
  transparent 100%
);
box-shadow: 0 1px 2px rgba(0,0,0,0.1);
transform: rotate(-4deg | 3deg | -2deg);
```

A tape piece always overlaps the edge of whatever it is "taped to" — it cannot float in space. A tape piece is never used purely decoratively without being attached to something.

### Sharpie annotations

Genuine handwritten-looking marks: "3 left," a tick, a "SOLD" ribbon over a struck-through item. Permanent Marker face, in `--sharpie`, slight rotation. Used **at most three times per page**. More than three reads as gimmick rather than authentic.

```
font-family: 'Permanent Marker', cursive;
color: var(--sharpie);
transform: rotate(-3deg | -8deg | -12deg);
```

A Sharpie annotation must mean something — annotate a real state change ("3 LEFT" because count dropped, "SOLD" because the item sold this morning). Never use Sharpie purely for decoration or to "warm up" a page.

### Dashed and dotted rules

| Rule type           | Specification                                   | Use                                              |
| ------------------- | ----------------------------------------------- | ------------------------------------------------ |
| Primary section     | `2px solid var(--ink)`                          | Top of major sections, masthead.                 |
| Secondary section   | `1px dashed var(--ink-faded)`                   | Most section breaks.                             |
| Internal divider    | `1px dashed rgba(26, 20, 16, 0.30)`             | Inside cards, between rows in tables.            |
| Card border         | `2px solid var(--ink)`                          | Outer borders of dispatch and stock containers.  |
| Inner card divider  | `1px dotted var(--ink-faded)`                   | Inside stock cards, between metadata rows.       |

Solid heavy rules say "this is a printed form's frame." Dashed rules say "this is one section ending and another beginning." Dotted rules say "this is a quiet division inside a cell." Pick the right one — agents that reach for `1px solid` everywhere flatten the system.

### Status indicators

Status text is preceded by a small coloured marker matching the status colour. Used in dispatch tables and status columns.

| State        | Colour       | Marker shape           |
| ------------ | ------------ | ---------------------- |
| Cleared/Out  | `#2a6b3a`    | Solid 6×6 square       |
| Packed       | `--orange`   | Solid 6×6 square       |
| In transit   | `--ink-soft` | Solid 6×6 circle       |
| Held         | `--red`      | Solid 6×6 square       |
| Queued       | `--ink-soft` | Solid 6×6 square       |

Status text itself is set in stencil caps (Stardos), inside a 1.5px outlined frame, rotated `-1.5deg`.

### Barcode strip

The page footer carries a decorative barcode strip — a `repeating-linear-gradient` of black bars at irregular widths. It is a real visual gesture, not a real barcode; it does not encode meaningful information. A printed numeric string ("5 901234 567890") sits beneath in JetBrains Mono.

The barcode strip appears once per page, at the bottom. It is the page's signature — the thing that says "this is a Vinyl Traffic document."

## Forms

**Every page is a form.** This is the unifying frame and most of the site falls out of it directly.

| Page              | Form template                                                 |
| ----------------- | ------------------------------------------------------------- |
| Homepage          | Dispatch sheet — running totals, outgoing list, stockroom grid|
| Stock detail      | Inventory card / stock slip                                   |
| Under the Counter | Confidential file folder, redacted                            |
| Friday Note       | Typed letter on slightly-yellowed paper, taped to the page    |
| Find Us           | Printed directions slip / unit address card                   |
| About             | Manifesto / printed mission statement                         |

A "form" has these signals: a heading set in Anton or Permanent Marker, fields with labels in monospace caps above values, dashed or dotted internal dividers, a printed reference code in the corner, and an explicit "from / to / date" header where appropriate. New pages added to the site should pick a form template and adapt it; pages that don't fit a form template are probably trying to do something the unit doesn't do.

## Sleeves

Records on the site are represented by **typographic sleeves**, never by photographs. Each sleeve is a 1:1 square containing some combination of the artist name, title, catalogue code, and a geometric or typographic composition.

This is a working constraint, not a placeholder. We do not use photographs of records. Detailed construction rules for sleeves live in `sdd/context/sleeves.md` (forthcoming) and reference an enumerated set of sleeve archetypes (e.g., `sleeve-typographic`, `sleeve-frame`, `sleeve-stamp`, `sleeve-hatched`). Each stock entry declares which archetype it uses.

Sleeves obey the page's palette. Most are dark-on-light or light-on-dark; a small number use the orange or red accents where the record's character justifies it. Sleeves never use colours outside the design system.

## Motion

Motion is restrained, purposeful, and short.

| Token           | Value                       | Use                                            |
| --------------- | --------------------------- | ---------------------------------------------- |
| `--ease-paper`  | `cubic-bezier(0.2, 0, 0, 1)`| Default ease for entry animations.             |
| `--dur-short`   | `150ms`                     | Hover, focus, link states.                     |
| `--dur-mid`     | `300ms`                     | Section reveals, status changes.               |
| `--dur-rise`    | `650ms`                     | Page-load rise of mastheads and sections.      |

On page load, the masthead and each major section rise 8–10px and fade in, staggered by 100ms each. After load, the page is still — no scroll-driven animations, no parallax, no autoplay.

Hover states are limited to: nav link underline reveal (`scaleX(0)` to `scaleX(1)`), button colour invert, card slight `translateY(-4px)`. Status indicator dots gently pulse on the docket strip ("UNIT OPEN") at a slow 2.4–3 second cycle.

We do not use spring easing, bounce, scale-up entry, or any motion that draws attention to itself. Motion confirms a state change; it does not perform.

## Responsive

Three breakpoints, all mobile-first.

| Width    | Target                          | Behaviour                                              |
| -------- | ------------------------------- | ------------------------------------------------------ |
| < 480px  | Phones                          | Single column. Tables collapse rows or hide columns.   |
| 480–720px| Phones landscape, small tablets | Two-column grids where four were used.                 |
| 720–1024px| Tablets, small laptops         | Full grids, possibly with reduced gutter.              |
| > 1024px | Desktop                         | Full layout, max-width 1280px centred.                 |

Specific component adaptations:

- The dispatch table on mobile drops the courier column entirely.
- The stockroom grid collapses from 4 columns → 2 → 1.
- The "Under the Counter" black band stays full-bleed at all widths but its inner grid reflows.
- The masthead's wordmark and meta-strip stack vertically below 720px.
- Stamps in the masthead row wrap rather than overflow; preserve their rotation.
- The Friday Note paper retains its `rotate(-1deg)` on all sizes — it does not straighten on mobile.

## Accessibility

The aesthetic is shabby; the accessibility is not.

- Body text contrast meets WCAG AA against `--paper`. Body Special Elite at `--ink` ratios above 11:1.
- Secondary text in `--ink-soft` meets AA at body sizes; do not use it below 14px.
- Tertiary `--ink-faded` is reserved for non-essential metadata and captions, never for primary information.
- Orange accent text (`--orange` on `--paper`) is borderline AA — use it for emphasis on labels and figures, not for prose paragraphs.
- Red (`--red` on `--paper`) meets AA for body and bold weights.
- White on `--void` (Under the Counter) uses `--bone` (`#f0e8d2`) for above-AAA contrast.
- All interactive elements have visible focus states using a 2px `--ink` outline with 2px offset.
- Status is never communicated by colour alone. Status indicators always combine colour with shape, position, and label text.
- Decorative noise, paper grain, coffee rings, and tape pieces use `aria-hidden="true"` and have no impact on screen reader output.
- The Sharpie annotations — "3 LEFT", "SOLD", "✓" — are decorative but reflect real state. The state itself is also represented in the structured stock card data so screen readers receive it from the card, not the annotation.
- Motion respects `prefers-reduced-motion: reduce`. The page-load rise becomes an instant fade; pulse animations stop; hover transitions become instant.

## Forbidden

Patterns we have rejected. The list is non-exhaustive but covers the choices agents most frequently reach for by default.

**Typefaces.** Inter, Roboto, Open Sans, Helvetica, Arial, the system stack as primary. Geist, IBM Plex Sans, Manrope, DM Sans as primary display. The unit uses Special Elite, Anton, Stardos Stencil, Permanent Marker, JetBrains Mono. Substitution is not permitted without updating this document.

**Imagery.** Photographs of records, sleeves, the unit, staff, customers, or neighbourhoods. Stock photography of any kind. AI-generated illustrations or sleeve art. Iconography from icon libraries (Heroicons, Lucide, Feather, Phosphor) — we use no icons. Where a directional cue is needed, an arrow character (`→`, `↗`) suffices.

**UI patterns.** Cart components, checkout flows, account dropdowns, login modals, "Add to favourites" hearts, star ratings, customer review blocks, social-proof testimonials, exit-intent popups, cookie banners (we don't set tracking cookies), chat widgets, AI-assistant bubbles, "limited time" countdowns, percentage-off badges, free-shipping promos.

**Visual chrome.** Smooth gradient buttons, rounded-corner-card shadows, glassmorphism, neumorphism, large-radius pill buttons, drop shadows on text, glow effects, neon accents, fluorescent green or hot pink, purple of any saturation, gradient text fills, animated gradients.

**Motion.** Spring or bounce easing, scale-up entry animations, pulse-and-glow CTAs, parallax scrolling, scroll-triggered reveals beyond the on-load rise, autoplaying carousels, marquees, hover-tilt cards, looping-forever animations, GIF backgrounds.

**Copy and microcontent.** Marketing inflation ("passionate about vinyl," "curated experience," "your one-stop shop"), exclamation marks except where genuinely warranted, emoji as functional UI elements, "Welcome!" greetings, "Get started" CTAs, "Learn more" links, sales-funnel framings.

**Operational anti-patterns.** Real wallet addresses, real phone numbers, real personal email addresses, photographs identifying real Vinyl Traffic staff, screenshots of real Discogs listings, references to real records that imply we have them in stock, card-payment iconography (Visa/Mastercard/Stripe logos), trust badges, "100% secure checkout" claims, GDPR-banner cliches.

When in doubt, the question to ask is: *would this appear in a small underground European record dispatch operation's working documents?* If the answer is "no" or "only if they were trying too hard," it is not for us.
