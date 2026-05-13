export function generateId() {
  return crypto.randomUUID();
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString();
}

export function formatRelativeDate(isoString) {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(isoString);
}

export function getNextVersionLabel(prompts) {
  const maxNum = prompts.reduce((max, p) => {
    const match = p.label.match(/^v(\d+)$/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `v${maxNum + 1}`;
}

export function truncateText(text, maxLines = 4) {
  const lines = text.split('\n');
  if (lines.length <= maxLines) return null;
  const firstN = Math.ceil(maxLines / 2);
  const lastN = Math.floor(maxLines / 2);
  return {
    first: lines.slice(0, firstN).join('\n'),
    last: lines.slice(-lastN).join('\n'),
    totalLines: lines.length,
  };
}