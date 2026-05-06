# Fail: extra in CSS (fixture)

Design-system declares only `--paper`. The companion `tokens.css` declares
`--paper` and `--ink`. The validator must error on `--ink` being unauthorised.

## Paper, ink, accent

| Token     | Value     | Use              |
| --------- | --------- | ---------------- |
| `--paper` | `#ece6d4` | Page background. |
