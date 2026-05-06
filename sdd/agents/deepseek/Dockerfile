# syntax=docker/dockerfile:1
#
# DeepSeek-backed Claude Code agent, packaged for one-shot use in CI.
#
# The container is built fresh each workflow run by
# .forgejo/workflows/workflow-agents.yml, so it is never pushed to a
# registry. The workflow streams the workspace into /work via
# `docker cp`, runs the agent, then streams the result back out.

FROM node:22-slim

ARG CLAUDE_CODE_VERSION=2.1.126
# Keep this in sync with the `packageManager` field in package.json at
# the repo root. The agent runs as a non-root user, so it cannot
# self-install pnpm at runtime — it must already be on PATH.
ARG PNPM_VERSION=10.33.2
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
# is uid 0 (root). Run as uid 1001 so the workflow's streamed workspace
# ownership matches this container user.
RUN useradd --create-home --uid 1001 --shell /bin/bash deepseek \
 && mkdir -p /work \
 && chown deepseek:deepseek /work

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npm install -g "playwright@${PLAYWRIGHT_VERSION}" \
 && playwright install-deps chromium \
 && playwright install chromium \
 && chown -R deepseek:deepseek /ms-playwright

COPY run-deepseek.sh /usr/local/bin/run-deepseek
RUN chmod +x /usr/local/bin/run-deepseek

WORKDIR /work
USER deepseek

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/run-deepseek"]
