# Architecture

## Application Shape

Tech Sovereignty Radar is a static web application. It is authored with a Node.js toolchain, built into static assets, and served from a Docker container. The runtime must not require a Node.js server; Node is only for development, build, and tests.

## Baseline Stack

- Package manager: pnpm.
- Build tool: Vite.
- Language: TypeScript for interactive behavior and data transforms.
- UI: vanilla HTML, CSS, SVG, and TypeScript unless a spec explicitly justifies a framework.
- Styling: plain CSS with custom properties; no Tailwind, Sass, or component library by default.
- Data: versioned static JSON files in the repository.
- Runtime image: nginx:alpine or equivalent minimal static server.
- Container port: 8080.

## Build And Runtime Boundary

The build step produces a `dist/` directory containing HTML, CSS, JavaScript, fonts, images, and data files. The Docker image serves only the built static files. No source files, package caches, `node_modules`, secrets, or git metadata should be copied into the final runtime image.

## Data Model Direction

Radar entries are structured data, not hard-coded DOM. Each entry has a stable id, name, quadrant, ring, rationale, sovereignty factors, last-reviewed date, and release/version metadata. Position changes across releases should be representable as data so the app can show history and diffs.

## Testing Expectations

Specs that touch interaction or data transformation should include lightweight automated checks. Prefer unit tests for data validation and Playwright smoke tests for core rendered flows: page loads, radar renders, filtering/search works, and entry detail content is reachable.
