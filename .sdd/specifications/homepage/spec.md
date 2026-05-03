# Homepage

## Intent
Generate a static homepage for the project with a hero section, value proposition, rings, quadrants, and footer. The page must adhere to the design system defined in `.context/design-system.md` and use the copy defined in `copy.yaml`.

This spec is **deterministic and constrained**. The agent must:
- Generate only the files specified in **File layout**.
- Use the exact content from `copy.yaml` for all prose.
- Follow the design system rules in `.context/design-system.md`.
- Ignore `.context/product.md` (this spec provides all necessary context).
- Limit the generated `index.html` to **200 lines of code**.
- Avoid generating redundant or overly verbose code.

## References

- `.context/design-system.md` — Visual direction, tokens, typography, layout, motion, voice, and accessibility.
- `copy.yaml` (sibling of this file) — **The source of truth for all homepage prose**.

If this spec and the design system disagree, the design system wins. If this spec and the copy file disagree on wording, the copy file wins. Open an issue rather than papering over it.

## Copy

All homepage prose — eyebrows, headings, value proposition, body paragraphs, ring and quadrant definitions, preview text, closing line, footer — lives in `copy.yaml`. The build loads YAML before Vite runs and renders that data into the page.

**The agent does not write or paraphrase copy.** Every visible string on the homepage maps to a YAML key. If a string is missing from the YAML, stop and ask — do not invent one. If a string in the YAML seems wrong, do not silently rewrite it; flag the issue.

The per-section specifications below describe **structure and constraints** (which YAML keys map where, what styling each receives). Word budgets and content constraints in those sections are documentation of how the YAML was authored, not instructions to regenerate it.

Do not satisfy this requirement by manually transcribing `copy.yaml` into source code. The implementation must derive generated copy data from `.sdd/specifications/homepage/copy.yaml` through the build step.

## Toolchain (pinned)

- **Vite** `^5.4.0` — build tool.
- **TypeScript** `^5.5.0` — strict mode on.
- No runtime dependencies. The only permitted dev dependencies are Vite, TypeScript, and `yaml` for parsing `copy.yaml` in build/validation scripts. No React, Vue, Tailwind, Sass, PostCSS plugins, component libraries, icon packs, or utility frameworks.
- Vanilla HTML, CSS (with native CSS custom properties), inline SVG, and TypeScript only.
- Google Fonts is the only permitted external runtime asset.

## Fonts

Per design system: **Inter** (sans, weights 400/500/600/700) and **JetBrains Mono** (weights 400/500), loaded from Google Fonts. Use the exact `<link>` tags from the design system.

> The design system explicitly forbids IBM Plex, Roboto, Helvetica, Arial, Open Sans, Lato, and system-ui in production. If you find a previous reference to IBM Plex in older drafts, ignore it.

## Page structure

The homepage has exactly seven sections, in this order. Do not add, remove, or reorder.

| # | Section ID | Purpose |
|---|---|---|
| 1 | `hero` | Name, value proposition, primary CTA |
| 2 | `why-different` | Why sovereignty assessment differs from a maturity radar |
| 3 | `rings` | The four rings with one-line definitions |
| 4 | `quadrants` | The four quadrants with one-line definitions |
| 5 | `preview` | Static preview of the radar (illustrative only) |
| 6 | `closing` | Single closing line and a CTA back to the radar |
| 7 | `footer` | Version, last-updated date, license |

## Section guidance

All content for the homepage sections is defined in `copy.yaml`. The agent must:
- Use the exact content from `copy.yaml` for all prose.
- Follow the design system rules in `.context/design-system.md` for typography, spacing, and layout.
- Ensure the `index.html` file does not exceed **200 lines of code**.
- Avoid generating redundant or overly verbose code.

### Hero
- **Content**: `sections.hero` in `copy.yaml`.
- **Layout**: Asymmetric. Heading and copy left-aligned, occupying columns 1–8 on `lg`+. Right side (columns 9–12) intentionally empty.

### Why-different
- **Content**: `sections.why_different` in `copy.yaml`.
- **Layout**: Copy in columns 1–7, columns 8–12 empty.

### Rings
- **Content**: `sections.rings` in `copy.yaml`.
- **Layout**: 4 columns on `lg`+, 2 columns on `md`, 1 column on `sm`. `--space-5` gap.
- **Design**: Each ring card must use the ring's edge color for the ring name (e.g., `#143F30` for Adopt).

### Quadrants
- **Content**: `sections.quadrants` in `copy.yaml`.
- **Layout**: Same as Rings.

### Preview
- **Content**: `sections.preview` in `copy.yaml`.
- **Design**: Embed the SVG inline (not as `<img>`). Center the SVG with a maximum width of 600px.

### Closing
- **Content**: `sections.closing` in `copy.yaml`.
- **Layout**: Centered.

### Footer
- **Content**: `sections.footer` in `copy.yaml`.
- **Layout**: Three columns on `lg`+, single column on `sm`. All `--type-small`, `--ink-muted`.

## File layout

The agent must generate the following files:

```
.
├── index.html            # Static homepage
├── public/
│   └── favicon.svg       # Favicon (optional)
└── src/
    └── styles/
        ├── tokens.css    # Design system tokens (CSS custom properties)
        ├── base.css      # Base styles, Google Fonts import, resets
        └── homepage.css  # Styles for the homepage sections
```

- `tokens.css` must define all design system tokens (colors, typography, spacing, motion) as CSS custom properties on `:root`.
- `base.css` must include element resets, focus styles, link styles, and the Google Fonts import for **Inter** and **JetBrains Mono**.
- `homepage.css` must style only the homepage sections.

## Acceptance criteria

The homepage is complete when all of the following are true:

- [ ] The file `index.html` exists at the root of the project and does not exceed **200 lines of code**.
- [ ] `index.html` contains the exact content from `copy.yaml` for all prose (hero, why-different, rings, quadrants, preview, closing, footer).
- [ ] `index.html` adheres to the design system rules in `.context/design-system.md` for typography, spacing, and layout.
- [ ] `index.html` includes the Google Fonts URL for **Inter** and **JetBrains Mono**.
- [ ] `index.html` does not contain any forbidden fonts (e.g., IBM Plex, Roboto, Helvetica, Open Sans, Lato).
- [ ] The preview section includes the phrase "illustrative only" to clarify that the sample radar is not a release.
- [ ] The radar SVG (if included) is embedded inline and centered with a maximum width of 600px.
- [ ] The page validates as HTML5.
- [ ] The page renders correctly in a modern browser with no console errors.

## Out of scope

- Interactive radar (filtering, hover detail, ring selection).
- Real vendor/technology dataset; the 12 sample dots are illustrative.
- Per-entry detail pages.
- Release archive or diff view.
- Authentication, persistence, backend APIs, CMS, analytics, observability.
- Dark mode.
- i18n.

## Notes for the implementing agent

- If something in this spec contradicts the design system, the design system wins. Stop and note the contradiction in your output rather than picking one silently.
- All visible prose comes from `copy.yaml`. Do not generate, paraphrase, or "improve" copy at build time. If a string is missing, stop and ask.
- Do not manually copy YAML values into a source file. Generate `src/data/copy.generated.ts` from `copy.yaml` using `scripts/generate-copy.mjs`.
- Do not add sections, components, or dependencies not listed here. If you believe one is needed, stop and ask.
- The validation script is the source of truth for "done." If it passes, ship. If it fails, fix the specific check it names — don't refactor broadly.
- The only place taste is required is the SVG layout — and that is fully specified by coordinates. Render it and move on.
