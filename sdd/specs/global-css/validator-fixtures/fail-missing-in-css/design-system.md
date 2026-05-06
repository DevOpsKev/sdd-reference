# Fail: missing in CSS (fixture)

Design-system declares `--paper` and `--ink`. The companion `tokens.css`
declares only `--paper`. The validator must error on `--ink` being absent.

## Paper, ink, accent

| Token     | Value     | Use              |
| --------- | --------- | ---------------- |
| `--paper` | `#ece6d4` | Page background. |
| `--ink`   | `#1a1410` | Primary text.    |
