#!/usr/bin/env sh
# Run gitleaks against the staged content. Mirrors the gitleaks pre-commit hook.
set -e

if ! command -v gitleaks >/dev/null 2>&1; then
    cat >&2 <<'EOF'
gitleaks: binary not found on PATH.

Install it before committing:
  brew install gitleaks                       # macOS
  go install github.com/gitleaks/gitleaks/v8@latest
  # or download a release: https://github.com/gitleaks/gitleaks/releases

To bypass this hook for a single commit (use sparingly), run:
  git commit --no-verify
EOF
    exit 1
fi

gitleaks protect --staged --redact --verbose
