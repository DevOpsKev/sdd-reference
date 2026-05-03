# Homepage

## Intent
Generate a static homepage for the project with a hero section, value proposition, rings, quadrants, and footer. The page must adhere to the design system defined in `.context/design-system.md` and use the copy defined in the **embedded Copy section** of this spec.

This spec is **deterministic and constrained**. The agent must:
- Generate only the files specified in **File layout**.
- Use the exact content from the **Copy** section above for all prose.
- Follow the design system rules in `.context/design-system.md`.
- Ignore `.context/product.md` (this spec provides all necessary context).
- Limit the generated `index.html` to **200 lines of code**.
- Avoid generating redundant or overly verbose code.

## References

- `.context/design-system.md` — Visual direction, tokens, typography, layout, motion, voice, and accessibility.

If this spec and the design system disagree, the design system wins. If this spec and the copy file disagree on wording, the copy file wins. Open an issue rather than papering over it.

## Copy

All content for the homepage is defined below. The agent must use this content **verbatim** and must not paraphrase or modify it.

```yaml
meta:
  version: "0.1"
  last_updated: "2026-05-03"
  locale: "en-GB"

sections:

  hero:
    eyebrow: "EUROPEAN TECHNOLOGY ASSESSMENT · v0.1"
    heading: "Tech Sovereignty Radar"
    value_prop: >-
      A periodic, opinionated radar for European technology leaders making
      sovereignty-aware decisions about what to adopt, trial, assess, or
      divest from.
    primary_cta:
      label: "Explore the radar"
      href: "/radar"
    secondary_link:
      label: "What's in v0.1"
      href: "#preview"

  why_different:
    eyebrow: "WHY THIS IS DIFFERENT"
    heading: "Sovereignty is not maturity."
    body:
      - >-
        Most technology radars ask whether a technology is mature, proven,
        or ready. That is a useful question. It is not the question European
        technology leaders need answered when the CLOUD Act sits across the
        Atlantic, when the exit cost of a managed service compounds yearly,
        and when a regulatory or geopolitical shift can revalue an entire
        dependency overnight.
      - >-
        A technology can be technically excellent and still belong in Divest.
        Sovereignty assessment weighs jurisdiction, ownership, exit cost,
        standards posture, and supply-chain exposure — and asks whether a
        five-year dependency is defensible. The radar's placements reflect
        that judgement, not technical merit alone.

  rings:
    eyebrow: "RINGS · WHAT TO DO"
    heading: "Four rings. One question: what do you do on Monday?"
    items:
      - id: "adopt"
        index: "01"
        name: "Adopt"
        description: "Sovereignty-safe. Recommended for new and existing systems."
      - id: "trial"
        index: "02"
        name: "Trial"
        description: "Credible. Worth piloting in a non-critical context."
      - id: "assess"
        index: "03"
        name: "Assess"
        description: "Watch and learn. Not yet ready, or signal is mixed."
      - id: "divest"
        index: "04"
        name: "Divest"
        description: "If you depend on this, plan and budget an exit."

  quadrants:
    eyebrow: "QUADRANTS · WHERE IT LIVES"
    heading: "The stack, divided four ways."
    items:
      - id: "infra-compute"
        index: "01"
        name: "Infrastructure & Compute"
        description: "Cloud, hosting, CDN, edge. Where workloads run and data lives at rest."
      - id: "data-identity"
        index: "02"
        name: "Data & Identity"
        description: "Databases, authentication, analytics, AI/ML services. The systems that hold and reason about your data."
      - id: "developer-toolchain"
        index: "03"
        name: "Developer Toolchain"
        description: "Source hosting, CI/CD, observability, package registries. The pipeline that ships software."
      - id: "standards-protocols"
        index: "04"
        name: "Standards & Protocols"
        description: "Open standards and interop layers that reduce future lock-in."

  preview:
    eyebrow: "PREVIEW · v0.1 SAMPLE"
    heading: "A first look."
    body: >-
      This is a sketch of the radar's visual structure. The placements below
      are illustrative only — they exist to convey the format, not editorial
      assessments. Real placements arrive with v1.0, on a published cadence,
      with rationale and dates attached.

  closing:
    body: "Stack decisions made on a published cadence — defensible to a regulator, a board, or a successor."
    cta:
      label: "Explore the radar"
      href: "/radar"

  footer:
    left: "Tech Sovereignty Radar v0.1"
    center: "Last updated 3 May 2026"
    right: "CC BY-SA 4.0"
```

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
└── public/
    └── favicon.svg       # Favicon (optional)
```

- The generated `index.html` must include all styles inline (no external CSS files).
- Follow the design system rules in `.context/design-system.md` for typography, spacing, and layout.

## Acceptance criteria

The homepage is complete when all of the following are true:

- [ ] The file `index.html` exists at the root of the project and does not exceed **200 lines of code**.
- [ ] `index.html` contains the exact content from the **Copy** section for all prose (hero, why-different, rings, quadrants, preview, closing, footer).
- [ ] `index.html` adheres to the design system rules in `.context/design-system.md` for typography, spacing, and layout.
- [ ] The page validates as HTML5.
- [ ] The page renders correctly in a modern browser with no console errors.

## Out of scope

- Interactive elements (e.g., filtering, hover effects).
- Backend APIs, authentication, or persistence.
- Dark mode.
- i18n.

## Notes for the implementing agent

- Treat the **embedded YAML content** in the **Copy** section as structured data. Do not parse it as raw text.
- If something in this spec contradicts the design system, the design system wins. Stop and note the contradiction in your output rather than picking one silently.
- All visible prose comes from the **embedded Copy section** of this spec. Do not generate, paraphrase, or "improve" copy at build time. If a string is missing, stop and ask.
- Do not add sections, components, or dependencies not listed here. If you believe one is needed, stop and ask.
