let encoder = null;

export async function getTokenEncoder() {
  if (!encoder) {
    const { encodingForModel } = await import('js-tiktoken');
    encoder = encodingForModel('gpt-4');
  }
  return encoder;
}

export async function countTokens(text) {
  if (!text) return 0;
  try {
    const enc = await getTokenEncoder();
    return enc.encode(text).length;
  } catch {
    return Math.ceil(text.length / 4);
  }
}

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function formatTokenCount(count) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}