// Turn a section label into a valid XML-style tag name, e.g.
// "System Prompt" -> "system_prompt", "1. Examples" -> "section_1_examples".
export function toTagName(label) {
  const name = (label || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, '_')
    .replace(/_+/g, '_')
    .replace(/^[_-]+|[_-]+$/g, '');
  if (!name) return 'section';
  return /^\p{L}/u.test(name) ? name : `section_${name}`;
}

export function copyAllSections(sections, mode = 'plain') {
  const sorted = sections.slice().sort((a, b) => a.order - b.order);
  const nonEmpty = sorted.filter((s) => s.content);

  let text;
  if (mode === 'labeled') {
    text = nonEmpty
      .map((s) => {
        const tag = toTagName(s.label);
        return `<${tag}>\n\n${s.content}\n\n</${tag}>`;
      })
      .join('\n\n');
  } else {
    text = nonEmpty.map((s) => s.content).join('\n\n');
  }

  return navigator.clipboard.writeText(text);
}
