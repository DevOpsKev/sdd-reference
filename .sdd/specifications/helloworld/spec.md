# Hello World — 80s Vibe Container

## Intent
A minimal containerised web app that displays "Hello, World!" with unapologetic 80s aesthetic.

## Requirements
- Static page served from a container (nginx:alpine base or similar minimal image).
- Renders "Hello, World!" prominently.
- 80s visual treatment: neon palette (magenta, cyan, lime), grid/horizon floor, scanlines, retro display font, glow on the heading.
- Container exposes port 8080. Configure the web server to listen on 8080 (override any default port).
- `docker build -t hello . && docker run -p 8080:8080 hello` serves the app at http://localhost:8080.
- All assets bundled — no external CDN calls.

## Acceptance criteria
- `Dockerfile` at repo root.
- Static assets under `app/` (`index.html`, `styles.css`).
- Final image under 50 MB.
- HTTP GET to / returns 200 with body containing "Hello, World!".

## Out of scope
- TLS, auth, persistence, observability.
