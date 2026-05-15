export function copyAllSections(sections) {
  const text = sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((s) => s.content)
    .filter(Boolean)
    .join('\n\n');

  return navigator.clipboard.writeText(text);
}