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

# Claude Code refuses --dangerously-skip-permissions when its process
# is uid 0 (root). Run as uid 1001 so the workflow's streamed workspace
# ownership matches this container user.
RUN useradd --create-home --uid 1001 --shell /bin/bash deepseek \
 && mkdir -p /work \
 && chown deepseek:deepseek /work

COPY run-deepseek.sh /usr/local/bin/run-deepseek
RUN chmod +x /usr/local/bin/run-deepseek

WORKDIR /work
USER deepseek

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/run-deepseek"]
