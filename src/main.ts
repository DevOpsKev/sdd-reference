/**
 * Entry point for Vite's stylesheet bundling.
 *
 * The homepage is pre-rendered at build time by build/generate-index.ts.
 * This module exists solely so Vite knows to bundle src/styles/index.css
 * and inject the stylesheet link into dist/index.html.
 *
 * No client-side JavaScript runs on the homepage — the page is fully static.
 */

import './styles/index.css';
