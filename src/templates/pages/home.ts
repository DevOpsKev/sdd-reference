import { basePage } from './base';
import { formatDocketDate } from '../../../build/lib/date-format';
import { isUnitOpen } from '../../../build/lib/unit-open';
import { generateDktRef } from '../../../build/lib/dkt-ref';

export interface HomePageContext {
  buildDate: Date;
}

export function homePage(context: HomePageContext): string {
  const { buildDate } = context;
  const tz = 'Europe/Budapest';

  return basePage({
    title: 'Vinyl Traffic — Industrial Record Dispatch',
    docket: {
      open: isUnitOpen(buildDate, tz),
      dktRef: generateDktRef(buildDate, tz),
      dateLabel: formatDocketDate(buildDate, tz),
      unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX',
    },
    masthead: {
      metaTitle: 'STOCKROOM & DISPATCH',
      metaLine2: 'UNIT 14B · BAY 3',
      metaLine3: '22:00 — 05:00 · By appt.',
      metaLine4: '+36 1 ___ ____',
      tagline:
        "A small operation moving records out of an industrial unit off Soroksári út. We work nights. Crypto only. We don't have a shop — we have a stockroom.",
      stampDefault: 'FRAGILE · DO NOT BEND',
      stampInk: 'BTC · ETH · USDC · XMR',
      stampRed: 'NO RETURNS · NO REFUNDS',
    },
    navTabs: {
      primary: [
        { href: '#', label: 'Stockroom' },
        { href: '#', label: 'Outgoing' },
        { href: '#', label: 'New In' },
        { href: '#', label: 'Counter' },
        { href: '#', label: 'Index' },
        { href: '#', label: 'Find Us' },
      ],
      activePrimaryIndex: 0,
      right: [
        { href: '#', label: 'Search ↗' },
        { href: '#', label: 'Bag (0)' },
      ],
    },
    children: '',
  });
}
