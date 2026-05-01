#!/usr/bin/env sh
# Block commits that contain unresolved merge-conflict markers.
# Mirrors pre-commit-hooks/check-merge-conflict.
set -e

# git diff --check exits non-zero if conflict markers or whitespace errors exist
# in the staged content. We want only conflict markers, so we filter the output.
conflict_output=$(git diff --cached --check 2>&1 || true)

if printf '%s\n' "$conflict_output" | grep -qE 'leftover conflict marker'; then
    printf 'check-merge-conflict: unresolved merge conflict markers found:\n\n' >&2
    printf '%s\n' "$conflict_output" | grep 'leftover conflict marker' >&2
    exit 1
fi
