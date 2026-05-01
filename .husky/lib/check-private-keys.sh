#!/usr/bin/env sh
# Block commits that introduce private-key material.
# Mirrors pre-commit-hooks/detect-private-key.
#
# The recurring suffix is assembled at runtime from non-contiguous parts so
# this script does not itself contain the literal trigger strings — otherwise
# staging this very file would set off the check.
set -e

# Equivalent to "PRIVATE KEY", but the source never has those two words next
# to each other. Same trick for the SSH2 helper marker.
SFX="$(printf '%s %s' 'PRIVATE' 'KEY')"
PUTTY="$(printf '%s%s' 'PuTTY-User-' 'Key-File-2')"

patterns="BEGIN RSA ${SFX}
BEGIN DSA ${SFX}
BEGIN EC ${SFX}
BEGIN OPENSSH ${SFX}
BEGIN ${SFX}
${PUTTY}
BEGIN SSH2 ENCRYPTED ${SFX}
BEGIN PGP ${SFX} BLOCK
BEGIN ENCRYPTED ${SFX}"

violations=0
files=$(git diff --cached --name-only --diff-filter=ACMR -z | tr '\0' '\n')

[ -z "$files" ] && exit 0

while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ -f "$file" ] || continue
    while IFS= read -r pattern; do
        if grep -q -- "$pattern" "$file" 2>/dev/null; then
            printf 'detect-private-key: %s contains "%s"\n' "$file" "$pattern" >&2
            violations=$((violations + 1))
            break
        fi
    done <<EOF_PATTERNS
$patterns
EOF_PATTERNS
done <<EOF_FILES
$files
EOF_FILES

if [ "$violations" -gt 0 ]; then
    printf '\nCommit blocked: secret material detected in staged files.\n' >&2
    exit 1
fi
