/**
 * Docket strip — the page-top status strip.
 *
 * Authoritative source: sdd/specs/site/components/docket-strip/docket-strip.ts
 * Target path:          src/templates/components/docket-strip.ts
 *
 * Spec: sdd/specs/site/components/docket-strip/spec.md
 *
 * Pure rendering. Accepts typed input, returns an HTML string. Computes
 * nothing — date formatting, DKT generation, and open/closed state are
 * the caller's responsibility (eventually pages/base/).
 */

export interface DocketStripData {
  /** True when the unit is currently within its 22:00–05:00 working hours. */
  open: boolean;

  /** DKT reference code, e.g. "DKT-2026-W19-006". Always shown verbatim. */
  dktRef: string;

  /** Pre-formatted date label, e.g. "WED 06.05.2026 / 02:14". */
  dateLabel: string;

  /** Unit location label, e.g. "UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX". */
  unitLabel: string;
}

/**
 * Escape interpolated text against HTML injection. Local implementation
 * pending the shared helper from build/render.ts (delivered by the
 * static-build spec). Order matters — & must be replaced first.
 */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render the docket strip.
 *
 * Open state shows a pulsing dot followed by "UNIT OPEN — STAFF ON SITE".
 * Closed state shows "UNIT CLOSED" with no dot.
 */
export function docketStrip(data: DocketStripData): string {
  const status = data.open
    ? `<span class="docket-strip__status docket-strip__status--open">
        <span class="docket-strip__pulse" aria-hidden="true"></span>
        UNIT OPEN — STAFF ON SITE
      </span>`
    : `<span class="docket-strip__status docket-strip__status--closed">
        UNIT CLOSED
      </span>`;

  return `<div class="docket-strip">
  <div class="docket-strip__side docket-strip__side--left">
    ${status}
    <span class="docket-strip__sep" aria-hidden="true">·</span>
    <span class="docket-strip__ref">${escape(data.dktRef)}</span>
  </div>
  <div class="docket-strip__side docket-strip__side--right">
    <span class="docket-strip__date">${escape(data.dateLabel)}</span>
    <span class="docket-strip__sep" aria-hidden="true">·</span>
    <span class="docket-strip__unit">${escape(data.unitLabel)}</span>
  </div>
</div>`;
}
