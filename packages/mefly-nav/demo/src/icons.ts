export const PAGE_COLORS = ['#4f79e8', '#3aaa6e', '#e87d2c'];
export const PAGE_LABELS = ['Page 1', 'Page 2', 'Page 3'];

function makeSvgIcon(fill: string, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${fill}"/><text x="16" y="22" text-anchor="middle" font-size="15" font-family="-apple-system,sans-serif" font-weight="600" fill="white">${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function pageIcon(num: number): string {
  return makeSvgIcon(PAGE_COLORS[(num - 1) % PAGE_COLORS.length], String(num));
}

export function disabledIcon(): string {
  return makeSvgIcon('#bbb', '?');
}
