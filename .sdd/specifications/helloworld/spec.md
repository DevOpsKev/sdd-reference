# Hello World — Designed Edition

## Intent
A containerised single-page "Hello, World!" that someone would actually screenshot. The default Hello World page is forgettable; this one isn't.

## Requirements
- Static page served from a container (nginx:alpine base or similar minimal image).
- Renders "Hello, World!" as the centerpiece — prominent, not buried.
- Commit to one coherent aesthetic direction and execute with conviction. Bold maximalism and refined minimalism both qualify; "centered text on white with no other decisions" does not. Pick a direction, then do it well.
- Typography, palette, layout, and motion should each reflect a deliberate choice — not a default. The page should feel designed, not assembled.
- All design assets bundled in the image — no external CDN calls. Custom fonts loaded via `@font-face` from local files.
- Container exposes port 8080. Configure the web server to listen on 8080 (override any default port).
- `docker build -t hello . && docker run -p 8080:8080 hello` serves the app at http://localhost:8080.

## Acceptance criteria
- `Dockerfile` at repo root.
- Static assets under `app/` — at minimum `index.html` and `styles.css`. Custom font files (if used) under `app/fonts/`.
- `app/DESIGN.md` — 3–6 sentences naming the aesthetic direction, the typographic and palette decisions, and the one detail intended to be memorable. The agent's own articulation of intent, not boilerplate.
- Final image under 75 MB (allows headroom for one or two custom font files).
- HTTP GET to / returns 200 with body containing "Hello, World!".
- No AI-default tells: no Inter / Roboto / Arial / system-only typography, no purple-gradient-on-white, no untreated centered-flex-stack layout, no generic glassmorphism card.

## Out of scope
- TLS, auth, persistence, observability.
- Frameworks, build toolchains, CSS preprocessors, component libraries (no React, Vue, Tailwind, Sass, etc.). Vanilla HTML and CSS only; vanilla JS is allowed for motion or interaction if the design calls for it.
- Multiple pages or routes.
