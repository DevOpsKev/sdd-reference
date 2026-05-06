# Architecture

## Principle

Vinyl Traffic is a static website. We generate flat HTML from a corpus of spec files and serve it from an nginx container. There is no application server, no database, no client-side framework, and no runtime indirection between source and rendered output.

The entire site is a build pipeline: spec files in, HTML out. This shape is deliberate. It matches what the unit actually does — we produce printed documents and ship them. It keeps the spec-to-output mapping visible. It minimises the surface where things can go wrong. The site is meant to *look* like documents on a desk; it is also *built* like documents on a desk — produced once, then handed off.

The architecture has four layers and the boundaries between them matter:

- **`sdd/`** — the methodology layer. Specifications, the content corpus that becomes site content, ambient context documents, and agent orchestration. Read by humans and by SDD agents.
- **`src/`** — the application layer. HTML templates, CSS, and a small handful of optional JavaScript islands. Derived from specs.
- **`build/`** — the pipeline. Reads from `sdd/`, applies templates from `src/`, writes to `dist/`. Around 200 lines of TypeScript.
- **`dist/`** — the build output. Gitignored. Served by nginx in production. Written every build, never edited by hand.

When in doubt about where something belongs, ask: *is this a description of what the site should be (sdd), is this code that produces the site (src or build), or is this the produced site itself (dist)?*

## Implementation status

This document describes the **target architecture**. The project reaches that state in steps, each delivered by a feature specification under `sdd/specs/`.

Today, the project is at the **vite-baseline** stage: a vanilla Vite + TypeScript app with a single `index.html` at the repository root, plain CSS imported from `src/main.ts`, and a multistage Dockerfile that serves the built `dist/` from nginx. See `sdd/specs/vite-baseline/spec.md` for what that stage establishes and `sdd/specs/vite-baseline/provenance.md` for how it was implemented.

The transition from the baseline toolchain to the corpus-driven build described in the rest of this document is delivered by a **forthcoming feature specification** under `sdd/specs/` (directory name TBD when the spec is authored). That work introduces `build/build.ts`, the content loader, the template-literal rendering layer, and multi-page output. Subsequent domain feature specs (homepage, stock-card, friday-note, and so on) build on top of that pipeline.

Agents reading this document should treat the architecture below as the authoritative target. Where the current implementation differs from the target, the gap is the work of the open feature specs, not a contradiction in the architecture.

## Layout

> **Target directory layout.** The tree below is the **end state** after the corpus pipeline and `sdd/content/` exist. **vite-baseline** may only have a subset (for example root `index.html`, `src/main.ts`, `src/style.css`, `vite.config.ts`, `Dockerfile`, `nginx.conf`, and `sdd/specs/vite-baseline/`).

The target directory layout is:

```
.
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts                # asset bundling only; not used for routing
├── Dockerfile                    # multistage: build stage + nginx serve stage
├── nginx.conf                    # nginx configuration for the serve stage
├── .dockerignore
│
├── sdd/                          # methodology layer
│   ├── agents/                   # docker setups per agent provider
│   ├── context/                  # ambient documents agents always have loaded
│   │   ├── product.md
│   │   ├── architecture.md       # this file
│   │   ├── design-system.md
│   │   ├── deployment.md
│   │   ├── glossary.md
│   │   ├── voice.md              # forthcoming
│   │   └── sleeves.md            # forthcoming
│   ├── reference/                # fixed mockups & notes — read-only for agents; not in prod build
│   │   ├── vision.md
│   │   └── vision.html
│   ├── content/                  # the corpus that becomes site content
│   │   ├── stock/                # *.yaml — one record per file
│   │   ├── racks/                # *.yaml — one rack per file (A through F)
│   │   ├── notes/                # *.md — one Friday note per week
│   │   ├── under-counter/        # *.yaml — confidential listings
│   │   └── pages/                # *.md — one-off pages (about, find-us)
│   ├── specs/                    # per-feature specifications
│   │   ├── vite-baseline/
│   │   │   ├── spec.md
│   │   │   └── provenance.md
│   │   ├── homepage/             # forthcoming (example)
│   │   │   ├── spec.md
│   │   │   ├── provenance.md
│   │   │   └── homepage.spec.ts
│   │   └── …                     # further specs + forthcoming pipeline spec (see Implementation status)
│   ├── scripts/                  # methodology / agent orchestration scripts
│   └── README.md
│
├── src/                          # application code
│   ├── templates/                # HTML templates, one per page or component
│   ├── styles/                   # CSS files
│   ├── islands/                  # optional vanilla TS for interactive bits
│   └── public/                   # static assets — fonts, favicon, robots.txt
│
├── build/                        # the build pipeline
│   ├── build.ts                  # entry point: pnpm build
│   ├── load-content.ts           # reads sdd/content/*
│   ├── render.ts                 # template rendering
│   └── write-pages.ts            # emits files to dist/
│
└── dist/                         # gitignored — the built site
    ├── index.html
    ├── stock/
    ├── notes/
    ├── styles/
    ├── fonts/
    └── ...
```

## The build pipeline

> **Target state only.** This section describes the repository *after* the corpus-driven static-site pipeline exists (`build/build.ts`, content loading from `sdd/content/`, templates under `src/templates/`, multi-page `dist/`). While the project remains on **vite-baseline** (*Implementation status* above), there is no `build/` directory yet: **`pnpm build`** is **`vite build`**, **`pnpm dev`** is the Vite dev server, and the steps below are the **design** for the next implementation phase — not requirements for the baseline spec.

The build runs as a single TypeScript script and produces a static site in `dist/`. It is intentionally small — agents reading `build/build.ts` should be able to hold the whole pipeline in their head.

Pipeline steps, in order:

1. **Load content.** Walk `sdd/content/` and read every YAML and Markdown file into typed objects. Validate against the schemas declared in their respective feature specs. A stock entry without a `code` field fails the build; a Friday note without a date fails the build. Validation errors are reported with file path and line where possible.
2. **Resolve cross-references.** A stock entry may reference a rack (`rack: A`); the build resolves the reference and fails if the target does not exist. Same for couriers, formats, pressings, and any other primitive that stock entries point at.
3. **Render pages.** For each page type defined in a feature spec, the build calls a template function that takes typed content and returns an HTML string. Templates are JavaScript template literals, not a templating language.
4. **Apply layout.** Every page is wrapped in a shared layout template that emits the docket strip, masthead, navigation, and footer. The layout is also a template literal in `src/templates/layout.ts`.
5. **Bundle styles and islands.** Vite is invoked as a library to bundle `src/styles/` into a single CSS file and `src/islands/` into one or more small JS bundles. Output goes to `dist/assets/` with content-hashed filenames.
6. **Copy public assets.** `src/public/` is copied verbatim to `dist/`.
7. **Write the pages.** Each page is written to its final path in `dist/`. URLs are clean: a record at `sdd/content/stock/vtr-stk-0847.yaml` becomes `dist/stock/vtr-stk-0847/index.html`, served at `/stock/vtr-stk-0847/`.
8. **Generate the sitemap and feeds.** A `sitemap.xml` and an RSS feed for the Friday notes are written from the loaded content. No external dependencies.

The build is fully deterministic. Running it twice produces byte-identical output. There is no incremental build; the full site rebuilds on every invocation. At the size of this site (~300 records, a handful of pages, a few dozen Friday notes) a clean build takes a few seconds.

## The content corpus

> **Target state only.** The `sdd/content/` corpus and the behaviours below apply once the pipeline in *The build pipeline* exists. **vite-baseline** does not require `sdd/content/` or multi-page generation.

`sdd/content/` is the data layer. It is the closest thing this project has to a database — and unlike a database, it is plain text under version control, reviewable as pull requests, and editable by anyone with a text editor.

| Directory                    | File type | Contents                                              |
| ---------------------------- | --------- | ----------------------------------------------------- |
| `sdd/content/stock/`         | YAML      | One file per record currently in the stockroom.       |
| `sdd/content/racks/`         | YAML      | A through F. Each declares its character and contents.|
| `sdd/content/notes/`         | Markdown  | One Friday note per week, named `YYYY-Www.md`.        |
| `sdd/content/under-counter/` | YAML      | Confidential stock entries, displayed redacted.       |
| `sdd/content/pages/`         | Markdown  | One-off pages — about, find-us, manifesto.            |

The file-naming conventions are part of the architecture. A new record is added by creating a new YAML file under `sdd/content/stock/`; the build picks it up automatically. There is no registry, no index file to update, no manifest to keep in sync. The filesystem is the index.

Schema definitions for each content type live in the feature spec that consumes them. The schema for stock entries lives in `sdd/specs/stock-card/spec.md`; the schema for racks lives in `sdd/specs/rack/spec.md`; and so on. The build script imports these schemas (as TypeScript types and runtime validators using `yaml`) to validate the corpus.

Cross-references between content types use simple string keys, never paths or imports. A stock entry that lives on rack A references `rack: A`, not `rack: ./racks/A.yaml`. The build resolves the key against the loaded rack corpus.

## Templates

> **Target state only.** Template functions under `src/templates/` apply once the corpus pipeline renders pages from content. **vite-baseline** may use a single root `index.html` without this layout.

Templates are JavaScript template literals in TypeScript files. They are not a templating language. This is deliberate.

A template is a function that takes typed content and returns an HTML string. It uses standard ES template literal syntax with interpolation, conditionals via ternaries, and iteration via `.map().join('')`. The "language" is JavaScript; the template is just a function that happens to return a string.

Trade-offs and reasons for this choice:

- **Zero dependency.** No runtime, no parser, no compile step.
- **Type-safe inputs.** TypeScript checks that templates receive the right shape of data. A typo in a field name fails at build, not at render.
- **Total transparency.** Anyone reading a template sees exactly what it produces. There is no hidden magic in a template-engine compile pass.
- **Composable.** A page template calls a layout template, which calls a stamp template, which is just another function. No partials, no helpers, no registration.

The trade-off is that escaping HTML and avoiding XSS is the template author's responsibility. We mitigate this by providing a small `escape()` helper in `build/render.ts` and requiring all interpolated content to go through it. Static strings in templates are exempt because they are static.

Templates live in `src/templates/` and follow a flat naming convention:

```
src/templates/
├── layout.ts            # the page wrapper
├── homepage.ts          # the homepage
├── stock-card.ts        # a single record's page
├── stock-list.ts        # the stockroom grid
├── friday-note.ts       # one note's page
├── note-archive.ts      # all notes
├── about.ts
├── find-us.ts
└── partials/
    ├── stamp.ts
    ├── docket-strip.ts
    ├── masthead.ts
    └── ...
```

Partials are small reusable templates — a stamp, a docket strip, a status indicator. They are functions called by larger templates.

## Styles

The site is plain CSS. **No CSS framework (Tailwind CSS, DaisyUI, Bootstrap, Bulma, Foundation, or similar) and no CSS preprocessor (Sass, LESS, Stylus, or PostCSS-as-build-step) is used by this project at any stage.** This is a permanent constraint, not a deferred decision.

> **Target file layout.** The multi-file `src/styles/` tree below and the token sync check apply once that structure exists. **vite-baseline** may use a single hand-authored stylesheet (e.g. `src/style.css`) while still obeying the permanent constraint above.

The CSS is a small set of files in `src/styles/`:

```
src/styles/
├── tokens.css           # custom properties from design-system.md
├── reset.css            # minimal reset
├── base.css             # body, paper grain, defaults
├── components.css       # stamps, tape, sharpie, status indicators
├── pages.css            # page-specific styling
└── index.css            # imports all of the above
```

`tokens.css` is the canonical implementation of the tokens declared in `sdd/context/design-system.md`. Any change to a colour, type-scale value, or spacing constant must update both files; the build verifies that every token in design-system.md has a matching CSS variable in tokens.css.

Vite bundles `src/styles/index.css` into a single minified `dist/assets/styles.<hash>.css`. The HTML templates link to this file. We do not use scoped styles, CSS modules, or any form of CSS-in-JS. Autoprefixer and PostCSS are not added as direct dependencies; they may exist transitively through Vite's defaults but are not configured by this project.

## Islands

> **Target state only.** `src/islands/` and the table below apply once multi-page templates load scripts. **vite-baseline** may ship with no islands.

The site has almost no JavaScript. Every page works without JS — including the Friday note signup form, which falls back to a `mailto:` link if no script is loaded.

Where small interactivity is genuinely needed, we add a vanilla TypeScript file under `src/islands/` and load it with `<script type="module" defer>` from the templates that need it. Each island is self-contained — no shared state, no framework, no virtual DOM, no router. Vite bundles each island as a separate chunk.

Currently planned islands:

| Island                        | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `friday-note-form.ts`         | POST the Friday-note signup to Buttondown.           |
| `(future) stock-search.ts`    | Client-side search across stock JSON.                |

Anything else has to be argued for in its own feature spec. The default is no JavaScript.

**No client-side JavaScript framework is used by this project at any stage. No React, Vue, Svelte, Solid, Lit, Preact, Alpine, Petite Vue, Stimulus, HTMX, or similar.** Each island is plain DOM code. The friction of writing islands by hand is itself a useful constraint — it discourages building things that don't need to exist.

## The Docker container

The site ships as a single Docker image. The Dockerfile is multistage: one stage builds, the next serves.

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

The serve image is around 50MB (nginx:alpine plus the built site) and contains nothing but nginx and the static files. There is no Node runtime in production. There is no shell access required to operate the container.

`nginx.conf` configures: nginx listening on **port 8080** (not the default 80, so the container can run unprivileged); clean URLs (a request for `/stock/vtr-stk-0847/` serves `/stock/vtr-stk-0847/index.html`); gzip compression; sensible cache headers (long-lived for assets with content-hashed filenames, short for HTML); and a 404 page that uses the same layout as the rest of the site. It does not configure HTTPS — TLS termination happens at the reverse proxy or CDN in front of the container.

A single `docker run -p 8080:8080 vinyltraffic` brings up the entire site locally. There are no environment variables required at runtime. There is no startup script. There is no health-check endpoint beyond nginx's default behaviour, because there is nothing that can fail at runtime that nginx itself does not.

## Local development

### Current (vite-baseline)

| Command        | Purpose |
| -------------- | ------- |
| `pnpm dev`     | Vite development server (host/port per Vite; commonly `http://localhost:5173/`). |
| `pnpm build`   | `vite build` — production assets to `dist/`. |
| `pnpm preview` | `vite preview` — serve `dist/` locally for inspection. |

### Target (after corpus pipeline exists)

| Command         | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `pnpm dev`      | Watch-mode pipeline (`build/build.ts`) and Vite dev server on `:5173` — rebuilds `dist/` on changes to `sdd/content/`, `src/templates/`, or `src/styles/`. |
| `pnpm build`    | One-shot production build to `dist/` via the pipeline entrypoint. |
| `pnpm preview`  | Serve `dist/` locally to inspect the production build.        |
| `pnpm test`     | Run Playwright against the built site.                        |
| `pnpm lint`     | TypeScript typecheck plus spec validation.                    |

In the **target** setup, `pnpm dev` runs `build/build.ts` in watch mode and serves the result via a Vite dev server with hot reload for CSS. Template changes trigger a full rebuild and browser reload.

A separate `pnpm dev:agent` runs the build inside the agent container with the methodology layer mounted, mirroring how agents see the project when working autonomously. See `sdd/agents/README.md` for details.

## Testing and acceptance criteria

> **Target validation model.** The three mechanisms below describe how feature work is verified *once* the corpus pipeline and optional Playwright layout under `sdd/specs/<feature>/` exist. **vite-baseline** uses whatever its own `spec.md` and root `package.json` require (for example `pnpm build` only, or tests under `e2e/` if added later).

Every feature spec ends with a list of **acceptance criteria** — checkbox items that declare what "done" means for that feature. Acceptance criteria are written so that a human or QA agent can verify each one by inspection or by running a command. They are the contract between the spec and any agent implementing it.

Acceptance criteria are validated three ways:

1. **By machine, via Playwright tests** co-located with the feature spec at `sdd/specs/<feature>/<feature>.spec.ts` when the project is configured that way. Playwright may use `testDir: 'sdd/specs'` and discover `*.spec.ts` files recursively. Each test file references the spec it validates by relative path in a top-of-file comment. Tests assert against the built site running in a local server (either `pnpm preview` or `vite preview`), not against running source.
2. **By machine, via the build itself.** Schema validation, cross-reference resolution, and the design-system / CSS token sync are enforced at build time once those checks exist. A failing build is a CI failure.
3. **By a QA agent or human reviewer**, who reads `provenance.md` (see below) and checks each acceptance criterion against the produced artefact.

A failing build is a CI failure. A failing test is a CI failure. The agents are expected to keep both green; the methodology has no shortcut for "ignore the failing test."

## Provenance

Every feature spec under `sdd/specs/<feature>/` produces a `provenance.md` alongside it whenever an agent (or a human) implements or modifies the spec. Provenance is the audit trail.

A `provenance.md` records:

- **What was attempted.** The spec being implemented, the agent that ran, the date.
- **What was done.** The concrete file changes — created, modified, deleted — with paths and a short description of each.
- **What was validated.** Which acceptance criteria were checked off and how (build output, test pass, manual inspection). Failed or skipped criteria are recorded explicitly with rationale.
- **What was deviated.** Any place the implementation departs from the spec, with reason. Deviations either result in a follow-up spec to ratify the change or are reverted.
- **What was produced.** Output artefacts (built `dist/`, image tags, deploy URLs) where relevant.

`provenance.md` is committed to version control alongside the spec. It is written by the implementing agent at the end of a run. QA agents and human reviewers read it as the first stop when validating a spec was correctly implemented. The file has no fixed schema — it is structured Markdown, free-form within the categories above.

The combination of **`spec.md`** (intent), **`<feature>.spec.ts`** (machine-checked assertions, when present), and **`provenance.md`** (audit trail) is the SDD validation triangle. Feature specs should produce the artefacts their `spec.md` requires before being considered complete.

## Non-goals

Architectural choices we have rejected. Each is a permanent decision, not a deferred one:

- We do not run an application server in production. Nginx serves static files; that is the entire production runtime.
- We do not run a database. The content corpus under `sdd/content/` is the database.
- We do not use a client-side JavaScript framework (React, Vue, Svelte, Lit, Solid, Preact, Alpine, Petite Vue, Stimulus, HTMX, or similar).
- We do not use a CSS framework (Tailwind CSS, DaisyUI, Bootstrap, Bulma, Foundation, or similar).
- We do not use a CSS preprocessor (Sass, LESS, Stylus, or similar).
- We do not use a templating language (Mustache, Handlebars, EJS, Nunjucks, Liquid, or similar). Templates are TypeScript template literals.
- We do not use a CMS. Content is edited as files in the repo and reviewed via pull request.
- We do not implement client-side routing. Every URL maps to a real file in `dist/`.
- We do not run analytics, monitoring beyond nginx access logs, error tracking, or any third-party JavaScript.
- We do not build incremental rebuilds, hot module replacement for templates, or developer-experience optimisations that have not yet been needed.
- We do not deploy preview environments per branch, A/B test variants, or run multiple production builds. There is one site, and it is the one in the container.

These are deliberate constraints. Any change to this list requires a corresponding update to product.md and a feature spec arguing for the change.
