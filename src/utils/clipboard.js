export function copyAllSections(sections, mode = 'plain') {
  const sorted = sections.slice().sort((a, b) => a.order - b.order);
  const nonEmpty = sorted.filter((s) => s.content);

  let text;
  if (mode === 'labeled') {
    text = nonEmpty
      .map((s) => `<${s.label}>\n\n${s.content}\n\n</${s.label}>`)
      .join('\n\n');
  } else {
    text = nonEmpty.map((s) => s.content).join('\n\n');
  }

  return navigator.clipboard.writeText(text);
}