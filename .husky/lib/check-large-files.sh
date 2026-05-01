#!/usr/bin/env sh
# Block commits that add files larger than the given limit (in KB).
# Mirrors pre-commit-hooks/check-added-large-files behaviour.
set -e

max_kb="${1:-500}"
max_bytes=$((max_kb * 1024))
violations=0

# Only inspect files added or modified in the index (not deletions).
files=$(git diff --cached --name-only --diff-filter=ACMR -z | tr '\0' '\n')

[ -z "$files" ] && exit 0

while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ -f "$file" ] || continue
    size=$(wc -c < "$file" | tr -d ' ')
    if [ "$size" -gt "$max_bytes" ]; then
        kb=$((size / 1024))
        printf 'check-large-files: %s is %dKB (limit %dKB)\n' "$file" "$kb" "$max_kb" >&2
        violations=$((violations + 1))
    fi
done <<EOF
$files
EOF

if [ "$violations" -gt 0 ]; then
    printf '\nCommit blocked: %d file(s) exceed the %dKB limit.\n' "$violations" "$max_kb" >&2
    exit 1
fi
