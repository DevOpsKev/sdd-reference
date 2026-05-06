# Docker multi-stage production image

## Intent

Define the **canonical multi-stage `Dockerfile`** at the repository root for building and serving the **static production site** as a single OCI image: a **build stage** that runs the Node/pnpm toolchain and `pnpm build`, and a **minimal runtime stage** that serves only the built assets with **nginx** on **port 8080**. This spec is the dedicated home for **container build hygiene** (stages, layer caching, build context) so other specs (for example [`vite-baseline`](../vite-baseline/spec.md)) can stay focused on application shape while still deferring here for image mechanics.

Output must satisfy the **runtime contract** in [`sdd/context/deployment.md`](../../context/deployment.md) and the **Docker container** section of [`sdd/context/architecture.md`](../../context/architecture.md). Where this spec adds detail (for example `.dockerignore` rules), it must not contradict those documents.

## References

- [`sdd/context/architecture.md`](../../context/architecture.md) — multistage shape, `nginx:alpine`, no Node in production, port **8080**, no runtime env vars.
- [`sdd/context/deployment.md`](../../context/deployment.md) — image contents, `docker build` / `docker run` expectations, CI build order relative to `pnpm build`.
- [`sdd/specs/vite-baseline/spec.md`](../vite-baseline/spec.md) — baseline app, `pnpm build` → `dist/`, and high-level Docker bullets; this spec refines and owns the **Dockerfile** and **`.dockerignore`** requirements in full.
- Root [`Dockerfile`](../../../Dockerfile), [`nginx.conf`](../../../nginx.conf), [`package.json`](../../../package.json) (`packageManager` field for pnpm version).

## Requirements

### Multi-stage layout

- **`Dockerfile` at repository root** with **at least two stages** separated by `FROM`:
  1. **Build stage** — `FROM node:<version>-alpine` (or equivalent official Node Alpine image) with a **named stage** (for example `AS build`). `node` major version must match the **LTS line** described in `architecture.md` for the static app toolchain (today **20**; bump only when architecture is updated).
  2. **Runtime stage** — `FROM nginx:alpine` (or equivalent minimal static server). This stage must **not** install Node, pnpm, or application devDependencies.

### Build stage

- **`WORKDIR`** set (for example `/app`).
- **pnpm via Corepack** — `corepack enable` and `corepack prepare` for the **exact** pnpm version declared in root `package.json` **`packageManager`** (for example `pnpm@10.33.2`). Do not use an unpinned `pnpm@latest` in the Dockerfile; reproducible CI and local builds depend on the pin matching `packageManager`.
- **Dependency install before full source copy** — `COPY` **`package.json`** and **`pnpm-lock.yaml`** (and only what is required for `pnpm install --frozen-lockfile`) before copying the rest of the tree, so Docker layer caching works when lockfile and scripts are unchanged.
- **`RUN pnpm install --frozen-lockfile`** then copy remaining build context and **`RUN pnpm build`** (or the repo’s documented production build script if a later spec changes the script name—must still produce static output under **`dist/`** as today).

### Runtime stage

- **`COPY --from=<build-stage>`** the built site from **`/app/dist`** (or the build stage `WORKDIR` + `dist`) into **`/usr/share/nginx/html`** (or the path nginx is configured to use).
- **`COPY nginx.conf`** from the build context to **`/etc/nginx/conf.d/default.conf`** (or the documented nginx include path used by this repo).
- **`EXPOSE 8080`** — nginx must **listen on 8080**, not 80, per deployment contract (configured in `nginx.conf`).
- **`CMD`** starts nginx in the foreground (`daemon off;`).

### Build context and secrets

- **`.dockerignore` at repository root`** — must exist and exclude at minimum:
  - **`.git/`**
  - **`node_modules/`** (forces a clean install inside the image; avoids leaking host installs)
  - **`dist/`** (build output must come from the build stage, not stale host artifacts)
  - **`.env`, `.env.*`, and common local secret patterns** if present in the repo’s ignore conventions (so they are never sent as build context)
  - **Generated / CI artefact dirs** that bloat context or confuse builds, for example **`.tmp/`**, **`playwright-report/`**, **`test-results/`**, **`coverage/`** (adjust names to match what the repo actually generates)

- The Dockerfile must **not** `COPY` `.env` files, git metadata as a requirement for runtime, or API keys. Build args must not embed secrets.

### Observability and process model

- **Single process** in the final image: nginx, per `deployment.md`. No supervisor, no sidecar scripts in the image.

## Acceptance criteria

- [ ] Root **`Dockerfile`** builds successfully with **`docker build -t docker-multistage-verify .`** from a clean-enough tree (committed `pnpm-lock.yaml` present).
- [ ] **`docker history docker-multistage-verify`** (or equivalent) shows **more than one** `FROM` instruction / distinct base layers, demonstrating a multistage definition.
- [ ] **`docker run --rm -p <host-port>:8080 docker-multistage-verify`** serves **`GET /`** with **HTTP 200** (for example `curl -sf "http://127.0.0.1:<host-port>/"` succeeds). The response body must reflect the **current** production build (whatever the repo’s `pnpm build` outputs into `dist/`).
- [ ] Final image has **no Node.js runtime on `PATH`** for the default container command — for example **`docker run --rm docker-multistage-verify sh -c 'command -v node'`** exits non-zero or prints nothing (nginx Alpine may provide `sh`; use a check that proves `node` is not installed for serving).
- [ ] Root **`.dockerignore`** exists and lists the exclusion categories in **Build context and secrets** (concrete glob lines may vary; document any intentional omission in [`provenance.md`](./provenance.md)).
- [ ] [`sdd/specs/docker-multistage/provenance.md`](./provenance.md) exists after an agent run, documenting validation commands run, image size notes if measured, and any deviations, per repo provenance rules.

## Out of scope

- **Application features**, Vite configuration beyond what the build needs, and corpus-driven pipeline layout — covered by other specs and `architecture.md`.
- **CI workflow YAML** under `.github/workflows/` or `.forgejo/workflows/` (including registry **push**), registry choice, and hosting — `deployment.md`; this spec defines the **image build**, not where it is pushed.
- **SDD agent images** under **`sdd/agents/**`** — separate Dockerfiles and constraints per `AGENTS.md`.
- **Kubernetes, Compose stacks, health-check endpoints beyond nginx defaults**, runtime environment variables, and volumes — rejected by `deployment.md` unless architecture changes first.

## Notes

- **`vite-baseline`** already describes a multistage Dockerfile in outline; implementations should keep **one** production **`Dockerfile`** at the repo root and satisfy **both** that spec’s product checks and this spec’s container checks. If the two ever conflict, **`architecture.md`** wins; record the resolution in **`provenance.md`** and propose human edits to the specs.
