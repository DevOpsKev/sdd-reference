#!/usr/bin/env bash
# Container entrypoint for the DeepSeek-backed Claude Code agent.
#
# Reads SPEC and DEEPSEEK_API_KEY from the environment, locates the
# spec under sdd/<...>/ (SPEC is the repo-relative spec directory), and runs Claude Code against
# DeepSeek's Anthropic-compatible API with permissions auto-approved
# and a hard turn cap. Exits when claude exits.
#
# This script does NOT touch git. The workflow that invokes the
# container is responsible for committing, pushing and opening the PR.

set -euo pipefail

: "${SPEC:?SPEC env var is required (e.g. SPEC=sdd/helloworld)}"
: "${DEEPSEEK_API_KEY:?DEEPSEEK_API_KEY env var is required}"

debug_enabled() {
  [ "${AGENT_DEBUG:-false}" = "true" ] || [ "${AGENT_DEBUG:-false}" = "1" ]
}

MAX_TURNS="${AGENT_MAX_TURNS:-150}"
export ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
export ANTHROPIC_AUTH_TOKEN="$DEEPSEEK_API_KEY"
export ANTHROPIC_MODEL="deepseek-v4-flash"
export ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-flash"
export ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-flash"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
export CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
export CLAUDE_CODE_EFFORT_LEVEL="max"

# Shared cross-agent prompt fragments and shell helpers, read at
# runtime from the streamed workspace. See
# /work/.workflow-agents/base/README.md.
BASE_DIR="/work/.workflow-agents/base"
for f in "$BASE_DIR/prompt-prelude.md" "$BASE_DIR/prompt-postlude.md" "$BASE_DIR/lib/spec-paths.sh" "$BASE_DIR/lib/print-toolchain.sh" "$BASE_DIR/lib/load-agent-role.sh" "$BASE_DIR/prompt-role-dev.md" "$BASE_DIR/prompt-role-qa.md"; do
  if [ ! -f "$f" ]; then
    echo "Missing shared workflow-agent base file: $f" >&2
    echo "Expected .workflow-agents/base/ to be present in the streamed workspace at /work." >&2
    exit 1
  fi
done
# shellcheck source=/dev/null
source "$BASE_DIR/lib/spec-paths.sh"
resolve_spec_dir
if [ ! -f "$SPEC_PATH" ]; then
  echo "Spec not found at: $SPEC_PATH (SPEC=$SPEC)" >&2
  exit 1
fi

# shellcheck source=/dev/null
source "$BASE_DIR/lib/print-toolchain.sh"
# shellcheck source=/dev/null
source "$BASE_DIR/lib/load-agent-role.sh"

if debug_enabled; then
  echo "Starting DeepSeek workflow agent"
  echo "SPEC=$SPEC"
  echo "AGENT_ROLE=$AGENT_ROLE"
  echo "SPEC_PATH=$SPEC_PATH"
  echo "ANTHROPIC_BASE_URL=$ANTHROPIC_BASE_URL"
  echo "ANTHROPIC_MODEL=$ANTHROPIC_MODEL"
  echo "CLAUDE_CODE_EFFORT_LEVEL=$CLAUDE_CODE_EFFORT_LEVEL"
  echo "AGENT_MAX_TURNS=$MAX_TURNS"
  echo "Claude Code version:"
  claude --version || true

  print_toolchain node npm pnpm npx corepack git rg ripgrep jq curl \
    sed awk grep find wc python python3 docker chromium playwright

  echo "Checking DeepSeek Anthropic endpoint reachability"
  curl -sS --connect-timeout 10 --max-time 20 \
    -o /dev/null \
    -w "DeepSeek Anthropic endpoint HTTP status: %{http_code}\n" \
    "$ANTHROPIC_BASE_URL" || true

  echo "Checking DeepSeek API auth with minimal chat completion"
  curl -sS --connect-timeout 10 --max-time 30 \
    -o /dev/null \
    -w "DeepSeek chat completion HTTP status: %{http_code}\n" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
    -d '{
          "model": "deepseek-v4-flash",
          "messages": [{"role": "user", "content": "ping"}],
          "max_tokens": 1,
          "stream": false
        }' \
    "https://api.deepseek.com/chat/completions" || true
fi

# Tool manifest is agent-specific (it describes *this* container).
# Quoted heredoc so backticks and dollar signs in the body stay literal.
TOOL_MANIFEST=$(cat <<'EOF'
Available tools in this container:
- node 22, npm, pnpm 10.33.2, npx, corepack
- git, ripgrep (`rg`), jq, curl, sed, awk, grep, find, wc, plus
  standard GNU coreutils
- **Playwright / headless Chromium** — global `playwright` CLI; shared
  browsers under `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` (baked into
  this image). Add `@playwright/test` to the **workspace** with pnpm,
  then run `pnpm exec playwright test` (or `pnpm exec playwright
  install` if the workspace pins a different Playwright minor and
  needs its own browser download). Prefer pinning `@playwright/test` to
  the same **major** as the image Playwright (see Dockerfile
  `PLAYWRIGHT_VERSION`) to reuse the shared install.

Tools that are NOT available (do not attempt to install them — this
container runs as a non-root user and `apt-get install`,
`brew install`, and `sudo` will all fail):
- docker, podman, or any container build/run CLI. If a spec
  acceptance criterion is "`docker build` works" or "image is under
  N MB", implement the Dockerfile and trust the surrounding CI to
  verify — do not try to build or measure the image yourself.
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
  --model "deepseek-v4-flash" \
  --max-turns "$MAX_TURNS" \
  "${CLAUDE_OUTPUT_ARGS[@]}" \
  --dangerously-skip-permissions
