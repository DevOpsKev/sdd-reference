# Homepage

## Intent

Create the first static homepage for Tech Sovereignty Radar: a sober, editorial landing page that explains the radar, previews its structure, and gives European technology leaders a clear way into the product.

This spec is **deterministic where possible**. Agents should treat enumerated page sections, the SVG specification, the file layout, the toolchain, and the validation script as binding. Where the spec gives a word budget and constraints rather than literal copy, the agent writes the copy — but does not invent additional sections, restructure the page, or add dependencies.

## References

- `.context/product.md` — positioning, audience, value proposition, rings, quadrants, non-goals.
- `.context/design-system.md` — visual direction, tokens, typography, layout, motion, voice, accessibility.
- `copy.yaml` (sibling of this file) — **the source of truth for all homepage prose**.

If this spec and the design system disagree, the design system wins. If this spec and the copy file disagree on wording, the copy file wins. Open an issue rather than papering over it.

## Copy

All homepage prose — eyebrows, headings, value proposition, body paragraphs, ring and quadrant definitions, preview text, closing line, footer — lives in `copy.yaml`. The build loads YAML at compile time and renders it into the page.

**The agent does not write or paraphrase copy.** Every visible string on the homepage maps to a YAML key. If a string is missing from the YAML, stop and ask — do not invent one. If a string in the YAML seems wrong, do not silently rewrite it; flag the issue.

The per-section specifications below describe **structure and constraints** (which YAML keys map where, what styling each receives). Word budgets and content constraints in those sections are documentation of how the YAML was authored, not instructions to regenerate it.

## Toolchain (pinned)

- **Vite** `^5.4.0` — build tool.
- **TypeScript** `^5.5.0` — strict mode on.
- No other runtime or dev dependencies. No React, Vue, Tailwind, Sass, PostCSS plugins, component libraries, icon packs, or utility frameworks.
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
| 5 | `preview` | Static SVG sample radar |
| 6 | `closing` | Single closing line and a CTA back to the radar |
| 7 | `footer` | Version, last-updated date, license |

## Section specifications

Each section below maps to a key under `sections.*` in `copy.yaml`. The YAML key is given at the top of each section. All visible strings come from there.

### 1. Hero

**Copy:** `sections.hero` in `copy.yaml`.

- **Heading**: `Tech Sovereignty Radar`. Use `--type-display`. Sentence-case despite proper noun is wrong here — render as title-case.
- **Eyebrow above heading**: `--type-micro`, uppercase, content: `EUROPEAN TECHNOLOGY ASSESSMENT · v0.1`.
- **Value proposition**: one sentence, ≤22 words, must contain the words "European" and "sovereignty," must not contain: "AI," "platform," "innovative," "cutting-edge," "game-changing," "trusted by." Render at `--type-body-lg`.
- **Primary CTA**: button, label `Explore the radar`, href `/radar` (placeholder route, no implementation needed). Primary button styling per design system.
- **Secondary link**: text link, label `What's in v0.1`, href `#preview`.
- **Layout**: asymmetric. Heading and copy left-aligned, occupying columns 1–8 on `lg`+. Right side (columns 9–12) intentionally empty.

Example value proposition that satisfies the constraints (do not copy verbatim — use as a quality target):

> A periodic, opinionated assessment of which technologies European organisations should adopt, trial, assess, or divest from, viewed through the lens of sovereignty.

### 2. Why-different

**Copy:** `sections.why_different`.

- **Eyebrow**: `WHY THIS IS DIFFERENT`.
- **Heading**: `--type-h1`, ≤8 words. Example target: `Sovereignty is not maturity.`
- **Body**: 2 paragraphs, 80–140 words total, at `--type-body-lg`.
- **Constraints**: must mention CLOUD Act, exit cost, and that a technology can be technically excellent and still sit in Divest. Must not name specific vendors.
- **Layout**: copy in columns 1–7, columns 8–12 empty.

### 3. Rings

**Copy:** `sections.rings`. The four ring items come from `sections.rings.items[]`.

- **Eyebrow**: `RINGS · WHAT TO DO`.
- **Heading**: `--type-h1`, fixed: `Four rings. One question: what do you do on Monday?`
- **Grid**: 4 columns on `lg`+, 2 columns on `md`, 1 column on `sm`. `--space-5` gap.
- **Each ring card**:
  - Numbered eyebrow: `01` / `02` / `03` / `04` in mono, `--type-mono`, `--ink-muted`.
  - Ring name as `--type-h2`, in the ring's edge color (`#143F30` for Adopt, etc.). This is one of the few places the ring color is used outside the radar itself; this is permitted.
  - One-line definition, ≤20 words, at `--type-body`.
  - 1px border `--rule`, `--radius-2`, padding `--space-5`. No shadow.
- **Definitions** (use exactly these, do not paraphrase):
  - **Adopt** — Sovereignty-safe. Recommended for new and existing systems.
  - **Trial** — Credible. Worth piloting in a non-critical context.
  - **Assess** — Watch and learn. Not yet ready, or signal is mixed.
  - **Divest** — If you depend on this, plan and budget an exit.

### 4. Quadrants

**Copy:** `sections.quadrants`. The four quadrant items come from `sections.quadrants.items[]`.

- **Eyebrow**: `QUADRANTS · WHERE IT LIVES`.
- **Heading**: `--type-h1`, fixed: `The stack, divided four ways.`
- **Grid**: same shape as Rings.
- **Each quadrant card**:
  - Same structure as ring cards.
  - Quadrant name as `--type-h2` in `--ink` (no color encoding for quadrants).
  - One-line description, ≤22 words.
- **Definitions** (use exactly these):
  - **Infrastructure & Compute** — Cloud, hosting, CDN, edge. Where workloads run and data lives at rest.
  - **Data & Identity** — Databases, authentication, analytics, AI/ML services. The systems that hold and reason about your data.
  - **Developer Toolchain** — Source hosting, CI/CD, observability, package registries. The pipeline that ships software.
  - **Standards & Protocols** — Open standards and interop layers that reduce future lock-in.

### 5. Preview (sample radar)

**Copy:** `sections.preview`. The 12 sample dots are specified in this file under "Sample radar specification" — they live in the spec, not in the copy file, because they describe a structured visualisation rather than prose.

- **Eyebrow**: `PREVIEW · v0.1 SAMPLE`.
- **Heading**: `--type-h1`, fixed: `A first look.`
- **Body**: 1 paragraph, 30–60 words, framing the SVG below as a sample, not a release. Must include the phrase "illustrative only."
- **The SVG**: see "Sample radar specification" below. Embed inline, not as `<img>`.
- **Layout**: SVG centered (one of the permitted center-aligned uses). Maximum width 600px; scales down responsively.

### 6. Closing

**Copy:** `sections.closing`.

- **Single sentence**: ≤18 words, restatement of the product's job. Render at `--type-body-lg`, centered.
- **Primary CTA**: identical to the hero CTA.

### 7. Footer

**Copy:** `sections.footer`.

- 1px top border `--rule`.
- Three columns on `lg`+, single column on `sm`. All `--type-small`, `--ink-muted`, mono where indicated.
- Left: `Tech Sovereignty Radar v0.1` (mono for `v0.1`).
- Center: `Last updated 3 May 2026` (mono for the date).
- Right: `CC BY-SA 4.0`.

## Sample radar specification

Static, inline SVG. No JavaScript. No animation. Purely declarative.

### Canvas

- `viewBox="0 0 600 600"`, `width="100%"`, `height="auto"`, `max-width: 600px`.
- Center: `(300, 300)`.
- Background: transparent (lets `--surface` show through).

### Rings

Four concentric circles, centered at `(300, 300)`. From innermost outward:

| Ring | Outer radius | Stroke | Fill |
|---|---|---|---|
| Adopt | 70 | `--rule-strong` 1px | none |
| Trial | 140 | `--rule` 1px | none |
| Assess | 210 | `--rule` 1px | none |
| Divest | 280 | `--rule` 1px | none |

Render as four `<circle>` elements with no fill and 1px stroke. The Adopt ring uses `--rule-strong`; the others use `--rule`.

### Axes

Two 1px lines in `--rule`, dividing the canvas into quadrants:

- Vertical: `(300, 20)` to `(300, 580)`.
- Horizontal: `(20, 300)` to `(580, 300)`.

### Quadrant labels

`--type-micro`, uppercase, fill `--ink-muted`, tracked `0.08em`. Positioned just inside the outer edge of their quadrant, near the canvas corners:

| Quadrant | Position | Anchor | Text |
|---|---|---|---|
| Top-right | `(580, 32)` | `text-anchor: end` | `INFRASTRUCTURE & COMPUTE` |
| Top-left | `(20, 32)` | `text-anchor: start` | `DATA & IDENTITY` |
| Bottom-left | `(20, 588)` | `text-anchor: start` | `DEVELOPER TOOLCHAIN` |
| Bottom-right | `(580, 588)` | `text-anchor: end` | `STANDARDS & PROTOCOLS` |

### Ring labels

`--type-mono-small`, fill `--ink-muted`. Positioned along the right side of the horizontal axis, just above each ring boundary, `text-anchor: start`:

- `Adopt` at `(305, 235)`.
- `Trial` at `(305, 165)`.
- `Assess` at `(305, 95)`.
- `Divest` at `(305, 25)`.

### Sample dots

Exactly 12 dots. Each is a `<g>` containing a `<circle>` (radius 6, fill = ring fill color, stroke = ring edge color, stroke-width 1.5) and a `<text>` label (`--type-mono-small`, fill `--ink`, positioned 10px to the right and 4px below center, `text-anchor: start`).

| Label | Quadrant | Ring | x | y |
|---|---|---|---|---|
| `Hetzner Cloud` | Infra & Compute | Adopt | 335 | 280 |
| `OVHcloud` | Infra & Compute | Trial | 380 | 245 |
| `AWS Frankfurt` | Infra & Compute | Assess | 430 | 200 |
| `PostgreSQL` | Data & Identity | Adopt | 265 | 280 |
| `Authentik` | Data & Identity | Trial | 220 | 240 |
| `MongoDB Atlas` | Data & Identity | Divest | 110 | 180 |
| `Forgejo` | Developer Toolchain | Adopt | 265 | 320 |
| `GitLab CE` | Developer Toolchain | Trial | 220 | 360 |
| `GitHub Cloud` | Developer Toolchain | Assess | 170 | 405 |
| `OpenID Connect` | Standards & Protocols | Adopt | 335 | 320 |
| `Matrix` | Standards & Protocols | Trial | 380 | 355 |
| `Gaia-X` | Standards & Protocols | Assess | 430 | 400 |

These names are illustrative placements for visual purposes only. The footer or preview body text must include the phrase "illustrative only" so a reader does not mistake them for v0.1 editorial positions.

### Accessibility

- The SVG has `role="img"` and an `<title>` child reading `Sample radar showing four concentric rings (Adopt, Trial, Assess, Divest) divided into four quadrants with twelve illustrative entries.`
- A visually hidden `<table>` immediately after the SVG lists the same 12 entries with their ring and quadrant — satisfies the design system requirement that visualisations expose a tabular alternative.

## File layout

```
.
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── public/
│   └── favicon.svg
└── src/
    ├── main.ts
    ├── styles/
    │   ├── tokens.css
    │   ├── base.css
    │   └── homepage.css
    └── components/
        ├── radar-preview.ts
        └── radar-preview.svg.ts
```

- `tokens.css` defines every design system token (colors, type, spacing, motion) as CSS custom properties on `:root`.
- `base.css` covers element resets, focus styles, link styles, the Google Fonts import, and the `prefers-reduced-motion` rules.
- `homepage.css` styles only the homepage sections.
- `radar-preview.svg.ts` exports a function that returns the SVG markup as a string. `radar-preview.ts` mounts it.

## Dockerfile strategy

Two-stage build. Build with Node, serve with nginx.

- **Stage 1**: `node:20-alpine`. `WORKDIR /app`. Copy `package*.json`, run `npm ci`. Copy the rest, run `npm run build`. Produces `/app/dist`.
- **Stage 2**: `nginx:alpine`. Copy `dist/` to `/usr/share/nginx/html`. Copy `nginx.conf` to `/etc/nginx/conf.d/default.conf`. `EXPOSE 8080`.
- **`nginx.conf`**: `listen 8080;` (not 80), `server_name _;`, `root /usr/share/nginx/html;`, `index index.html;`, single `location /` with `try_files $uri $uri/ /index.html;`. Set `Cache-Control: public, max-age=3600` for the HTML and `max-age=31536000, immutable` for hashed assets in `/assets/`.

Do not use `python -m http.server`, `serve`, `http-server`, or any Node-based static server in the runtime image.

## package.json scripts

Exactly these scripts, exactly these names:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --port 8080",
    "validate": "node scripts/validate.mjs"
  }
}
```

## Validation script (`scripts/validate.mjs`)

Executable, deterministic. Runs after `npm run build`. Exits 0 on success, non-zero with a clear message on failure. The agent uses this as the "done" signal — when `npm run build && npm run validate` both pass, the homepage is complete.

The script must check, in order:

1. `dist/index.html` exists.
2. `dist/index.html` contains the literal string `Tech Sovereignty Radar`.
3. `dist/index.html` contains all four ring names: `Adopt`, `Trial`, `Assess`, `Divest`.
4. `dist/index.html` contains all four quadrant names: `Infrastructure & Compute`, `Data & Identity`, `Developer Toolchain`, `Standards & Protocols`.
5. `dist/index.html` contains a Google Fonts URL referencing `Inter` and `JetBrains+Mono`.
6. `dist/index.html` does **not** contain any of: `IBM+Plex`, `Roboto`, `Helvetica`, `Open+Sans`, `Lato`.
7. `dist/index.html` contains an `<svg` element with `viewBox="0 0 600 600"`.
8. `dist/index.html` contains the literal string `illustrative only`.
9. `dist/index.html` contains `role="img"` on the radar SVG.
10. `dist/` contains no files referencing external CDNs other than `fonts.googleapis.com` and `fonts.gstatic.com`.
11. `.sdd/specifications/homepage/copy.yaml` exists, parses as valid YAML, and has the required top-level keys: `meta`, `sections.hero`, `sections.why_different`, `sections.rings`, `sections.quadrants`, `sections.preview`, `sections.closing`, `sections.footer`.
12. `dist/index.html` contains the literal phrase `sovereignty-aware decisions` (proves the value prop from the YAML was rendered, not regenerated).
13. `dist/index.html` contains the literal phrase `Sovereignty is not maturity` (proves the why-different heading was rendered from the YAML).

Each failed check prints which check failed and what was expected.

## Acceptance criteria

The homepage is complete when all of the following are true:

- [ ] `npm install` succeeds with no warnings about missing peer dependencies.
- [ ] `npm run build` produces `dist/index.html` and asset files under `dist/assets/`.
- [ ] `npm run validate` exits 0.
- [ ] `docker build -t sovereignty-radar .` succeeds.
- [ ] `docker run --rm -p 8080:8080 sovereignty-radar` starts the container; `curl -fsS http://localhost:8080/` returns HTTP 200 with a body containing `Tech Sovereignty Radar`.
- [ ] Lighthouse accessibility score on the built page is ≥95 (informational; not a build gate).
- [ ] No console errors in a fresh browser load.

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
- Do not add sections, components, or dependencies not listed here. If you believe one is needed, stop and ask.
- The validation script is the source of truth for "done." If it passes, ship. If it fails, fix the specific check it names — don't refactor broadly.
- The only place taste is required is the SVG layout — and that is fully specified by coordinates. Render it and move on.
