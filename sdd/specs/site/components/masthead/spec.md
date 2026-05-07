# Masthead

## Intent

Add the **masthead** component (`src/templates/components/masthead.ts` + `src/styles/components/masthead.css`) matching `sdd/reference/vision.html` (wordmark, stamps row, meta column). **Layout and call site** — where `masthead()` is invoked — are defined in **`sdd/specs/site/pages/base/spec.md`**; the homepage passes **`MastheadData`** via **`basePage`** per **`sdd/specs/site/pages/home/spec.md`**.

**Run second**, after `sdd/specs/site/components/docket-strip/` and **before** `sdd/specs/site/components/nav-tabs/` and **`pages/base`**.

Do not read `sdd/context/` or other specs unless something here is unclear.

## Preconditions

- `src/templates/components/docket-strip.ts` and `src/styles/index.css` exist per the docket-strip spec.
- Global tokens include `--ink`, `--ink-soft`, `--ink-faded`, `--orange`, `--red` (used by the CSS below).

## Authoritative CSS

Create `src/styles/components/masthead.css` with **exactly** this content:

```css
.masthead {
  padding: 3rem 0 2.5rem;
  border-bottom: 1px dashed var(--ink-faded);
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2.5rem;
  align-items: end;
}
@media (max-width: 720px) {
  .masthead {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 2rem 0 2rem;
  }
}

.wordmark-stamp {
  display: inline-block;
  padding: 0.7rem 1.2rem 0.5rem;
  border: 4px solid var(--ink);
  transform: rotate(-1.8deg);
  background: transparent;
  position: relative;
  font-family: 'Anton', sans-serif;
  font-size: clamp(2.5rem, 7vw, 5rem);
  line-height: 0.85;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.wordmark-stamp::before {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid var(--ink);
  opacity: 0.4;
  transform: translate(2px, 1.5px);
  pointer-events: none;
}
.wordmark-stamp::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 5% 95%, var(--ink) 0.5px, transparent 1.5px),
    radial-gradient(circle at 92% 8%, var(--ink) 0.5px, transparent 1.5px),
    radial-gradient(circle at 30% 8%, var(--ink) 0.4px, transparent 1px);
  opacity: 0.35;
  pointer-events: none;
}

.masthead-meta {
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.7;
}
@media (max-width: 720px) {
  .masthead-meta {
    text-align: left;
  }
}
.masthead-meta strong {
  font-weight: 700;
  font-size: 0.85rem;
}
.masthead-meta .tagline {
  font-family: 'Special Elite', monospace;
  font-size: 0.85rem;
  text-transform: none;
  letter-spacing: 0;
  color: var(--ink-soft);
  margin-top: 0.5rem;
  font-style: italic;
  max-width: 36ch;
  margin-left: auto;
}
@media (max-width: 720px) {
  .masthead-meta .tagline {
    margin-left: 0;
  }
}

.stamps-row {
  display: flex;
  gap: 1.25rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  align-items: center;
}
.stamp {
  display: inline-block;
  padding: 0.35em 0.75em;
  border: 2px solid var(--orange);
  color: var(--orange);
  font-family: 'Stardos Stencil', sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transform: rotate(-3deg);
  background: transparent;
  line-height: 1;
}
.stamp.red {
  border-color: var(--red);
  color: var(--red);
  transform: rotate(2deg);
}
.stamp.ink {
  border-color: var(--ink);
  color: var(--ink);
  transform: rotate(-1deg);
}
.stamp.lg {
  font-size: 1.1rem;
  padding: 0.4em 0.9em;
}
.stamp.flat {
  transform: none;
}
```

## Authoritative TypeScript

Create `src/templates/components/masthead.ts` — no imports from elsewhere; escape every interpolated string with a local `escape()` for `& < > " '`:

```ts
export interface MastheadData {
  metaTitle: string;
  metaLine2: string;
  metaLine3: string;
  metaLine4: string;
  tagline: string;
  stampDefault: string;
  stampInk: string;
  stampRed: string;
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function masthead(data: MastheadData): string {
  return `<header class="masthead">
  <div>
    <span class="wordmark-stamp">VINYL<br>TRAFFIC</span>
    <div class="stamps-row">
      <span class="stamp">${escape(data.stampDefault)}</span>
      <span class="stamp ink">${escape(data.stampInk)}</span>
      <span class="stamp red">${escape(data.stampRed)}</span>
    </div>
  </div>
  <div class="masthead-meta">
    <div><strong>${escape(data.metaTitle)}</strong></div>
    <div>${escape(data.metaLine2)}</div>
    <div>${escape(data.metaLine3)}</div>
    <div>${escape(data.metaLine4)}</div>
    <p class="tagline">${escape(data.tagline)}</p>
  </div>
</header>`;
}
```

## Composition

- **`src/templates/pages/base.ts`** calls **`masthead(data.masthead)`** per **`sdd/specs/site/pages/base/spec.md`**.
- **`src/templates/pages/home.ts`** supplies the **`masthead`** object on **`basePage({ ... })`** per **`sdd/specs/site/pages/home/spec.md`**. **`home.ts` must not** import or invoke **`masthead()`** — only pass data.

## Wiring (this spec)

- Add `@import "./components/masthead.css";` to `src/styles/index.css` **after** the docket-strip import.

## Acceptance criteria

- [ ] `src/styles/components/masthead.css` matches the CSS block byte-for-byte.
- [ ] `src/templates/components/masthead.ts` matches the TypeScript block byte-for-byte.
- [ ] `src/templates/pages/base.ts` matches **`sdd/specs/site/pages/base/spec.md`** and **imports** `masthead`.
- [ ] `src/templates/pages/home.ts` matches **`sdd/specs/site/pages/home/spec.md`** (includes **`masthead: { ... }`** on **`basePage`**).
- [ ] `src/styles/index.css` imports `masthead.css`.
- [ ] Emitted `/` HTML: under `.page`, **`header.masthead`** is the **second** direct child (after `.docket`, before `nav.tabs` and `<main>`).
- [ ] `pnpm build` succeeds; `pnpm preview` shows wordmark **VINYL** / **TRAFFIC**, three stamps, meta lines, and tagline text as in **`pages/home`** spec.
- [ ] **`e2e/home.spec.ts`**: assert `header.masthead` is visible, `.wordmark-stamp` contains both words, one `.stamp` per variant (default / `.ink` / `.red`), and `.masthead-meta .tagline` matches the tagline string (or a stable substring).
- [ ] `provenance.md` / `scenarios.md` per `AGENT_ROLE`.

## Out of scope

Nav tabs (**`sdd/specs/site/components/nav-tabs/spec.md`**), sections below the masthead in `vision.html`, `paper-rise` or other motion, tape decorations, other routes, font preload additions, changing docket or build helpers, social meta, i18n.
