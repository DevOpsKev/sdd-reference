#!/usr/bin/env bash
# Validate AGENT_ROLE and ensure role prompt exists. Expects BASE_DIR set
# to /work/sdd/agents/base (or equivalent).

AGENT_ROLE="${AGENT_ROLE:-dev}"
case "$AGENT_ROLE" in
  dev | qa) ;;
  *)
    echo "Invalid AGENT_ROLE=${AGENT_ROLE} (expected dev or qa)" >&2
    exit 1
    ;;
esac

ROLE_FILE="${BASE_DIR}/prompt-role-${AGENT_ROLE}.md"
if [ ! -f "$ROLE_FILE" ]; then
  echo "Missing role prompt file: $ROLE_FILE" >&2
  exit 1
fi

export AGENT_ROLE
