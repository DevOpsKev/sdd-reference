#!/usr/bin/env bash
# Container entrypoint for the Anthropic Claude Code agent.
#
# Reads SPEC and ANTHROPIC_API_KEY from the environment, locates the
# spec under .sdd/specifications/, and runs claude in non-interactive
# print mode (-p) with permissions auto-approved and a hard turn cap.
# Exits when claude exits.
#
# This script does NOT touch git. The workflow that invokes the
# container is responsible for committing, pushing and opening the PR.

set -euo pipefail

: "${SPEC:?SPEC env var is required (e.g. SPEC=helloworld)}"
: "${ANTHROPIC_API_KEY:?ANTHROPIC_API_KEY env var is required}"

SPEC_PATH=".sdd/specifications/${SPEC}/spec.md"
if [ ! -f "$SPEC_PATH" ]; then
  echo "Spec not found at: $SPEC_PATH" >&2
  exit 1
fi

PROMPT=$(cat <<EOF
Read the spec at ${SPEC_PATH}.

Generate exactly the files it describes, at the paths it specifies, and
satisfy its acceptance criteria literally.

Hard constraints:
- Do not modify anything under .sdd/, .api-agents/, .container-agents/,
  .forgejo/, or .husky/. Those are inputs and infrastructure, not agent
  output.
- Do not run any git commands. Do not commit, push, fetch, or modify
  remotes. The surrounding CI workflow handles all version control.
- When the acceptance criteria appear satisfied, stop. Do not keep
  exploring or refactoring beyond what the spec asks for.
EOF
)

exec claude \
  -p "$PROMPT" \
  --model claude-sonnet-4-5 \
  --max-turns 50 \
  --output-format text \
  --dangerously-skip-permissions
