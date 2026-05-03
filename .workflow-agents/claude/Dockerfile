# syntax=docker/dockerfile:1
#
# Anthropic Claude Code coding agent, packaged for one-shot use in CI.
#
# Same pattern as .workflow-agents/vibe/: built fresh each workflow
# run by .forgejo/workflows/workflow-agents.yml, never pushed to a
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

# Claude Code refuses --dangerously-skip-permissions when its process
# is uid 0 (root), as a deliberate Anthropic safety check. Run the
# agent as a non-root user with /work owned by it; the workflow tars
# the workspace in with matching ownership (--owner=1001 --group=1001)
# so claude can read and write the files it gets.
RUN useradd --create-home --uid 1001 --shell /bin/bash claude \
 && mkdir -p /work \
 && chown claude:claude /work

COPY run-claude.sh /usr/local/bin/run-claude
RUN chmod +x /usr/local/bin/run-claude

WORKDIR /work
USER claude

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/run-claude"]
