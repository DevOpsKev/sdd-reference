---
name: vinyl-traffic-ui
description: >-
  Vinyl Traffic UI and plain CSS — paper/ink/tape “working desk” aesthetic per
  sdd/context/design-system.md, feeling aligned with sdd/reference/vision.md
  and vision.html. Use when building or styling HTML/CSS (and rare vanilla TS
  islands) under src/; no CSS frameworks, no client UI frameworks.
---

This skill tells agents **how** to implement front-end work **for this product**. It does not replace **`sdd/context/design-system.md`** (rules, tokens, type voices) or the active **spec** (what to build). Where this skill and the design system disagree, **follow the design system** and note intentional deviations in **`provenance.md`**.

## Read before styling

1. **`sdd/context/design-system.md`** — authoritative tokens, type scale, spacing rhythm, stamps/tape/Sharpie rules, Under-the-Counter treatment, and “shabby outside, serious inside.”
2. **`sdd/reference/vision.md`** — how to use the mockup: feeling vs rules, illustrative-only content, do not mutate `vision.html`.
3. **`sdd/reference/vision.html`** (read structure and inline CSS for *feel* when implementing pages) — fixed reference; **never edit** this file.
4. **`sdd/context/architecture.md`** (*Styles*, *Islands*, *Non-goals*) — plain CSS only, no Tailwind/DaisyUI/etc.; no React/Vue/Svelte for layout; islands are rare vanilla TypeScript only when a spec allows.

## Aesthetic direction (fixed, not generic)

- **North star:** The site looks like **documents on a working desk** in an industrial unit — warm paper, dark warm ink, packing-tape orange and customs red used with restraint, rubber-stamp and typewriter voices. Information reads as **expert and true**, not marketing polish.
- **Tension:** Too clean loses the unit; too rough loses credibility. Aim for **printed / photocopied / stamped**, not “designed SaaS.”
- **Do not** invent a new global art direction per task. **Execute** the design system and preserve continuity with **`vision.html`** *emotionally*, not by copying markup verbatim.

## Implementation stack

- **CSS:** Hand-authored **plain CSS** only (see architecture). Prefer **`src/styles/`** and a single entry import chain when the repo uses that layout; a single **`src/style.css`** is fine at vite-baseline. **No** Tailwind, DaisyUI, Bootstrap, Sass/LESS, or PostCSS-as-a-styling layer unless a **spec** explicitly adds one.
- **Markup:** Semantic HTML first. Reuse patterns from the design system (docket strip, masthead, dashed rules, manifest tables, stamp rows) rather than generic hero + three-column cards.
- **JavaScript:** Default **none**. Small **vanilla TypeScript** islands under **`src/islands/`** only when the spec or architecture allows; no client frameworks, no virtual DOM libraries.
- **External assets:** **Google Fonts** only for the families already defined in **`design-system.md`** (Special Elite, Anton, Stardos Stencil, Permanent Marker, JetBrains Mono). Do not add arbitrary CDNs for scripts, images, or styles.

## Tokens, type, and colour

- Define and use **CSS custom properties** aligned with **`design-system.md`** (e.g. `--paper`, `--ink`, `--orange`, `--tape`, `--sharpie`, `--void`, `--bone`). When **`src/styles/tokens.css`** exists, keep it in sync with token tables there — architecture expects token parity over time.
- **Typography:** Use the **five voices** and jobs from the design system table (body = Special Elite, display = Anton, stencil stamps, hand = Permanent Marker sparingly, mono = JetBrains Mono for codes/IDs). Respect uppercase / letter-spacing rules for each voice; do not substitute “similar” webfonts without updating the design system.
- **Accents:** Ink carries most UI. **Orange** roughly one-in-eight accent moments; **red** rare (customs / restricted readings). **Tape** and **Sharpie** annotations **once or twice per view**, not wallpapered.
- **Texture:** Paper grain, faint stains, and light ageing in backgrounds are part of the language — not optional polish for “depth.” Keep opacity subtle so body text stays readable.

## Layout and motion

- Prefer **document rhythm**: max width ~1280px, shared gutter `clamp(1rem, 3vw, 2.5rem)`, section separation per design-system (solid under masthead, dashed between blocks, table row rules).
- **Motion:** **CSS-only**, restrained — small stamp rotations, optional docket indicator pulse, short transitions. **No** animation libraries, no scroll-jacking, no staggered “marketing reveal” unless a spec asks for a specific interaction. The mockup’s energy comes from **materiality**, not motion-choreography.

## Content vs reference

- **`vision.html` content** (names, prices, copy) is **illustrative only**. Real data lives under **`sdd/content/`** as defined by specs and **`product.md`**. Never ship mock placeholder records as fact.
- **Do not** link the public site to **`sdd/reference/`** paths; reference files are for builders and agents only.

## Anti-patterns (still avoid “AI slop”)

- Default dashboard fonts (Inter-only, Roboto-only), purple-on-white hero gradients, glassmorphism, neon cyberpunk, or center-everything three-icon feature rows **that ignore** the unit’s paper-and-stamp language.
- Utility-first CSS frameworks or “quick” component kits that fight the design system.
- Rewriting **`sdd/reference/vision.html`** or **`vision.md`** as part of implementation work — they are **read-only** inputs.

## When scope is unclear

Prefer the **smallest** change that satisfies the **spec acceptance criteria** and matches **`design-system.md`**. If the spec is silent on a visual detail, match **`vision.html`** *feeling* while staying inside token and accessibility constraints; document judgment calls in **`provenance.md`**.
