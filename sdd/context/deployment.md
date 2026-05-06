# Deployment

## Principle

Deployment is the simplest part of this project. The build pipeline produces a single OCI-compatible Docker image; the image listens on TCP/8080 and serves the entire site. Anywhere capable of running an OCI image with a port published can host Vinyl Traffic.

This document captures the deployment-side decisions we have made and the ones we have deliberately left open. The architecture is fixed (see `sdd/context/architecture.md`); the deployment target is not — and we expect to revisit the choice as the project moves from experiment to running operation.

**CI hosts:** The project uses **both** **GitHub Actions** and **Forgejo Actions** (Gitea-compatible). The same build-and-image contract applies on each; pipelines may differ only in path, secret names, and registry URLs. Either host can build, tag, and push the image; operators choose which pipeline gates a given branch or promotion path.

## The runtime contract

The build artefact is a single Docker image, around 50 MB, built from the multistage `Dockerfile` at the repository root. It contains `nginx:alpine`, the built static site at `/usr/share/nginx/html`, and an `nginx.conf` at `/etc/nginx/conf.d/default.conf`. Nothing else.

The runtime contract:

- Listens on **TCP/8080**.
- Accepts **no environment variables**.
- Requires **no volumes**.
- Requires **no shell access**.
- Requires **no init scripts**.
- **Terminates no TLS.**
- Has **no persistent state**.
- Runs as a **single process** (nginx).

Anything beyond this contract belongs in front of the container, not in it. Future feature specs that propose runtime configuration, persistence, or background processes need to argue for changes to architecture.md first; this contract is the deployment surface specs are allowed to assume.

## Build and tag

```
docker build -t vinyltraffic:$(git rev-parse --short HEAD) .
docker tag vinyltraffic:$(git rev-parse --short HEAD) vinyltraffic:latest
```

Tags use the git short SHA for traceability and `latest` for convenience. CI on **GitHub** and **Forgejo** tags every push to **main** (when those workflows are enabled); locally a developer produces the same image deterministically. There is no separate "release" workflow — every commit on main that passes tests is releasable.

## Push

The image is pushed to an OCI-compliant container registry. We have not committed to a single registry for all hosts. Candidates:

- **GitHub Container Registry (ghcr.io)** — pairs with GitHub Actions; free tier for public repos.
- **Forgejo / Gitea Container Registry** — pairs with a self-hosted Forgejo instance when the registry feature is enabled; same OCI push/pull as any registry.
- **Docker Hub** — universal but rate-limited on free tier.
- **Fly.io built-in registry** — convenient if Fly is the deploy target.
- **Cloudflare Registry** — convenient if Cloudflare is the edge.

The choice is made per hosting story and recorded in this document at that point (which registry **GitHub** CI pushes to, which **Forgejo** CI pushes to, and whether they are the same or different). Any OCI-compliant registry is acceptable; switching later is straightforward because nothing in the build references the registry by name.

## Run

`docker run -p 8080:8080 vinyltraffic` brings up the entire site at `http://localhost:8080`. No flags beyond port mapping are required. There are no environment variables to set, no volumes to mount, no commands to override.

Logs go to stdout and stderr. The nginx access log records every request; the error log records nothing under normal operation. The host (or PaaS) is responsible for log collection if any is wanted.

There is no health-check endpoint beyond nginx's default behaviour, because nothing can fail at runtime that nginx itself does not.

## In front of the container

The container does not terminate TLS. Something in front of it must. Three broad options:

- **A reverse proxy on the same host** — Caddy, Traefik, or nginx itself in a separate process. Suitable for VPS / dedicated-server deploys.
- **A CDN with origin pull** — Cloudflare, Fastly, Bunny. Suitable when caching at the edge is wanted.
- **A PaaS that handles TLS automatically** — Fly, Railway, Render, Cloudflare Containers. Suitable when the deployment target is doing the TLS work for us.

For the self-hosted path, **Caddy is the recommended option**. It obtains and renews Let's Encrypt certificates automatically, requires a few lines of Caddyfile, and has effectively zero ongoing maintenance. Unless there's a specific reason to prefer Traefik or nginx-on-the-host, use Caddy.

## Deployment targets

We have not committed to one. The architecture supports any of the following; the runtime contract above is the only constraint.

| Target                                  | Notes                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| **Fly.io**                              | `flyctl deploy`; built-in TLS; cheap; minimal config; good fit for "single image, no state." |
| **Railway / Render**                    | Click-deploy from git; less control than Fly; similar pricing.                         |
| **Hetzner / DigitalOcean / OVH droplet + Caddy** | Cheapest at scale; requires a Linux box; manual but stable.                     |
| **Cloudflare Containers**               | Newer; origin-pull from a registry; pairs with Cloudflare's edge if already in use.    |
| **Self-hosted on existing infra**       | `docker run` on whatever box already exists.                                           |

None of these is currently chosen. Each is viable. The project's runtime contract is intentionally minimal so that switching between them is straightforward — the cost of changing target is roughly one afternoon, not one quarter.

When the choice is made, this section is updated to record which target is in use, the registry(ies) each CI host pushes to, and the operator-facing deployment command (e.g. `flyctl deploy`, `docker stack deploy`). Record both **GitHub** and **Forgejo** workflow entrypoints if both build or deploy the image.

## CI

The **same target shape** runs on **both** platforms — on every push to **main** (or on the schedule each team chooses), the pipeline:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint` (when present in `package.json`)
3. `pnpm test` (when present in `package.json`)
4. `pnpm build`
5. `docker build`
6. `docker push` to the registry configured for that host

### GitHub Actions

- Workflow path: **`.github/workflows/`** (for example `.github/workflows/build.yml` for build-and-push; other workflows may exist for SDD agents or housekeeping).
- Secrets: **GitHub Actions secrets** (repository or organisation scope) for registry credentials and any deploy tokens.
- Runners: GitHub-hosted or self-hosted; must support Docker if the pipeline builds images in-job.

### Forgejo Actions

- Workflow path: **`.forgejo/workflows/`** (Forgejo / Gitea Actions; YAML similar to GitHub Actions with minor differences). Example: `.forgejo/workflows/build.yml` for build-and-push, alongside existing workflows such as workflow agents.
- Secrets: **Forgejo** (or Gitea-compatible) **Actions secrets** at the repository (or instance) level — same role as GitHub Secrets.
- Runners: the project's Forgejo runner setup (including Docker socket where required for `docker build`).

CI may be **partially implemented** on one host before the other; when each exists, its workflow file path is named here. The agents are expected to keep **each** configured pipeline green; the methodology has no shortcut for "ignore the failing pipeline" on either host.

Build-time registry credentials are **not** in the repo — they live in **GitHub Secrets** and **Forgejo Actions secrets** (or equivalent on whichever host runs the job).

## Non-goals

Deployment choices we have rejected. Each is a permanent decision, not a deferred one:

- **Kubernetes, Helm charts, or any container orchestration.** The project is one image, one port, no state — orchestration is not appropriate at this scale.
- **Multiple environments** (staging, preview-per-branch, dev-mirror). One production deployment of the latest commit on main is the entire deployment shape. Local Docker is the staging environment.
- **Observability beyond nginx access logs.** No Prometheus, Grafana, Sentry, Datadog, OpenTelemetry, or third-party telemetry. If something breaks at this scale, it breaks visibly.
- **Secrets management at runtime.** There are no runtime secrets. Build-time registry credentials are managed by the CI system (**GitHub Actions secrets**, **Forgejo Actions secrets**, or equivalent) and are not project concerns.
- **Backup and disaster recovery procedures.** The content corpus is in git; the image is reproducible from git; there is no runtime state. The disaster recovery procedure is "rebuild from main."
- **Auto-scaling, load balancing, multi-region deployment.** The traffic does not warrant any of these. A single small instance handles current and projected demand with no attention.
- **Custom health-check endpoints.** Nothing fails that the process supervisor or PaaS does not already detect.

These are deliberate constraints. Any change requires a corresponding update to architecture.md and a feature spec arguing for the change.
