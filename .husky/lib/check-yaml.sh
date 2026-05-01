#!/usr/bin/env sh
# Validate YAML syntax. Mirrors pre-commit-hooks/check-yaml.
# Files are passed as positional args by lint-staged.
# .gitlab-ci.yml is intentionally excluded (it uses GitLab's `spec:inputs`,
# which is a custom YAML extension that strict parsers reject).
set -e

[ "$#" -eq 0 ] && exit 0

.husky/lib/run-python.sh - "$@" <<'PY'
import os
import sys

try:
    import yaml
except ModuleNotFoundError:
    sys.stderr.write(
        "check-yaml: PyYAML is not installed. Install with `pip install pyyaml`.\n"
    )
    sys.exit(1)

EXCLUDED = {".gitlab-ci.yml"}

failed = 0
for path in sys.argv[1:]:
    if os.path.basename(path) in EXCLUDED:
        continue
    try:
        with open(path, "rb") as fh:
            list(yaml.safe_load_all(fh))
    except yaml.YAMLError as exc:
        sys.stderr.write(f"check-yaml: {path}: {exc}\n")
        failed += 1

sys.exit(1 if failed else 0)
PY
