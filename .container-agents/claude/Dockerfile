# syntax=docker/dockerfile:1
#
# Anthropic Claude Code coding agent, packaged for one-shot use in CI.
#
# Same pattern as .container-agents/vibe/: built fresh each workflow
# run by .forgejo/workflows/container-agents.yml, never pushed to a
# registry. The workflow streams the workspace in via `docker cp`,
# runs the agent, and streams results back out.

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

COPY run-claude.sh /usr/local/bin/run-claude
RUN chmod +x /usr/local/bin/run-claude

WORKDIR /work

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/run-claude"]
