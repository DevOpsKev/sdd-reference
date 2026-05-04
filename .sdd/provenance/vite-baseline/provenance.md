---
title: vite-baseline provenance
---

# Provenance — vite-baseline

## Spec

`.sdd/specifications/vite-baseline/spec.md`

## Executed

2026-05-04T13:30:00Z

## Agent

- **Role:** qa
- **Tool:** Claude Code workflow agent
- **Model:** claude-sonnet-4-5
- **Context:** QA verification pass for vite-baseline spec implementation

## Actions taken

1. Read spec at `.sdd/specifications/vite-baseline/spec.md`
2. Read architecture context at `.context/architecture.md`
3. Read `package.json` to verify dependencies and scripts
4. Read `Dockerfile` to verify multi-stage build structure
5. Read `index.html` to check for required "Vite baseline" string
6. Read `tsconfig.json` to verify strict mode
7. Read `vite.config.ts` to verify configuration
8. Read `src/main.ts` to verify TypeScript entry structure
9. Executed `CI=true pnpm install --frozen-lockfile` to verify installation
10. Executed `pnpm build` to verify build process and dist/ generation
11. Inspected `dist/` directory contents
12. Searched for "Vite baseline" string in both source and built HTML (grep)
13. Created `.sdd/scenarios/vite-baseline/scenarios.md` with 7 test scenarios
14. Created this provenance document

## Decisions made

- **Test execution approach:** Ran commands available in the container (pnpm, grep, filesystem checks) rather than attempting Docker build or browser verification, which are explicitly unavailable per the tool manifest.
- **CI flag:** Used `CI=true` environment variable for pnpm install to avoid TTY-related errors in non-interactive container environment.
- **Scenario granularity:** Created 7 discrete scenarios covering each major acceptance criterion rather than a single aggregate test, allowing precise failure localization.
- **Failure reporting:** Documented the "Vite baseline" string absence as a high-severity failure with reproduction steps and spec line reference, per QA role guidance to report honest failures rather than weakening coverage.

## Deviations from spec

None intentional. This is a QA verification run; no product code was modified.

**Gap identified:** The implementation deviates from the spec requirement at lines 50-51 by omitting the exact string "Vite baseline" from the HTML document. See validation results below.

## Validation results

| Check | Command/Method | Result | Notes |
|-------|----------------|--------|-------|
| vite + typescript in devDependencies | Read package.json | ✓ PASS | vite ^6.0.11, typescript ^5.7.3 |
| Scripts (dev, build, preview) | Read package.json | ✓ PASS | All three scripts configured correctly |
| pnpm-lock.yaml present | ls /work/ | ✓ PASS | 27907 bytes, committed |
| pnpm install succeeds | `CI=true pnpm install --frozen-lockfile` | ✓ PASS | Required CI=true flag |
| pnpm build produces dist/ | `pnpm build` | ✓ PASS | Completed in 344ms |
| dist/index.html exists | ls /work/dist/ | ✓ PASS | 13.90 kB generated |
| Hashed assets present | ls /work/dist/assets/ | ✓ PASS | 8 CSS/JS files with content hashes |
| "Vite baseline" string | `grep -i "vite baseline" index.html dist/index.html` | ✗ **FAIL** | String not found in source or built HTML |
| TypeScript strict mode | Read tsconfig.json | ✓ PASS | `"strict": true` at line 17 |
| Dockerfile multi-stage | Read Dockerfile | ✓ PASS | Builder + nginx:alpine stages |
| Dockerfile runs pnpm build | Read Dockerfile | ✓ PASS | Line 20: `RUN pnpm build` |
| Runtime uses nginx:alpine | Read Dockerfile | ✓ PASS | Line 23: `FROM nginx:alpine` |
| Only dist/ in runtime | Read Dockerfile | ✓ PASS | Line 26: copies only /app/dist |
| Port 8080 configured | Read Dockerfile | ✓ PASS | Lines 29-30: sed for port 8080, EXPOSE 8080 |
| Docker build/run | Skipped | N/A | Docker unavailable in this container |
| HTTP GET / returns 200 | Skipped | N/A | No HTTP client/browser available |
| index.html at root | ls /work/ | ✓ PASS | Present |
| src/main.ts entry | ls /work/src/ | ✓ PASS | Present, imports CSS |
| vite.config.ts | ls /work/ | ✓ PASS | Multi-page config with both HTML entries |

**Summary:** 15/15 available checks executed. 14 passed, 1 failed. 2 checks (Docker build, HTTP response) skipped due to unavailable tooling in QA container.

**Critical failure:** Spec acceptance criterion at line 57 requires `GET /` to return body containing "Vite baseline". The source and built HTML files contain "Tech Sovereignty Radar" throughout but no "Vite baseline" string. This violates the explicit requirement at spec lines 50-51:

> "The served HTML must include the exact string **`Vite baseline`** in the document (e.g. in `<title>` or visible text) so smoke checks are unambiguous and distinct from the `helloworld` spec's phrasing."

The implementation appears to contain full product content rather than the "minimal placeholder page" described in the spec intent (line 7).

## Artifacts produced

| Path | Status | Description |
|------|--------|-------------|
| `.sdd/scenarios/vite-baseline/scenarios.md` | Created | 7 test scenarios with detailed pass/fail results |
| `.sdd/provenance/vite-baseline/provenance.md` | Created | This document |

## Conclusion

The vite-baseline implementation satisfies toolchain, build, and Docker structure requirements but fails the acceptance criterion requiring the "Vite baseline" string in the HTML document. The failure is high-severity because it prevents unambiguous smoke testing as specified. The implementation appears to have incorporated product content ("Tech Sovereignty Radar" homepage) beyond the scope of a minimal placeholder, which the spec explicitly reserves for later work.

Remediation: Add "Vite baseline" to the document title or visible text. Simplest fix: change `<title>Tech Sovereignty Radar</title>` to `<title>Vite baseline — Tech Sovereignty Radar</title>` or similar.

---

## QA pass — 2026-05-04T13:51:33Z

### Agent context

- **Role:** qa
- **Tool:** Claude Code workflow agent
- **Model:** claude-sonnet-4-5
- **Session:** Second QA verification pass with automated end-to-end tests

### Actions taken

1. Read spec at `.sdd/specifications/vite-baseline/spec.md`
2. Read architecture context at `.context/architecture.md`
3. Verified existing provenance at `.sdd/provenance/vite-baseline/provenance.md`
4. Verified existing scenarios at `.sdd/scenarios/vite-baseline/scenarios.md`
5. Checked git log to understand implementation history (vite-baseline executed, then homepage spec overwrote content)
6. Added `@playwright/test ^1.50.1` to `package.json` devDependencies (matching container Playwright major version)
7. Created `playwright.config.ts` with webServer configuration for `vite preview`
8. Created `e2e/vite-baseline.spec.ts` with 7 automated test scenarios
9. Added `test:e2e` script to `package.json`
10. Executed `pnpm install --no-frozen-lockfile` to add Playwright dependency and update lockfile
11. Executed `pnpm exec playwright install chromium` to download browser binaries (170 MB Chrome + 112 MB headless shell)
12. Executed `pnpm test:e2e` to run automated tests (7 scenarios, 16.9s total)
13. Fully overwrote `.sdd/scenarios/vite-baseline/scenarios.md` with automated test documentation
14. Appending to this provenance document

### Decisions made

- **Automated testing approach:** Created Playwright end-to-end tests that start a preview server, load the page in a real browser, and verify acceptance criteria programmatically. This provides reproducible, executable validation that anyone can run via `pnpm test:e2e`.
- **Test framework version:** Pinned `@playwright/test` to `^1.50.1` to match the container's Playwright CLI major version, but pnpm resolved to `1.59.1` (latest patch). Required separate browser download (`pnpm exec playwright install chromium`) as shared browsers at `/ms-playwright/chromium-1217` were incompatible.
- **Test scope:** Created 7 focused scenarios covering HTTP response, content-type, required string presence (the failure case), CSS/JS loading, HTML structure, and console errors. Did not attempt Docker build verification (unavailable per tool manifest).
- **Honest failure reporting:** Test SC-03 ("Page contains required 'Vite baseline' string") failed as expected with clear error message showing title is "Tech Sovereignty Radar" and body/HTML contain no "vite baseline" string. This confirms the spec violation in a reproducible way.
- **Playwright configuration:** Used `webServer` feature to automatically start `pnpm preview --port 5173` before tests and shut it down after, eliminating manual server management.

### Deviations from spec

None intentional. This is a QA verification run with test automation added.

**No product code changes:** All changes are test infrastructure only (package.json, playwright.config.ts, e2e/vite-baseline.spec.ts, pnpm-lock.yaml update). The "Vite baseline" string failure persists as documented.

### Validation results

Automated Playwright test execution via `pnpm test:e2e`:

| Test | Method | Result | Duration | Notes |
|------|--------|--------|----------|-------|
| SC-01: Page loads with 200 status | Playwright HTTP assertion | ✓ PASS | 4.0s | Preview server started, page navigable |
| SC-02: HTML content-type header | Response header check | ✓ PASS | 4.8s | Headers correct |
| SC-03: "Vite baseline" string present | Title/body/HTML text search | ✗ **FAIL** | 5.1s | **Expected "Vite baseline", actual "Tech Sovereignty Radar"** |
| SC-04: CSS assets loaded | Computed style check | ✓ PASS | 4.5s | Body background color applied |
| SC-05: JavaScript module loaded | DOM script tag count | ✓ PASS | 5.0s | Module script present |
| SC-06: HTML structure proper | Meta tag assertions | ✓ PASS | 4.9s | Lang, charset, viewport correct |
| SC-07: No console errors | Console event listener | ✓ PASS | 1.6s | Zero errors logged |

**Summary:** 6/7 tests passed, 1 failed (SC-03). Total execution time: 16.9 seconds.

**SC-03 failure detail:**
```
Error: Expected "Vite baseline" string in document.
Title: "Tech Sovereignty Radar",
Body contains: false,
HTML contains: false
```

This is the same high-severity failure documented in the previous QA pass. The automated test provides a reproducible verification method that future CI runs can execute.

### Additional checks

| Check | Command/Method | Result |
|-------|----------------|--------|
| pnpm install with updated lockfile | `pnpm install --no-frozen-lockfile` | ✓ PASS |
| pnpm build (rebuild after changes) | `pnpm build` | ✓ PASS (684ms) |
| Playwright browser installation | `pnpm exec playwright install chromium` | ✓ PASS (282 MB downloaded) |
| Test suite execution | `pnpm test:e2e` | ✗ FAIL (1/7 scenarios failed) |

### Artifacts produced

| Path | Status | Description |
|------|--------|-------------|
| `package.json` | Modified | Added `@playwright/test ^1.50.1` and `test:e2e` script |
| `pnpm-lock.yaml` | Modified | Updated with Playwright dependency tree |
| `playwright.config.ts` | Created | Playwright configuration with webServer for vite preview |
| `e2e/vite-baseline.spec.ts` | Created | 7 automated test scenarios (82 lines) |
| `.sdd/scenarios/vite-baseline/scenarios.md` | Fully overwritten | Documented automated test results, reproducibility instructions |
| `.sdd/provenance/vite-baseline/provenance.md` | Appended | This QA pass section |

### Findings

1. **Critical spec violation persists:** The "Vite baseline" string requirement remains unmet. Automated test SC-03 provides executable proof of the failure.

2. **Reproducible verification now available:** Anyone can run `pnpm install && pnpm build && pnpm test:e2e` to verify acceptance criteria. The test suite is committed and ready for CI integration.

3. **Playwright version mismatch note:** Container has Playwright 1.50.1 CLI, but workspace resolved @playwright/test to 1.59.1. Required separate browser download. Future runs could pin to `1.50.1` exactly to reuse `/ms-playwright/` browsers, but current setup works correctly.

4. **Test execution is fast:** 17 seconds for full browser-based verification is acceptable for CI. Preview server startup is automatic via `webServer` config.

5. **No other regressions detected:** All technical aspects (build, HTTP serving, CSS/JS loading, HTML structure, console cleanliness) pass automated checks. Only the explicit "Vite baseline" string requirement fails.

### Recommendations

1. **Fix SC-03 failure:** Add "Vite baseline" to `<title>` or visible text. Example: `<title>Vite baseline — Tech Sovereignty Radar</title>` satisfies the spec while preserving product branding.

2. **Run tests in CI:** Add `pnpm test:e2e` after `pnpm build` in `.forgejo/workflows/workflow-agents.yml` to catch spec violations before merge.

3. **Consider spec vs reality:** The spec describes "scaffolding and a minimal placeholder page" but the implementation is a full product homepage. If this is intentional, update the spec to reflect actual scope. If not, consider whether homepage content should live in a separate spec.

4. **Pin Playwright version:** Change `@playwright/test` to exact `1.50.1` in package.json to match container and avoid extra browser downloads. Current `^1.50.1` resolved to `1.59.1`.

### Conclusion

This QA pass added automated end-to-end tests using Playwright to provide reproducible verification of the vite-baseline spec acceptance criteria. Results confirm the previous manual QA finding: the implementation meets all technical requirements (toolchain, build, Dockerfile structure, runtime behavior) but fails the explicit requirement to include the string "Vite baseline" in the HTML document. This failure is now verifiable via `pnpm test:e2e` and ready for CI integration.
