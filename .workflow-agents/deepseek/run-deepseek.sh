#!/usr/bin/env bash
# Container entrypoint for the DeepSeek-backed Claude Code agent.
#
# Reads SPEC and DEEPSEEK_API_KEY from the environment, locates the
# spec under .sdd/specifications/, and runs Claude Code against
# DeepSeek's Anthropic-compatible API with permissions auto-approved
# and a hard turn cap. Exits when claude exits.
#
# This script does NOT touch git. The workflow that invokes the
# container is responsible for committing, pushing and opening the PR.

set -euo pipefail

: "${SPEC:?SPEC env var is required (e.g. SPEC=helloworld)}"
: "${DEEPSEEK_API_KEY:?DEEPSEEK_API_KEY env var is required}"

export ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
export ANTHROPIC_AUTH_TOKEN="$DEEPSEEK_API_KEY"
export ANTHROPIC_MODEL="deepseek-v4-pro[1m]"
export ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro[1m]"
export ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro[1m]"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
export CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
export CLAUDE_CODE_EFFORT_LEVEL="max"

SPEC_PATH=".sdd/specifications/${SPEC}/spec.md"
if [ ! -f "$SPEC_PATH" ]; then
  echo "Spec not found at: $SPEC_PATH" >&2
  exit 1
fi

echo "Starting DeepSeek workflow agent"
echo "SPEC=$SPEC"
echo "SPEC_PATH=$SPEC_PATH"
echo "ANTHROPIC_BASE_URL=$ANTHROPIC_BASE_URL"
echo "ANTHROPIC_MODEL=$ANTHROPIC_MODEL"
echo "CLAUDE_CODE_EFFORT_LEVEL=$CLAUDE_CODE_EFFORT_LEVEL"
echo "Claude Code version:"
claude --version || true

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

PROMPT=$(cat <<EOF
Read the spec at ${SPEC_PATH}.

If a \`.skills/\` directory exists at the repo root, read every
\`.skills/<name>/SKILL.md\` file before generating code, and apply the
guidance where relevant. Skills describe *how* to do work well (e.g.
visual design quality); the spec describes *what* to build. Skills do
not change scope.

Generate exactly the files the spec describes, at the paths it specifies, and
satisfy its acceptance criteria literally.

Hard constraints:
- Do not modify anything under .sdd/, .skills/, .workflow-agents/,
  .forgejo/, or .husky/. Those are inputs and infrastructure, not
  agent output.
- Do not run any git commands. Do not commit, push, fetch, or modify
  remotes. The surrounding CI workflow handles all version control.
- When the acceptance criteria appear satisfied, stop. Do not keep
  exploring or refactoring beyond what the spec asks for.
EOF
)

exec claude \
  -p "$PROMPT" \
  --model "deepseek-v4-pro[1m]" \
  --max-turns 50 \
  --output-format stream-json \
  --verbose \
  --dangerously-skip-permissions
