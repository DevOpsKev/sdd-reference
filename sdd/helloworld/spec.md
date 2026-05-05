# Hello World — Designed Edition

## Intent
A containerised single-page "Hello, World!" that someone would actually screenshot. The default Hello World page is forgettable; this one isn't.

## Requirements
- Static page served from a container (nginx:alpine base or similar minimal image).
- Renders "Hello, World!" as the centerpiece — prominent, not buried.
- Commit to one coherent aesthetic direction and execute with conviction. Bold maximalism and refined minimalism both qualify; "centered text on white with no other decisions" does not. Pick a direction, then do it well.
- Typography, palette, layout, and motion should each reflect a deliberate choice — not a default. The page should feel designed, not assembled.
- All app assets bundled in the image, except Google Fonts are allowed for typography. Do not use other external CDN calls for scripts, images, stylesheets, or runtime assets.
- Container exposes port 8080. Configure the web server to listen on 8080 (override any default port).
- `docker build -t hello . && docker run -p 8080:8080 hello` serves the app at http://localhost:8080.

## Acceptance criteria
- `Dockerfile` at repo root.
- Static assets under `app/` — at minimum `index.html` and `styles.css`. Custom font files are optional if fonts are self-hosted rather than loaded from Google Fonts.
- `app/DESIGN.md` — 3–6 sentences naming the aesthetic direction, the typographic and palette decisions, and the one detail intended to be memorable. The agent's own articulation of intent, not boilerplate.
- Final image under 75 MB.
- HTTP GET to / returns 200 with body containing "Hello, World!".
- `sdd/helloworld/provenance.md` exists (created or overwritten per agent rules), documenting actions, validation, and artifacts from this run.
- No AI-default tells: no Inter / Roboto / Arial / system-only typography, no purple-gradient-on-white, no untreated centered-flex-stack layout, no generic glassmorphism card.

## Out of scope
- TLS, auth, persistence, observability.
- Frameworks, build toolchains, CSS preprocessors, component libraries (no React, Vue, Tailwind, Sass, etc.). Vanilla HTML and CSS only; vanilla JS is allowed for motion or interaction if the design calls for it.
- Multiple pages or routes.
