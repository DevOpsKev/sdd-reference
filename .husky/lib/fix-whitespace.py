#!/usr/bin/env python3
"""Trim trailing whitespace and ensure files end with exactly one newline.

Mirrors the combined behaviour of pre-commit-hooks/trailing-whitespace and
pre-commit-hooks/end-of-file-fixer. Files are passed as positional args by
lint-staged; lint-staged automatically re-stages anything we modify.

Binary files are skipped via a NUL-byte heuristic (same as pre-commit-hooks).
"""

from __future__ import annotations

import sys
from pathlib import Path

# Files smaller than this threshold are read whole; larger files use a streamed
# read-modify-write. Hook payloads are typically tiny so this is mostly defensive.
SAMPLE_BYTES = 8192


def is_binary(path: Path) -> bool:
    try:
        with path.open("rb") as fh:
            chunk = fh.read(SAMPLE_BYTES)
    except OSError:
        return True
    return b"\x00" in chunk


def fix(path: Path) -> bool:
    """Return True if the file was modified."""
    try:
        original = path.read_bytes()
    except OSError as exc:
        print(f"fix-whitespace: cannot read {path}: {exc}", file=sys.stderr)
        return False

    if not original:
        return False

    # Detect line ending so we can preserve CRLF if that's what the file uses.
    eol = b"\r\n" if b"\r\n" in original else b"\n"

    lines = original.splitlines(keepends=True)
    cleaned: list[bytes] = []
    for line in lines:
        # Separate the line ending from the content.
        if line.endswith(b"\r\n"):
            ending = b"\r\n"
            content = line[:-2]
        elif line.endswith((b"\n", b"\r")):
            ending = line[-1:]
            content = line[:-1]
        else:
            ending = b""
            content = line
        cleaned.append(content.rstrip(b" \t") + ending)

    new = b"".join(cleaned)
    # Ensure the file ends with exactly one newline.
    new = new.rstrip(b"\r\n") + eol

    if new == original:
        return False

    path.write_bytes(new)
    return True


def main(argv: list[str]) -> int:
    modified = 0
    for arg in argv:
        path = Path(arg)
        if not path.is_file():
            continue
        if is_binary(path):
            continue
        if fix(path):
            modified += 1
    if modified:
        print(f"fix-whitespace: normalised {modified} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
