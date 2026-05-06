/**
 * Home page — the route at / and first concrete page composition.
 *
 * Spec: sdd/specs/site/pages/home/spec.md
 *
 * Composes pages/base/ with build-time-fresh docket data and an empty content
 * slot. This is the first homepage spec that produces dist/index.html for /.
 * Content blocks (dispatch sheet, stockroom grid, etc.) are deferred to their
 * own component specs.
 */

import { basePage, type BasePageData } from './base';
import { formatDocketDate } from '../../../build/lib/date-format';
import { isUnitOpen } from '../../../build/lib/unit-open';
import { generateDktRef } from '../../../build/lib/dkt-ref';

export interface HomePageContext {
  /** The build's wall-clock moment, used to populate the docket strip. */
  buildDate: Date;
}

/**
 * Render the homepage as a complete HTML document.
 *
 * Computes docket strip data from the build date and passes an empty children
 * slot to basePage(). Content blocks will be added by subsequent specs.
 */
export function homePage(context: HomePageContext): string {
  const { buildDate } = context;

  // Compute docket strip fields
  const dateLabel = formatDocketDate(buildDate);
  const open = isUnitOpen(buildDate);
  const dktRef = generateDktRef(buildDate);
  const unitLabel = 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX';

  // Construct base page data
  const data: BasePageData = {
    title: 'Vinyl Traffic — Industrial Record Dispatch',
    docket: {
      dateLabel,
      open,
      dktRef,
      unitLabel,
    },
    children: '', // Empty content slot, deliberately
  };

  return basePage(data);
}
