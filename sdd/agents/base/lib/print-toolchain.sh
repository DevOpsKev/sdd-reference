#!/usr/bin/env bash
# Shared toolchain probe used by sdd/agents/<agent>/run-*.sh
# debug blocks.
#
# Sourcing this file defines `print_toolchain`, which accepts a list
# of binary names and prints whether each is on PATH and at what
# version. Intentionally side-effect free at source time so that
# callers control their own `set -euo pipefail` posture.
#
# Usage (sourced):
#   source /work/sdd/agents/base/lib/print-toolchain.sh
#   print_toolchain node npm pnpm git curl
#
# Usage (executed):
#   /work/sdd/agents/base/lib/print-toolchain.sh node npm pnpm

print_toolchain() {
  echo "In-container toolchain:"
  for tool in "$@"; do
    if command -v "$tool" >/dev/null 2>&1; then
      local version
      version="$("$tool" --version 2>/dev/null | head -n1 || true)"
      printf '  present: %-12s %s\n' "$tool" "${version:-(unknown version)}"
    else
      printf '  missing: %s\n' "$tool"
    fi
  done
}

if [ "${BASH_SOURCE[0]:-}" = "${0:-}" ]; then
  print_toolchain "$@"
fi
