#!/usr/bin/env bash
# Container entrypoint for the Mistral Vibe agent.
#
# Reads SPEC and MISTRAL_API_KEY from the environment, locates the spec
# under .sdd/specifications/, and pipes a constrained prompt into vibe
# running non-interactively in auto-approve mode. Exits when vibe exits.
#
# This script does NOT touch git. The workflow that invokes the
# container is responsible for committing, pushing and opening the PR.

set -euo pipefail

: "${SPEC:?SPEC env var is required (e.g. SPEC=helloworld)}"
: "${MISTRAL_API_KEY:?MISTRAL_API_KEY env var is required}"

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
- Do not modify anything under .sdd/, .agents/, .forgejo/, .husky/, or
  containers/. Those are inputs and infrastructure, not agent output.
- Do not run any git commands. Do not commit, push, fetch, or modify
  remotes. The surrounding CI workflow handles all version control.
- When the acceptance criteria appear satisfied, stop. Do not keep
  exploring or refactoring beyond what the spec asks for.
EOF
)

exec vibe \
  --agent auto-approve \
  --model codestral-latest \
  --no-tty <<<"$PROMPT"
