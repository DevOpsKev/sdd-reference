export interface DocketStripData {
  open: boolean;
  dktRef: string;
  dateLabel: string;
  unitLabel: string;
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function docketStrip(data: DocketStripData): string {
  const leftStatus = data.open
    ? '<span class="light">UNIT OPEN — STAFF ON SITE</span>'
    : '<span>UNIT CLOSED</span>';

  return `<div class="docket">
  <div class="left">
    ${leftStatus}
    <span class="ref">${escape(data.dktRef)}</span>
  </div>
  <div class="right">
    <span>${escape(data.dateLabel)}</span>
    <span class="ref">${escape(data.unitLabel)}</span>
  </div>
</div>`;
}
