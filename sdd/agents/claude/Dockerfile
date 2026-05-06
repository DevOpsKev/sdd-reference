# syntax=docker/dockerfile:1
#
# Anthropic Claude Code coding agent, packaged for one-shot use in CI.
#
# Same pattern as sdd/agents/vibe/: built fresh each workflow
# run by .forgejo/workflows/workflow-agents.yml, never pushed to a
# registry. The workflow streams the workspace in via `docker cp`,
# runs the agent, and streams results back out.

FROM node:22-slim

ARG CLAUDE_CODE_VERSION=2.1.126
# Keep this in sync with the `packageManager` field in package.json at
# the repo root. The agent runs as a non-root user, so it cannot
# self-install pnpm at runtime — it must already be on PATH.
ARG PNPM_VERSION=10.33.2
# Headless Chromium for Playwright (QA). Prefer same major as @playwright/test in repos.
ARG PLAYWRIGHT_VERSION=1.50.1

ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        jq \
        ripgrep \
        tini \
 && rm -rf /var/lib/apt/lists/*

# Docker CLI only (talks to host daemon via mounted /var/run/docker.sock).
COPY --from=docker:27-cli /usr/local/bin/docker /usr/local/bin/docker

RUN npm install -g "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}"

# pnpm is the repo's pinned package manager (see package.json
# `packageManager`). Install it via corepack and pin COREPACK_HOME to
# a world-readable system path so the cached pnpm tarball is visible
# to the non-root agent user at runtime — otherwise corepack falls
# back to the user's ~/.cache/node/corepack and re-downloads pnpm on
# first invocation, which both costs an agent turn and emits an
# alarming-looking "about to download" warning.
ENV COREPACK_HOME=/usr/local/share/corepack
RUN mkdir -p "$COREPACK_HOME" \
 && corepack enable \
 && corepack prepare "pnpm@${PNPM_VERSION}" --activate \
 && chmod -R a+rX "$COREPACK_HOME"

# Claude Code refuses --dangerously-skip-permissions when its process
# is uid 0 (root), as a deliberate Anthropic safety check. Run the
# agent as a non-root user with /work owned by it; the workflow tars
# the workspace in with matching ownership (--owner=1001 --group=1001)
# so claude can read and write the files it gets.
RUN useradd --create-home --uid 1001 --shell /bin/bash claude \
 && mkdir -p /work \
 && chown claude:claude /work

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npm install -g "playwright@${PLAYWRIGHT_VERSION}" \
 && playwright install-deps chromium \
 && playwright install chromium \
 && chown -R claude:claude /ms-playwright

COPY run-claude.sh /usr/local/bin/run-claude
RUN chmod +x /usr/local/bin/run-claude

WORKDIR /work
USER claude

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/run-claude"]
