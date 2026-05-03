#!/usr/bin/env bash
# Run a workflow agent against a spec locally.
#
# This is intentionally not the full Forgejo workflow: it builds the selected
# agent image and runs it against either the current checkout or an isolated
# .tmp copy. It does not commit, push, or open a PR.

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  .scripts/run-agent-local.sh [--tmp] <agent> <spec>

Examples:
  AGENT_DEBUG=true AGENT_MAX_TURNS=20 .scripts/run-agent-local.sh vibe homepage
  AGENT_DEBUG=true .scripts/run-agent-local.sh claude homepage
  .scripts/run-agent-local.sh deepseek helloworld
  AGENT_MAX_TURNS=20 .scripts/run-agent-local.sh --tmp vibe homepage

Options:
  --tmp             Run in an isolated .tmp/agent-runs workspace instead of
                    mutating the current checkout.

Environment:
  AGENT_DEBUG       Set to true/1 for verbose agent diagnostics (default: true).
  AGENT_MAX_TURNS   Override the agent turn cap for cheap smoke tests.
  AGENT_OUTPUT_FORMAT
                    Override agent output mode. Local defaults:
                    vibe=streaming, claude/deepseek=stream-json.

Required provider keys:
  vibe      MISTRAL_API_KEY
  claude    ANTHROPIC_API_KEY
  deepseek  DEEPSEEK_API_KEY
EOF
}

USE_TMP=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    -h | --help)
      usage
      exit 0
      ;;
    --tmp)
      USE_TMP=true
      shift
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      break
      ;;
  esac
done

if [ "$#" -ne 2 ]; then
  usage >&2
  exit 2
fi

AGENT="$1"
SPEC="$2"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
AGENT_DIR="$REPO_ROOT/.workflow-agents/$AGENT"
SPEC_PATH="$REPO_ROOT/.sdd/specifications/$SPEC/spec.md"
IMAGE_TAG="${AGENT}-agent:local"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ROOT="$REPO_ROOT/.tmp/agent-runs"
RUN_DIR="$RUN_ROOT/${AGENT}-${SPEC}-${RUN_ID}"
BASELINE_DIR="${RUN_DIR}.baseline"
if [ "$USE_TMP" = "true" ]; then
  MODE="tmp"
  WORK_DIR="$RUN_DIR"
  LOG_FILE="$RUN_DIR/agent-output.log"
else
  MODE="in-place"
  WORK_DIR="$REPO_ROOT"
  LOG_FILE="$REPO_ROOT/agent-output.log"
fi

case "$AGENT" in
  vibe)
    REQUIRED_KEY="MISTRAL_API_KEY"
    ;;
  claude)
    REQUIRED_KEY="ANTHROPIC_API_KEY"
    ;;
  deepseek)
    REQUIRED_KEY="DEEPSEEK_API_KEY"
    ;;
  *)
    echo "Unknown agent: $AGENT" >&2
    echo "Expected one of: vibe, claude, deepseek" >&2
    exit 2
    ;;
esac

if [ ! -d "$AGENT_DIR" ]; then
  echo "Agent directory not found: $AGENT_DIR" >&2
  exit 1
fi

if [ ! -f "$SPEC_PATH" ]; then
  echo "Spec not found: $SPEC_PATH" >&2
  exit 1
fi

if [ -z "${!REQUIRED_KEY:-}" ]; then
  echo "Missing required environment variable: $REQUIRED_KEY" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found on PATH" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "docker is installed but the daemon is not reachable" >&2
  exit 1
fi

echo "Agent: $AGENT"
echo "Spec: $SPEC"
echo "Mode: $MODE"
echo "Image: $IMAGE_TAG"
echo "Workspace: $WORK_DIR"
echo "AGENT_DEBUG=${AGENT_DEBUG:-true}"
echo "AGENT_MAX_TURNS=${AGENT_MAX_TURNS:-150}"

case "$AGENT" in
  vibe)
    DEFAULT_OUTPUT_FORMAT="streaming"
    ;;
  claude | deepseek)
    DEFAULT_OUTPUT_FORMAT="stream-json"
    ;;
esac
LOCAL_OUTPUT_FORMAT="${AGENT_OUTPUT_FORMAT:-$DEFAULT_OUTPUT_FORMAT}"
echo "AGENT_OUTPUT_FORMAT=$LOCAL_OUTPUT_FORMAT"

if ! git -C "$REPO_ROOT" diff --quiet || ! git -C "$REPO_ROOT" diff --cached --quiet; then
  echo
  if [ "$USE_TMP" = "true" ]; then
    echo "Warning: working tree has uncommitted changes. The tmp run uses a copy of the current tree."
  else
    echo "Warning: working tree has uncommitted changes. The in-place run will mutate this checkout."
  fi
fi

echo
echo "Building agent image..."
docker build --tag "$IMAGE_TAG" "$AGENT_DIR"

if [ "$USE_TMP" = "true" ]; then
  echo
  echo "Creating isolated workspace..."
  mkdir -p "$RUN_ROOT"
  rm -rf "$RUN_DIR"
  rm -rf "$BASELINE_DIR"
  mkdir -p "$RUN_DIR"

  tar -C "$REPO_ROOT" \
      --exclude='./.git' \
      --exclude='./node_modules' \
      --exclude='./.venv' \
      --exclude='./dist' \
      --exclude='./.tmp' \
      --exclude='./.ruff_cache' \
      -cf - . \
    | tar -C "$RUN_DIR" -xf -

  mkdir -p "$BASELINE_DIR"
  tar -C "$RUN_DIR" -cf - . | tar -C "$BASELINE_DIR" -xf -
fi

echo
if [ "$USE_TMP" = "true" ]; then
  echo "Running agent in isolated workspace..."
else
  echo "Running agent in current checkout..."
fi
echo "Streaming agent output live and writing raw output to: $LOG_FILE"
DOCKER_TTY_ARGS=()
if [ -t 0 ]; then
  DOCKER_TTY_ARGS=(--interactive --tty)
fi

set +e
docker run --rm "${DOCKER_TTY_ARGS[@]}" \
  --env SPEC="$SPEC" \
  --env AGENT_DEBUG="${AGENT_DEBUG:-true}" \
  --env AGENT_MAX_TURNS="${AGENT_MAX_TURNS:-150}" \
  --env AGENT_OUTPUT_FORMAT="$LOCAL_OUTPUT_FORMAT" \
  --env ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" \
  --env DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-}" \
  --env MISTRAL_API_KEY="${MISTRAL_API_KEY:-}" \
  --volume "$WORK_DIR:/work" \
  "$IMAGE_TAG" 2>&1 | tee "$LOG_FILE"
AGENT_EXIT=${PIPESTATUS[0]}
set -e

echo
echo "Agent exit code: $AGENT_EXIT"
echo "Output workspace: $WORK_DIR"
echo "Agent output log: $LOG_FILE"

if [ "$USE_TMP" = "true" ]; then
  echo
  echo "Changed files in output workspace:"
  diff -qr "$BASELINE_DIR" "$RUN_DIR" \
    | sed "s#$BASELINE_DIR/##g; s#$RUN_DIR/##g" \
    || true

  echo
  echo "Diff summary:"
  git diff --no-index --stat "$BASELINE_DIR" "$RUN_DIR" || true

  cat <<EOF

Next steps:
  Inspect output:
    cd "$WORK_DIR"

  Compare full diff:
    git diff --no-index "$BASELINE_DIR" "$WORK_DIR"

  Run project checks in the output workspace if applicable:
    cd "$WORK_DIR" && pnpm install && pnpm run build

  Re-read the raw streamed agent output:
    less "$LOG_FILE"

  Copy selected files back manually only after review.
EOF
else
  echo
  echo "Working tree status:"
  git -C "$REPO_ROOT" status --short || true

  echo
  echo "Diff summary:"
  git -C "$REPO_ROOT" diff --stat || true
  git -C "$REPO_ROOT" diff --cached --stat || true

  cat <<EOF

Next steps:
  Inspect changes:
    git status
    git diff

  Run project checks if applicable:
    pnpm install && pnpm run build

  Re-read the raw streamed agent output:
    less "$LOG_FILE"
EOF
fi

exit "$AGENT_EXIT"
