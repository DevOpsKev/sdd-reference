#!/usr/bin/env bash
# Project command dispatcher for local SDD workflows.

set -euo pipefail

usage() {
  cat <<'EOF'
SDD — run a workflow agent against a spec locally (Docker).

Usage (recommended):
  pnpm sdd [--tmp] <agent> <spec-dir> <role>

Equivalent:
  pnpm execute spec [--tmp] <agent> <spec-dir> <role>
  sdd/scripts/execute.sh spec [--tmp] <agent> <spec-dir> <role>

Arguments:
  <agent>     vibe | claude | deepseek
  <spec-dir>  Repo-relative directory under sdd/specs/ containing spec.md
              (e.g. sdd/specs/vite-baseline). Not valid: sdd/context/,
              sdd/agents/, sdd/scripts/, or paths outside sdd/specs/.
  <role>      dev — implement from spec; overwrite provenance only
              qa  — verify; write scenarios; append provenance
              all — run dev then qa on the same workspace (matches CI AGENT_ROLE=all)

Options:
  --tmp       Copy the repo to .tmp/agent-runs/... and run there (disposable).

Environment (optional):
  AGENT_DEBUG           true/1 for verbose diagnostics (local default: on).
  AGENT_MAX_TURNS       Cap agent turns (e.g. 20 for cheap smoke tests).
  AGENT_OUTPUT_FORMAT   Override agent output mode.
  AGENT_PRETTY_OUTPUT   false/0 for raw provider stream.

API keys (export before run):
  vibe      MISTRAL_API_KEY
  claude    ANTHROPIC_API_KEY
  deepseek  DEEPSEEK_API_KEY

Help:
  pnpm sdd --help
  pnpm execute spec --help
  pnpm execute help

Examples:
  pnpm sdd claude sdd/specs/homepage dev
  pnpm sdd claude sdd/specs/homepage qa
  pnpm sdd claude sdd/specs/homepage all
  AGENT_MAX_TURNS=20 pnpm sdd vibe sdd/specs/homepage dev
  pnpm sdd --tmp vibe sdd/specs/vite-baseline dev
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
    if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
      usage
      exit 0
    fi
    exec "$(dirname "$0")/run-agent-local.sh" "$@"
    ;;
  help)
    usage
    exit 0
    ;;
  *)
    if [ -n "$COMMAND" ]; then
      echo "Unknown command: $COMMAND (try: pnpm sdd --help)" >&2
    fi
    usage >&2
    exit 2
    ;;
esac
