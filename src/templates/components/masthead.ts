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
