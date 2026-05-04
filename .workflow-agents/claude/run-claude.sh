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

debug_enabled() {
  [ "${AGENT_DEBUG:-false}" = "true" ] || [ "${AGENT_DEBUG:-false}" = "1" ]
}

MAX_TURNS="${AGENT_MAX_TURNS:-150}"
SPEC_PATH=".sdd/specifications/${SPEC}/spec.md"
if [ ! -f "$SPEC_PATH" ]; then
  echo "Spec not found at: $SPEC_PATH" >&2
  exit 1
fi

# Shared cross-agent prompt fragments and shell helpers, read at
# runtime from the streamed workspace. See
# /work/.workflow-agents/base/README.md.
BASE_DIR="/work/.workflow-agents/base"
for f in "$BASE_DIR/prompt-prelude.md" "$BASE_DIR/prompt-postlude.md" "$BASE_DIR/lib/print-toolchain.sh" "$BASE_DIR/lib/load-agent-role.sh" "$BASE_DIR/prompt-role-dev.md" "$BASE_DIR/prompt-role-qa.md"; do
  if [ ! -f "$f" ]; then
    echo "Missing shared workflow-agent base file: $f" >&2
    echo "Expected .workflow-agents/base/ to be present in the streamed workspace at /work." >&2
    exit 1
  fi
done
# shellcheck source=/dev/null
source "$BASE_DIR/lib/print-toolchain.sh"
# shellcheck source=/dev/null
source "$BASE_DIR/lib/load-agent-role.sh"

if debug_enabled; then
  echo "Starting Claude workflow agent"
  echo "SPEC=$SPEC"
  echo "AGENT_ROLE=$AGENT_ROLE"
  echo "SPEC_PATH=$SPEC_PATH"
  echo "CLAUDE_MODEL=claude-sonnet-4-5"
  echo "AGENT_MAX_TURNS=$MAX_TURNS"
  echo "Claude Code version:"
  claude --version || true

  print_toolchain node npm pnpm npx corepack git rg ripgrep jq curl \
    sed awk grep find wc python python3 docker chromium playwright

  echo "Checking Anthropic API auth with minimal messages request"
  RESPONSE_FILE="$(mktemp)"
  HTTP_STATUS=$(curl -sS --connect-timeout 10 --max-time 30 \
    -o "$RESPONSE_FILE" \
    -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -H "anthropic-version: 2023-06-01" \
    -H "x-api-key: ${ANTHROPIC_API_KEY}" \
    -d '{
          "model": "claude-sonnet-4-5",
          "max_tokens": 8,
          "messages": [{"role": "user", "content": "Reply with ok."}]
        }' \
    "https://api.anthropic.com/v1/messages" || true)
  echo "Anthropic messages HTTP status: ${HTTP_STATUS:-curl-failed}"
  if [ "${HTTP_STATUS:-}" = "200" ]; then
    echo "Anthropic response text:"
    jq -r '.content[]? | select(.type == "text") | .text' "$RESPONSE_FILE" || true
  else
    echo "Anthropic response body:"
    sed -n '1,20p' "$RESPONSE_FILE" || true
  fi
  rm -f "$RESPONSE_FILE"
fi

# Tool manifest is agent-specific (it describes *this* container).
# Quoted heredoc so backticks and dollar signs in the body stay literal.
TOOL_MANIFEST=$(cat <<'EOF'
Available tools in this container:
- node 22, npm, pnpm 10.33.2, npx, corepack
- git, ripgrep (`rg`), jq, curl, sed, awk, grep, find, wc, plus
  standard GNU coreutils

Tools that are NOT available (do not attempt to install them — this
container runs as a non-root user and `apt-get install`,
`brew install`, and `sudo` will all fail):
- docker, podman, or any container build/run CLI. If a spec
  acceptance criterion is "`docker build` works" or "image is under
  N MB", implement the Dockerfile and trust the surrounding CI to
  verify — do not try to build or measure the image yourself.
- Any browser, headless renderer, playwright, or puppeteer. If a spec
  says "renders correctly in a modern browser" or "no console errors",
  inspect the HTML/CSS/JS yourself and ship it; do not attempt visual
  or runtime browser checks.
- python, ruby, go, rust, java toolchains.

Plan the work using only the tools listed as available. Probing for
missing tools wastes turns; trust this manifest.
EOF
)

PROMPT="**AGENT_ROLE:** ${AGENT_ROLE}

$(cat "$BASE_DIR/prompt-role-${AGENT_ROLE}.md")

Read the spec at ${SPEC_PATH}.

$(cat "$BASE_DIR/prompt-prelude.md")

${TOOL_MANIFEST}

$(cat "$BASE_DIR/prompt-postlude.md")"

CLAUDE_OUTPUT_ARGS=(--output-format text)
if debug_enabled; then
  CLAUDE_OUTPUT_ARGS=(--output-format stream-json --verbose)
fi
if [ -n "${AGENT_OUTPUT_FORMAT:-}" ]; then
  CLAUDE_OUTPUT_ARGS=(--output-format "$AGENT_OUTPUT_FORMAT")
  if [ "$AGENT_OUTPUT_FORMAT" = "stream-json" ]; then
    CLAUDE_OUTPUT_ARGS+=(--verbose)
  fi
fi

exec claude \
  -p "$PROMPT" \
  --model claude-sonnet-4-5 \
  --max-turns "$MAX_TURNS" \
  "${CLAUDE_OUTPUT_ARGS[@]}" \
  --dangerously-skip-permissions
