#!/usr/bin/env bash
# Resolve paths from SPEC: repo-relative path to the spec directory (e.g.
# sdd/specs/vite-baseline, sdd/specs/homepage/header). That directory must contain spec.md;
# provenance.md and scenarios.md live alongside it.
#
# Inputs:  SPEC (required), e.g. sdd/specs/vite-baseline or ./sdd/specs/homepage
# Exports: SPEC — normalized spec directory (no ./, no trailing slash)
#          SDD_SPEC_DIR — same as SPEC (explicit alias for prompts)
#          SPEC_PATH — ${SDD_SPEC_DIR}/spec.md
#          SDD_PROVENANCE_PATH — ${SDD_SPEC_DIR}/provenance.md
#          SDD_SCENARIOS_PATH — ${SDD_SPEC_DIR}/scenarios.md
#          SPEC_SLUG — slashes replaced with "-" (CI branch / tmp dirs)

resolve_spec_dir() {
  : "${SPEC:?SPEC env var is required (e.g. SPEC=sdd/specs/vite-baseline)}"

  local d="$SPEC"
  d="${d#"${d%%[![:space:]]*}"}"
  d="${d%"${d##*[![:space:]]}"}"
  d="${d#./}"
  d="${d#/work/}"
  d="${d%/}"

  if [ -z "$d" ]; then
    echo "SPEC is empty after normalization" >&2
    return 1
  fi

  case "$d" in
    *..*)
      echo "Invalid SPEC (path traversal): $SPEC" >&2
      return 1
      ;;
    .* | ./*)
      echo "Invalid SPEC (must not start with .): $SPEC" >&2
      return 1
      ;;
    /*)
      echo "Invalid SPEC (absolute path): $SPEC" >&2
      return 1
      ;;
    sdd/*) ;;
    *)
      echo "SPEC must be a repo-relative path under sdd/, e.g. sdd/specs/homepage (got: $SPEC)" >&2
      return 1
      ;;
  esac

  case "$d" in
    sdd/specs)
      echo "Invalid SPEC: use a directory under sdd/specs/ that contains spec.md, not sdd/specs alone (got: $SPEC)" >&2
      return 1
      ;;
    sdd/specs/*) ;;
    *)
      echo "SPEC must be under sdd/specs/, e.g. sdd/specs/vite-baseline (got: $SPEC)" >&2
      return 1
      ;;
  esac

  export SPEC="$d"
  export SDD_SPEC_DIR="$d"
  export SPEC_PATH="${SDD_SPEC_DIR}/spec.md"
  export SDD_PROVENANCE_PATH="${SDD_SPEC_DIR}/provenance.md"
  export SDD_SCENARIOS_PATH="${SDD_SPEC_DIR}/scenarios.md"
  export SPEC_SLUG="${SDD_SPEC_DIR//\//-}"
}
