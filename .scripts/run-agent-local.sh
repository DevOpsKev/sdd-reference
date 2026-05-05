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
  .scripts/run-agent-local.sh [--tmp] <agent> <spec-dir> <role>

Examples:
  AGENT_DEBUG=true AGENT_MAX_TURNS=20 .scripts/run-agent-local.sh vibe sdd/vite-baseline dev
  AGENT_DEBUG=true .scripts/run-agent-local.sh claude sdd/homepage qa
  .scripts/run-agent-local.sh deepseek sdd/helloworld dev
  AGENT_MAX_TURNS=20 .scripts/run-agent-local.sh --tmp vibe sdd/vite-baseline dev

  <spec> is the repo-relative spec directory (must be under sdd/), e.g. sdd/homepage or sdd/homepage/header.

  <role> is "dev" (implement from spec) or "qa" (verify; write scenarios; append provenance).

Options:
  --tmp             Run in an isolated .tmp/agent-runs workspace instead of
                    mutating the current checkout.

Environment:
  AGENT_DEBUG       Set to true/1 for verbose agent diagnostics (default: true).
  AGENT_MAX_TURNS   Override the agent turn cap for cheap smoke tests.
  AGENT_OUTPUT_FORMAT
                    Override agent output mode. Local defaults:
                    vibe=streaming, claude/deepseek=stream-json.
  AGENT_PRETTY_OUTPUT
                    Set to false/0 to print the raw agent stream.

  The third positional argument sets AGENT_ROLE inside the container (dev or qa).

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

if [ "$#" -ne 3 ]; then
  usage >&2
  exit 2
fi

AGENT="$1"
SPEC="$2"
AGENT_ROLE="$3"
case "$AGENT_ROLE" in
  dev | qa) ;;
  *)
    echo "Invalid role: $AGENT_ROLE (expected dev or qa)" >&2
    exit 2
    ;;
esac
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
AGENT_DIR="$REPO_ROOT/.workflow-agents/$AGENT"
# shellcheck source=/dev/null
source "$REPO_ROOT/.workflow-agents/base/lib/spec-paths.sh"
resolve_spec_dir
SPEC_PATH="$REPO_ROOT/$SPEC_PATH"
IMAGE_TAG="${AGENT}-agent:local"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ROOT="$REPO_ROOT/.tmp/agent-runs"
RUN_DIR="$RUN_ROOT/${AGENT}-${SPEC_SLUG}-${AGENT_ROLE}-${RUN_ID}"
BASELINE_DIR="${RUN_DIR}.baseline"
if [ "$USE_TMP" = "true" ]; then
  MODE="tmp"
  WORK_DIR="$RUN_DIR"
else
  MODE="in-place"
  WORK_DIR="$REPO_ROOT"
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

CURRENT_BRANCH="$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || true)"
if [ "$CURRENT_BRANCH" = "main" ]; then
  echo "Refusing to run a local agent on the main branch." >&2
  echo "Switch to a working branch first, then rerun this command." >&2
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
echo "Role: $AGENT_ROLE"
echo "Mode: $MODE"
echo "Branch: ${CURRENT_BRANCH:-detached HEAD}"
echo "Image: $IMAGE_TAG"
echo "Workspace: $WORK_DIR"
echo "AGENT_DEBUG=${AGENT_DEBUG:-true}"
echo "AGENT_MAX_TURNS=${AGENT_MAX_TURNS:-150}"
echo "AGENT_PRETTY_OUTPUT=${AGENT_PRETTY_OUTPUT:-true}"

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
if [ "${AGENT_PRETTY_OUTPUT:-true}" = "false" ] || [ "${AGENT_PRETTY_OUTPUT:-true}" = "0" ]; then
  echo "Streaming raw agent output live..."
  PRETTY_OUTPUT=false
else
  echo "Streaming pretty agent output live..."
  PRETTY_OUTPUT=true
fi
set +e
if [ "$PRETTY_OUTPUT" = "true" ]; then
  docker run --rm \
    --env SPEC="$SPEC" \
    --env AGENT_ROLE="$AGENT_ROLE" \
    --env AGENT_DEBUG="${AGENT_DEBUG:-true}" \
    --env AGENT_MAX_TURNS="${AGENT_MAX_TURNS:-150}" \
    --env AGENT_OUTPUT_FORMAT="$LOCAL_OUTPUT_FORMAT" \
    --env ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" \
    --env DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-}" \
    --env MISTRAL_API_KEY="${MISTRAL_API_KEY:-}" \
    --volume "$WORK_DIR:/work" \
    "$IMAGE_TAG" 2>&1 | "$REPO_ROOT/.scripts/pretty-agent-stream.mjs"
  AGENT_EXIT=${PIPESTATUS[0]}
else
  DOCKER_TTY_ARGS=""
  if [ -t 0 ]; then
    DOCKER_TTY_ARGS="--interactive --tty"
  fi

  # shellcheck disable=SC2086
  docker run --rm $DOCKER_TTY_ARGS \
    --env SPEC="$SPEC" \
    --env AGENT_ROLE="$AGENT_ROLE" \
    --env AGENT_DEBUG="${AGENT_DEBUG:-true}" \
    --env AGENT_MAX_TURNS="${AGENT_MAX_TURNS:-150}" \
    --env AGENT_OUTPUT_FORMAT="$LOCAL_OUTPUT_FORMAT" \
    --env ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" \
    --env DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-}" \
    --env MISTRAL_API_KEY="${MISTRAL_API_KEY:-}" \
    --volume "$WORK_DIR:/work" \
    "$IMAGE_TAG"
  AGENT_EXIT=$?
fi
set -e

echo
echo "Agent exit code: $AGENT_EXIT"
echo "Output workspace: $WORK_DIR"

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
EOF
fi

exit "$AGENT_EXIT"
