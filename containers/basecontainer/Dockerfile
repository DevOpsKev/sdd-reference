# basecontainer
#
# Lean image used for CI/CD jobs. Contains the toolchain the repo's pipelines
# need (Python, Node, gitleaks, ruff, pyyaml) but no IDE-oriented niceties.
# The devcontainer image (containers/devcontainer/Dockerfile) layers on top
# of this one.

FROM python:3.12-bookworm

ARG NODE_MAJOR=20
ARG GITLEAKS_VERSION=8.21.2

ENV DEBIAN_FRONTEND=noninteractive \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        gnupg \
        jq \
        sudo \
    # Node.js (required by husky + lint-staged); pnpm comes via corepack.
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
        | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
        > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && corepack enable \
    # gitleaks (called by .husky/lib/gitleaks.sh).
    && curl -fsSL "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" \
        | tar -xz -C /usr/local/bin gitleaks \
    && chmod +x /usr/local/bin/gitleaks \
    && rm -rf /var/lib/apt/lists/*

# Python deps: agent runtime (requirements.txt) + dev tooling used by the
# pre-commit hooks (ruff, pyyaml). requirements-dev.txt transitively pulls
# in requirements.txt via `-r`. Build context must be the repo root.
COPY requirements.txt requirements-dev.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements-dev.txt \
    && rm /tmp/requirements.txt /tmp/requirements-dev.txt

WORKDIR /workspace
