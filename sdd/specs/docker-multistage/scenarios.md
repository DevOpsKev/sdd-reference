---
title: Docker multi-stage production image — Test Scenarios
spec: sdd/specs/docker-multistage
---

# Test Scenarios

This document describes the test scenarios for the Docker multi-stage production image specification. Tests are implemented in **`e2e/docker-multistage.spec.ts`** and can be run with **`pnpm test:e2e`**.

## Overview

The test suite verifies both static configuration (via file inspection) and runtime behavior (via Docker commands). Static tests run in any checkout; runtime tests need a working **Docker CLI** and a reachable daemon. **Workflow agents** ship the Docker CLI and mount **`/var/run/docker.sock`** with **`--group-add`** matching the socket’s GID (see `.forgejo/workflows/workflow-agents.yml` and `sdd/scripts/run-agent-local.sh`) so QA can run **`pnpm test:e2e`** including **`docker build`** / **`docker run`** against the host daemon.

## Test Execution

**Command:** `pnpm exec playwright test e2e/docker-multistage.spec.ts`

**Expected:** 20 tests pass (16 static + 4 runtime) when Docker is available on the machine running Playwright. Without Docker, the serial runtime block fails fast on `docker build`.

## Static Verification Scenarios

These scenarios verify configuration correctness through file inspection without requiring Docker.

### Scenario 1: Dockerfile Structure
**Intent:** Verify the Dockerfile exists and has proper multistage structure
**Spec reference:** Requirements § Multi-stage layout, Acceptance criteria bullet 2
**Status:** ✅ PASS

**Test cases:**
1. `Dockerfile exists at repository root` — ✅ PASS
2. `Dockerfile has multistage build with build and runtime stages` — ✅ PASS
   - Verified at least two `FROM` instructions present
   - Confirmed named build stage: `FROM node:20-alpine AS build`
   - Confirmed runtime stage: `FROM nginx:alpine`

### Scenario 2: Build Stage Configuration
**Intent:** Verify build stage follows Node/pnpm best practices for layer caching
**Spec reference:** Requirements § Build stage
**Status:** ✅ PASS

**Test cases:**
1. `Build stage uses Node 20 Alpine` — ✅ PASS
   - Verified base image: `node:20-alpine` (matches LTS requirement)
2. `Build stage sets WORKDIR` — ✅ PASS
   - Confirmed `WORKDIR` instruction present
3. `Build stage uses corepack with exact pnpm version from package.json` — ✅ PASS
   - Verified `corepack enable` present
   - Verified `corepack prepare pnpm@10.33.2` matches `package.json` `packageManager` field
4. `Build stage copies package files before source for layer caching` — ✅ PASS
   - Verified instruction order:
     1. `COPY package.json pnpm-lock.yaml`
     2. `RUN pnpm install --frozen-lockfile`
     3. `COPY . .`
     4. `RUN pnpm build`
5. `Build stage uses --frozen-lockfile flag` — ✅ PASS
   - Confirmed `pnpm install --frozen-lockfile` present

### Scenario 3: Runtime Stage Configuration
**Intent:** Verify runtime stage uses nginx:alpine with correct configuration
**Spec reference:** Requirements § Runtime stage
**Status:** ✅ PASS

**Test cases:**
1. `Runtime stage copies built dist from build stage` — ✅ PASS
   - Verified: `COPY --from=build /app/dist /usr/share/nginx/html`
2. `Runtime stage copies nginx.conf` — ✅ PASS
   - Verified: `COPY nginx.conf /etc/nginx/conf.d/default.conf`
3. `Runtime stage exposes port 8080` — ✅ PASS
   - Verified: `EXPOSE 8080`
4. `Runtime stage starts nginx with daemon off` — ✅ PASS
   - Verified: `CMD ["nginx", "-g", "daemon off;"]`

### Scenario 4: nginx Configuration
**Intent:** Verify nginx.conf meets deployment contract
**Spec reference:** Requirements § Runtime stage, sdd/context/deployment.md § Runtime contract
**Status:** ✅ PASS

**Test cases:**
1. `nginx.conf exists at repository root` — ✅ PASS
2. `nginx.conf listens on port 8080` — ✅ PASS
   - Verified: `listen 8080;` present (not default port 80)

### Scenario 5: Build Context Exclusions
**Intent:** Verify .dockerignore prevents sensitive and unnecessary files from build context
**Spec reference:** Requirements § Build context and secrets, Acceptance criteria bullet 5
**Status:** ✅ PASS

**Test cases:**
1. `.dockerignore exists at repository root` — ✅ PASS
2. `.dockerignore excludes required patterns` — ✅ PASS
   - Verified presence of all required patterns:
     - `.git/` (version control)
     - `node_modules/` (force clean install)
     - `dist/` (build output must come from build stage)
     - `.env` and `.env.*` (secrets)
     - `.tmp/`, `playwright-report/`, `test-results/`, `coverage/` (generated artifacts)
3. `Dockerfile does not copy .env files` — ✅ PASS
   - Verified no explicit `COPY .env` commands in Dockerfile

## Runtime Verification Scenarios (Docker Required)

These scenarios require Docker CLI and a daemon the test process can drive (local Docker Desktop, Linux CI with Docker, or a **workflow agent** container with **`/var/run/docker.sock`** mounted and **`--group-add`** matching the socket GID — see `.forgejo/workflows/workflow-agents.yml` and `sdd/scripts/run-agent-local.sh`). Agent images install the Docker CLI from **`docker:27-cli`** (binary only).

### Scenario 6: Docker Build Success
**Intent:** Verify the Dockerfile builds successfully without errors
**Spec reference:** Acceptance criteria bullet 1
**Status:** ✅ PASS (automated)

**Test case:** `docker build succeeds` — Playwright runs `docker build -t docker-multistage-e2e:<random> .` from the repository root (BuildKit enabled).

**Manual equivalent:**
```bash
docker build -t docker-multistage-verify .
```
**Expected result:** Build completes with exit code 0

### Scenario 7: Multistage Layer Verification
**Intent:** Verify `docker history` reflects a multistage build (e.g. `COPY --from=build` / `dist`)
**Spec reference:** Acceptance criteria bullet 2
**Status:** ✅ PASS (automated)

**Test case:** `docker history shows multistage layers` — asserts `docker history --no-trunc <tag>` matches `/--from=\s*build|from build|\/app\/dist/i`.

**Manual equivalent:**
```bash
docker history docker-multistage-verify
# Expect a layer mentioning --from=build or /app/dist
```

### Scenario 8: HTTP Server Runtime Behavior
**Intent:** Verify nginx answers HTTP inside the running container on port 8080
**Spec reference:** Acceptance criteria bullet 3, sdd/context/deployment.md § Runtime contract
**Status:** ✅ PASS (automated)

**Test case:** `running container serves HTTP 200 on port 8080` — `docker run -d` then `docker exec` probes `http://127.0.0.1:8080/` using `wget`, host `curl`, or `apk add curl` fallback (avoids relying on published ports on the Docker host when using a remote socket).

**Manual equivalent (host has port publish):**
```bash
docker run --rm -p 8080:8080 docker-multistage-verify
# other terminal: curl -sf http://127.0.0.1:8080/
```

### Scenario 9: No Node.js in Runtime Image
**Intent:** Verify final image contains nginx only, no Node.js runtime
**Spec reference:** Acceptance criteria bullet 4, Requirements § Runtime stage
**Status:** ✅ PASS (automated)

**Test case:** `final image has no Node.js runtime` — `docker run --rm <tag> sh -c 'command -v node'` must fail (non-zero exit).

**Manual equivalent:**
```bash
docker run --rm docker-multistage-verify sh -c 'command -v node'
# Should fail or print nothing

docker run --rm docker-multistage-verify sh -c 'command -v nginx'
# Should print /usr/sbin/nginx
```

## Summary

**Total scenarios:** 9
**Static verification (file inspection):** 5 scenarios, 16 test cases — **all expected to pass** when the repo matches the spec
**Runtime verification (Docker CLI):** 4 scenarios — **automated** in `e2e/docker-multistage.spec.ts` when Docker is available

**Confidence level:** HIGH for static configuration; HIGH for runtime once Docker is available (same checks agents and developers run via `pnpm test:e2e`).

## Test Artifacts

**Test file location:** `e2e/docker-multistage.spec.ts`
**Test command:** `pnpm test:e2e` (runs all e2e tests) or `pnpm exec playwright test e2e/docker-multistage.spec.ts` (this spec only)
**Dependencies:** `@playwright/test` (pinned to v1.50.1 in package.json, installed via pnpm)

## Notes

- Tests use `@playwright/test` but static verification does not require a browser (file inspection via Node).
- Runtime scenarios invoke the **`docker`** CLI; workflow agents carry the CLI and use a mounted Docker socket so QA can run **`pnpm test:e2e`** inside the agent.
- All acceptance criteria from the spec are covered by automated tests when Docker is available; manual commands above remain useful for debugging.
