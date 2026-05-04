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

MAX_TURNS="${AGENT_MAX_TURNS:-150}"
OUTPUT_FORMAT="${AGENT_OUTPUT_FORMAT:-text}"
if debug_enabled && [ -z "${AGENT_OUTPUT_FORMAT:-}" ]; then
  OUTPUT_FORMAT="streaming"
fi

SPEC_PATH=".sdd/specifications/${SPEC}/spec.md"
if [ ! -f "$SPEC_PATH" ]; then
  echo "Spec not found at: $SPEC_PATH" >&2
  exit 1
fi

# Shared cross-agent prompt fragments and shell helpers, read at
# runtime from the streamed workspace. See
# /work/.workflow-agents/base/README.md.
BASE_DIR="/work/.workflow-agents/base"
for f in "$BASE_DIR/prompt-prelude.md" "$BASE_DIR/prompt-postlude.md" "$BASE_DIR/lib/print-toolchain.sh"; do
  if [ ! -f "$f" ]; then
    echo "Missing shared workflow-agent base file: $f" >&2
    echo "Expected .workflow-agents/base/ to be present in the streamed workspace at /work." >&2
    exit 1
  fi
done
# shellcheck source=/dev/null
source "$BASE_DIR/lib/print-toolchain.sh"

if debug_enabled; then
  echo "Starting Vibe workflow agent"
  echo "SPEC=$SPEC"
  echo "SPEC_PATH=$SPEC_PATH"
  echo "AGENT_MAX_TURNS=$MAX_TURNS"
  echo "AGENT_OUTPUT_FORMAT=$OUTPUT_FORMAT"
  echo "Vibe version:"
  vibe --version || true
  echo "Vibe config:"
  sed -n '1,40p' /root/.vibe/config.toml || true

  print_toolchain python python3 pip pip3 git rg ripgrep jq curl \
    sed awk grep find wc node npm pnpm npx docker chromium playwright

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

# Tool manifest is agent-specific (it describes *this* container).
# Quoted heredoc so backticks and dollar signs in the body stay literal.
TOOL_MANIFEST=$(cat <<'EOF'
Available tools in this container:
- python 3.12, pip
- git, ripgrep (`rg`), jq, curl, sed, awk, grep, find, wc, plus
  standard GNU coreutils

Tools that are NOT available:
- node, npm, pnpm, npx. If a spec mentions Vite, TypeScript, or any
  other node-based dev tooling as part of its toolchain, you do not
  have a node runtime in this container — generate the static output
  the spec ultimately expects (see its File layout) rather than
  attempting to scaffold or run a node build pipeline.
- docker, podman, or any container build/run CLI. If a spec
  acceptance criterion is "`docker build` works" or "image is under
  N MB", implement the Dockerfile and trust the surrounding CI to
  verify — do not try to build or measure the image yourself.
- Any browser, headless renderer, playwright, or puppeteer. If a spec
  says "renders correctly in a modern browser" or "no console errors",
  inspect the HTML/CSS/JS yourself and ship it; do not attempt visual
  or runtime browser checks.

This container runs as root, so `apt-get install` and `pip install`
technically work. Avoid using them: each install costs turns and
budget against `--max-price`. Plan the work using the tools listed
as available; probing for missing tools wastes turns.
EOF
)

PROMPT="Read the spec at ${SPEC_PATH}.

$(cat "$BASE_DIR/prompt-prelude.md")

${TOOL_MANIFEST}

$(cat "$BASE_DIR/prompt-postlude.md")"

exec vibe \
  --agent auto-approve \
  --trust \
  --max-turns "$MAX_TURNS" \
  --max-price 5 \
  --output "$OUTPUT_FORMAT" \
  -p "$PROMPT"
