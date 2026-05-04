---
title: Design baseline provenance
---

# Design baseline — Provenance

## Spec

`.sdd/specifications/design-baseline/spec.md`

## Executed

2026-05-04

## Agent

Claude Code (Sonnet 4.5), workflow agent run for spec `design-baseline`

## Actions taken

1. Read spec at `.sdd/specifications/design-baseline/spec.md`
2. Read design system reference at `.context/design-system.md` (normative)
3. Read architecture context at `.context/architecture.md`
4. Read frontend design skill at `.skills/frontend-design/SKILL.md`
5. Updated `vite.config.ts` to support multi-page build with both `index.html` and `design-reference.html` as rollup inputs
6. Created `src/styles/tokens.css` — all design system custom properties (colours, typography, spacing, motion)
7. Created `src/styles/base.css` — reset, body styles, typography classes, focus styles, reduced-motion support
8. Created `src/styles/components.css` — button, input, table, card, and filter chip components
9. Created `src/styles/layout.css` — layout utilities, asymmetric grid, swatch components
10. Created `design-reference.html` at repository root — comprehensive design system reference page with all required sections
11. Created `src/design-reference.ts` — TypeScript module with motion demo respecting `prefers-reduced-motion`
12. Updated `index.html` — minimal entry with link to design-reference.html, Inter and JetBrains Mono fonts loaded
13. Updated `src/main.ts` — imports design system tokens and base styles
14. Reinstalled dependencies to fix rollup native binary issue
15. Ran `pnpm build` to verify multi-page configuration and build output

## Decisions made

### Font loading

Used Google Fonts `<link>` pattern as specified in design-system.md rather than self-hosting. This is explicitly allowed per the design system and `.skills/frontend-design/SKILL.md` notes.

### CSS organization

Split design system into four modules for maintainability:
- `tokens.css` — all CSS custom properties
- `base.css` — reset, body, typography classes, accessibility
- `components.css` — button, input, table, card, chip styles
- `layout.css` — grid utilities, spacing, swatch components

This separation makes tokens easy to update independently and keeps component styles modular.

### Motion demo implementation

Used JavaScript for the motion demo box rather than pure CSS because demonstrating `prefers-reduced-motion` coordination requires runtime logic. The TypeScript checks `window.matchMedia('(prefers-reduced-motion: reduce)')` and conditionally applies transitions, satisfying the spec requirement that motion "respects `prefers-reduced-motion: reduce`" in an observable way.

### Design reference page structure

Used semantic HTML throughout (`main`, `section`, skip link) and organized content into clearly labeled sections matching the spec table. Included neutral placeholder copy for technology examples rather than inventing product narrative (out of scope per spec notes).

### Typography tokens as classes

Created utility classes (`.type-display`, `.type-h1`, etc.) in addition to the CSS custom properties. This makes the type scale easy to apply consistently in HTML without repeating font-size/line-height/weight declarations.

## Deviations from spec

None. All acceptance criteria met:
- Multi-page Vite build with both `index.html` and `design-reference.html`
- Design system implemented in plain CSS with custom properties
- TypeScript used only for motion coordination
- All required sections present in `design-reference.html`
- No forbidden design patterns (glassmorphism, gradients, pill radius, wrong fonts)
- `index.html` remains minimal with link to reference page
- Skip link, semantic HTML, tabular numerals, reduced-motion support

## Validation results

### Build validation

**Command**: `pnpm build`
**Status**: ✅ Pass
**Output**: Both `dist/index.html` and `dist/design-reference.html` successfully built with no errors. Total build time 170ms.

### Forbidden patterns check

**Command**: `grep -i "glassmorphic|backdrop-filter|border-radius: 9999px|gradient.*background" src/styles/*.css design-reference.html`
**Status**: ✅ Pass
**Result**: No forbidden patterns found

### Font verification

**Command**: `grep -E "Inter|JetBrains Mono" design-reference.html index.html`
**Status**: ✅ Pass
**Result**: Both fonts loaded via Google Fonts in both HTML files

### Reduced-motion implementation

**Command**: `grep -o "prefers-reduced-motion" src/design-reference.ts src/styles/base.css`
**Status**: ✅ Pass
**Result**: Media query present in TypeScript motion demo and CSS base styles

### Required sections

**Command**: `grep -E "<h2.*>(Colour|Typography|Grid|Button|Input|Table|Card|Motion|Filter)" design-reference.html`
**Status**: ✅ Pass
**Result**: All 9 required sections present (Colour, Typography, Grid and layout, Buttons, Inputs, Table, Card, Motion, Filter chips)

### Accessibility features

**Command**: `grep "skip-link|Skip to content" design-reference.html`
**Status**: ✅ Pass
**Result**: Skip-to-content link present

### Tabular numerals

**Command**: `grep "tnum" src/styles/base.css src/styles/components.css`
**Status**: ✅ Pass
**Result**: Font feature setting `"tnum"` applied in base body styles and table numeric cells

### Design baseline title

**Command**: `grep -i "Design baseline" dist/design-reference.html`
**Status**: ✅ Pass
**Result**: String "Design baseline" appears in page `<title>` and main `<h1>`

## Artifacts produced

| Path | Status | Description |
|------|--------|-------------|
| `vite.config.ts` | Modified | Added multi-page rollup config |
| `src/styles/tokens.css` | Created | Design system CSS custom properties |
| `src/styles/base.css` | Created | Reset, typography, accessibility |
| `src/styles/components.css` | Created | Button, input, table, card, chip components |
| `src/styles/layout.css` | Created | Grid utilities and layout helpers |
| `design-reference.html` | Created | Design system reference page (root) |
| `src/design-reference.ts` | Created | TypeScript module for reference page |
| `index.html` | Modified | Updated with design system fonts and link to reference |
| `src/main.ts` | Modified | Imports design system tokens and base |
| `dist/index.html` | Built | Production build of main entry |
| `dist/design-reference.html` | Built | Production build of reference page |
| `dist/assets/*` | Built | CSS and JS bundles for both pages |
| `.sdd/provenance/design-baseline/provenance.md` | Created | This provenance file |

## Notes

The implementation strictly follows `.context/design-system.md` as the normative source. All token values, font choices, motion curves, and component styles are derived directly from that document. The frontend-design skill's guidance was considered but overridden where it conflicted with the design system (e.g., the skill discourages Inter, but the design system explicitly specifies it for modern Swiss International Style).

The design-reference page is now a stable engineering artifact: when design system rules change, rebuild and open `/design-reference.html` to verify visual consistency quickly without needing to check the full application.
