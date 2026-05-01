#!/usr/bin/env sh
# Resolve the right Python interpreter and exec it with the given args.
#
# Lookup order:
#   1. ./.venv/bin/python(3)   - project virtualenv (recommended local setup)
#   2. ./venv/bin/python(3)    - alternate virtualenv name
#   3. python3 on PATH         - devcontainer / system / pyenv
#
# This lets contributors keep dev deps (ruff, pyyaml) inside a project venv
# without needing to activate it before every `git commit`.
set -e

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

for candidate in \
    "$ROOT/.venv/bin/python" \
    "$ROOT/.venv/bin/python3" \
    "$ROOT/venv/bin/python" \
    "$ROOT/venv/bin/python3"; do
    if [ -x "$candidate" ]; then
        exec "$candidate" "$@"
    fi
done

exec python3 "$@"
