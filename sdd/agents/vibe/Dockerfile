# syntax=docker/dockerfile:1
#
# Mistral Vibe coding agent, packaged for one-shot use in CI.
#
# The container is built fresh each workflow run by
# .forgejo/workflows/workflow-agents.yml, so it is never pushed to a
# registry. The workflow streams the workspace into /work via
# `docker cp`, runs the agent, then streams the result back out.
# The agent mutates files in-place and the workflow handles git
# commit/push/PR afterwards.

FROM python:3.12-slim

ARG VIBE_VERSION=2.9.3

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        jq \
        ripgrep \
        tini \
 && rm -rf /var/lib/apt/lists/*

RUN pip install "mistral-vibe==${VIBE_VERSION}"

COPY config.toml /root/.vibe/config.toml

COPY run-vibe.sh /usr/local/bin/run-vibe
RUN chmod +x /usr/local/bin/run-vibe

WORKDIR /work

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/run-vibe"]
