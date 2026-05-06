# Pass baseline (fixture)

A minimal design-system fragment with two tokens and one non-token table.
Used by `pnpm test:validator` to verify the validator passes on a
correctly-aligned input.

## Paper, ink, accent

| Token        | Value     | Use                          |
| ------------ | --------- | ---------------------------- |
| `--paper`    | `#ece6d4` | Page background.             |
| `--ink`      | `#1a1410` | Primary text.                |

## Type

This table uses `Voice` as its first column and must be ignored by the validator.

| Voice    | Family         | Role                |
| -------- | -------------- | ------------------- |
| **Body** | Special Elite  | The typewriter.     |
