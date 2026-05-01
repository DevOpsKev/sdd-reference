#!/usr/bin/env sh
# Validate TOML syntax. Mirrors pre-commit-hooks/check-toml.
# Files are passed as positional args by lint-staged.
set -e

[ "$#" -eq 0 ] && exit 0

# Pass file list to Python via argv to keep it simple.
.husky/lib/run-python.sh - "$@" <<'PY'
import sys
import tomllib

failed = 0
for path in sys.argv[1:]:
    try:
        with open(path, "rb") as fh:
            tomllib.load(fh)
    except tomllib.TOMLDecodeError as exc:
        sys.stderr.write(f"check-toml: {path}: {exc}\n")
        failed += 1

sys.exit(1 if failed else 0)
PY
