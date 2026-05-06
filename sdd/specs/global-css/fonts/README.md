# Fonts

Eight subsetted woff2 files belong in this directory. They are the
authoritative source — the implementing agent copies them byte-identically
to `src/public/fonts/`.

## Required files

Names match **`spec.md`** file mapping and **`base.css`** `url('/fonts/…')` entries (`-vNN-latin-…` per google-webfonts-helper).

| File                                           | Family             | Weight | Style  |
| ---------------------------------------------- | ------------------ | ------ | ------ |
| `special-elite-v20-latin-regular.woff2`        | Special Elite      | 400    | normal |
| `anton-v27-latin-regular.woff2`                | Anton              | 400    | normal |
| `stardos-stencil-v15-latin-regular.woff2`       | Stardos Stencil    | 400    | normal |
| `stardos-stencil-v15-latin-700.woff2`          | Stardos Stencil    | 700    | normal |
| `permanent-marker-v16-latin-regular.woff2`      | Permanent Marker   | 400    | normal |
| `jetbrains-mono-v24-latin-regular.woff2`       | JetBrains Mono     | 400    | normal |
| `jetbrains-mono-v24-latin-500.woff2`           | JetBrains Mono     | 500    | normal |
| `jetbrains-mono-v24-latin-700.woff2`           | JetBrains Mono     | 700    | normal |

## Subsetting

Each file must be subsetted to **Latin and Latin Extended** (Unicode ranges
`U+0000-024F`, plus the few additional ranges Google's Latin and Latin-ext
subsets cover — see [google-webfonts-helper][gwfh] for the canonical
ranges). This covers the Hungarian diacritics in copy like "Soroksári út"
without bloating the payload with full multilingual coverage.

## Sourcing

The simplest path is [google-webfonts-helper][gwfh]:

1. Search for each family.
2. Select the weights listed above.
3. Choose **Latin** and **Latin Extended** subsets.
4. Choose **Modern Browsers** (woff2 only).
5. Download and rename to match the filenames in the table above.
6. Commit alongside this README.

Permanent Marker and Special Elite are typically distributed with `latin`
only on Google Fonts; that's acceptable as long as the unit's copy doesn't
need diacritics in those typefaces (annotations and the wordmark are
ASCII-only by current design).

[gwfh]: https://gwfh.mranftl.dev/

## Verification

The spec's acceptance criterion checks that each woff2 file at
`src/public/fonts/` is byte-identical to its source here. Once committed
to this directory, files are immutable for the lifetime of the spec —
re-subsetting or replacing means a spec amendment.
