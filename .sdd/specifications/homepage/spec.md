# Homepage

## Intent

Create the first static homepage for Tech Sovereignty Radar: a sober, editorial landing page that explains the radar, previews its structure, and gives European technology leaders a clear way into the product.

## Requirements

- Build a static homepage using the project architecture context: Node/Vite authoring, static output, Docker-served runtime on port 8080.
- Follow `.context/product.md` for product positioning, audience, value proposition, rings, quadrants, non-goals, and success criteria.
- Follow `.context/design-system.md` for visual direction, colors, typography, layout, motion, content voice, and accessibility.
- The page must introduce Tech Sovereignty Radar in clear, defensible language for CTOs, heads of architecture, principal engineers, and adjacent security/procurement readers.
- Include a hero section with the product name, a concise value proposition, and a primary call to action to explore the radar.
- Include an explanation of the four rings: Adopt, Trial, Assess, Divest.
- Include an explanation of the four quadrants: Infrastructure & Compute, Data & Identity, Developer Toolchain, Standards & Protocols.
- Include a small preview/sample radar area or structured visual teaser that feels like the eventual product, not a generic marketing illustration.
- Include a section explaining why sovereignty-aware technology assessment is different from a generic maturity radar.
- Use Google Fonts as defined in `.context/design-system.md`.
- No React, Vue, Tailwind, Sass, or component library unless the implementation clearly justifies it. Prefer vanilla HTML, CSS, SVG, and TypeScript.
- Container exposes port 8080 and serves the built static app.

## Acceptance criteria

- `package.json` with scripts for `build`, `dev`, and a basic validation/test command.
- `Dockerfile` at repo root builds the static app and serves it on port 8080.
- Source files live under `src/`.
- Built output is served from `dist/` in the runtime image.
- HTTP GET to `/` returns 200 and contains `Tech Sovereignty Radar`.
- Page includes visible references to all four rings and all four quadrants.
- Page uses the IBM Plex Google Fonts specified in `.context/design-system.md`.
- Page uses design tokens consistent with `.context/design-system.md`.
- No external runtime assets except Google Fonts.
- `docker build -t sovereignty-radar . && docker run -p 8080:8080 sovereignty-radar` serves the app at `http://localhost:8080`.

## Out of scope

- Full interactive radar implementation.
- Real vendor/technology dataset.
- Per-entry detail pages.
- Release archive and diff view.
- Authentication, persistence, backend APIs, CMS, analytics, or observability.
