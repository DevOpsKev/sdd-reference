export interface NavTabLink {
  href: string;
  label: string;
}

export interface NavTabsData {
  /** Left column tabs (Anton, bordered). */
  primary: NavTabLink[];
  /** Zero-based index into `primary` for the tab that receives `class="active"`. */
  activePrimaryIndex: number;
  /** Right-aligned utility links (Special Elite, minimal chrome). */
  right: NavTabLink[];
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value: string): string {
  return escapeText(value);
}

export function navTabs(data: NavTabsData): string {
  const primaryHtml = data.primary
    .map((tab, index) => {
      const active = index === data.activePrimaryIndex ? ' class="active"' : '';
      return `<a href="${escapeAttr(tab.href)}"${active}>${escapeText(tab.label)}</a>`;
    })
    .join('\n    ');

  const rightHtml = data.right
    .map((tab) => `<a href="${escapeAttr(tab.href)}">${escapeText(tab.label)}</a>`)
    .join('\n      ');

  return `<nav class="tabs">
    ${primaryHtml}
    <div class="right-tabs">
      ${rightHtml}
    </div>
  </nav>`;
}
