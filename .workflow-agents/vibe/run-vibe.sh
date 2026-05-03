#!/usr/bin/env bash
# Container entrypoint for the Mistral Vibe agent.
#
# Reads SPEC and MISTRAL_API_KEY from the environment, locates the spec
# under .sdd/specifications/, and runs vibe in programmatic mode (-p)
# with the auto-approve agent profile and hard turn/cost ceilings.
# Exits when vibe exits.
#
# This script does NOT touch git. The workflow that invokes the
# container is responsible for committing, pushing and opening the PR.

set -euo pipefail

: "${SPEC:?SPEC env var is required (e.g. SPEC=helloworld)}"
: "${MISTRAL_API_KEY:?MISTRAL_API_KEY env var is required}"

debug_enabled() {
  [ "${AGENT_DEBUG:-false}" = "true" ] || [ "${AGENT_DEBUG:-false}" = "1" ]
}

SPEC_PATH=".sdd/specifications/${SPEC}/spec.md"
if [ ! -f "$SPEC_PATH" ]; then
  echo "Spec not found at: $SPEC_PATH" >&2
  exit 1
fi

if debug_enabled; then
  echo "Starting Vibe workflow agent"
  echo "SPEC=$SPEC"
  echo "SPEC_PATH=$SPEC_PATH"
  echo "Vibe version:"
  vibe --version || true
fi

PROMPT=$(cat <<EOF
Read the spec at ${SPEC_PATH}.

If a \`.skills/\` directory exists at the repo root, read every
\`.skills/<name>/SKILL.md\` file before generating code, and apply the
guidance where relevant. Skills describe *how* to do work well (e.g.
visual design quality); the spec describes *what* to build. Skills do
not change scope.

Generate exactly the files the spec describes, at the paths it specifies, and
satisfy its acceptance criteria literally.

Hard constraints:
- Do not modify anything under .sdd/, .skills/, .workflow-agents/,
  .forgejo/, or .husky/. Those are inputs and infrastructure, not
  agent output.
- Do not run any git commands. Do not commit, push, fetch, or modify
  remotes. The surrounding CI workflow handles all version control.
- When the acceptance criteria appear satisfied, stop. Do not keep
  exploring or refactoring beyond what the spec asks for.
EOF
)

exec vibe \
  --agent auto-approve \
  --trust \
  --max-turns 50 \
  --max-price 5 \
  --output text \
  -p "$PROMPT"
