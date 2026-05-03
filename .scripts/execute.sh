#!/usr/bin/env bash
# Project command dispatcher for local SDD workflows.

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  pnpm execute spec [--tmp] <agent> <spec>

Examples:
  pnpm execute spec vibe homepage
  AGENT_MAX_TURNS=20 pnpm execute spec vibe homepage
  pnpm execute spec --tmp vibe homepage
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

COMMAND="${1:-}"
case "$COMMAND" in
  spec)
    shift
    exec "$(dirname "$0")/run-agent-local.sh" "$@"
    ;;
  *)
    if [ -n "$COMMAND" ]; then
      echo "Unknown execute command: $COMMAND" >&2
    fi
    usage >&2
    exit 2
    ;;
esac
