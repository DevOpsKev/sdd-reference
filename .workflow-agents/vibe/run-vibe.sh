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
  echo "Vibe config:"
  sed -n '1,40p' /root/.vibe/config.toml || true

  echo "Checking Mistral API auth with model list request"
  RESPONSE_FILE="$(mktemp)"
  HTTP_STATUS=$(curl -sS --connect-timeout 10 --max-time 30 \
    -o "$RESPONSE_FILE" \
    -w "%{http_code}" \
    -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
    "https://api.mistral.ai/v1/models" || true)
  echo "Mistral models HTTP status: ${HTTP_STATUS:-curl-failed}"
  if [ "${HTTP_STATUS:-}" = "200" ]; then
    echo "Mistral available model sample:"
    jq -r '.data[]?.id' "$RESPONSE_FILE" | sed -n '1,10p' || true
  else
    echo "Mistral models response body:"
    sed -n '1,20p' "$RESPONSE_FILE" || true
  fi
  rm -f "$RESPONSE_FILE"

  echo "Checking Mistral chat completion with fallback models"
  for DEBUG_MODEL in devstral-small-latest codestral-latest mistral-small-latest; do
    RESPONSE_FILE="$(mktemp)"
    HTTP_STATUS=$(curl -sS --connect-timeout 10 --max-time 30 \
      -o "$RESPONSE_FILE" \
      -w "%{http_code}" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
      -d "{
            \"model\": \"${DEBUG_MODEL}\",
            \"messages\": [{\"role\": \"user\", \"content\": \"Reply with ok.\"}],
            \"max_tokens\": 8,
            \"stream\": false
          }" \
      "https://api.mistral.ai/v1/chat/completions" || true)
    echo "Mistral chat HTTP status for ${DEBUG_MODEL}: ${HTTP_STATUS:-curl-failed}"
    if [ "${HTTP_STATUS:-}" = "200" ]; then
      echo "Mistral response text:"
      jq -r '.choices[0].message.content // empty' "$RESPONSE_FILE" || true
      rm -f "$RESPONSE_FILE"
      break
    fi
    echo "Mistral response body for ${DEBUG_MODEL}:"
    sed -n '1,10p' "$RESPONSE_FILE" || true
    rm -f "$RESPONSE_FILE"
  done
fi

PROMPT=$(cat <<EOF
Read the spec at ${SPEC_PATH}.

If the spec references sibling files, schemas, fixtures, copy files,
data files, or examples, read those files before implementing. Treat
referenced files as part of the spec.

If a \`.skills/\` directory exists at the repo root, read every
\`.skills/<name>/SKILL.md\` file before generating code, and apply the
guidance where relevant. Skills describe *how* to do work well (e.g.
visual design quality); the spec describes *what* to build. Skills do
not change scope.

If a \`.context/\` directory exists at the repo root, read relevant
\`.context/*.md\` files before generating code. Context describes
project/product background; it does not change the scope or acceptance
criteria in the spec.

Generate exactly the files the spec describes, at the paths it specifies, and
satisfy its acceptance criteria literally.

When a spec requires a validation script or acceptance command,
implement it early and use it as the completion gate.

Hard constraints:
- Do not modify anything under .sdd/, .skills/, .context/,
  .workflow-agents/, .forgejo/, or .husky/. Those are inputs and
  infrastructure, not agent output.
- Do not run any git commands. Do not commit, push, fetch, or modify
  remotes. The surrounding CI workflow handles all version control.
- When the acceptance criteria appear satisfied, stop. Do not keep
  exploring or refactoring beyond what the spec asks for.
EOF
)

exec vibe \
  --agent auto-approve \
  --trust \
  --max-turns 150 \
  --max-price 5 \
  --output text \
  -p "$PROMPT"
