// Pure chat helpers shared by the browser and host. No model or filesystem access.
export function mentionedCharacters(text, characters, { everyone = true } = {}) {
  const source = String(text);
  const available = characters.filter(c => c.enabled !== false);
  const names = [...available.map(c => ({ name: c.name, id: c.id })), ...(everyone ? [{ name: '全体', all: true }, { name: '所有人', all: true }] : [])].sort((a, b) => b.name.length - a.name.length);
  const selected = new Set();
  for (const match of source.matchAll(/@/g)) {
    const previous = source[match.index - 1];
    if (previous && /[\p{L}\p{N}_.@]/u.test(previous)) continue;
    const suffix = source.slice(match.index + 1);
    const entry = names.find(n => suffix.startsWith(n.name) && !/[\p{L}\p{N}_]/u.test(suffix[n.name.length] || ''));
    if (!entry) continue;
    if (entry.all) for (const c of available) selected.add(c.id);
    else selected.add(entry.id);
  }
  return available.filter(c => selected.has(c.id));
}

export function mentionQuery(value, caret) {
  const prefix = value.slice(0, caret);
  const match = /(?:^|[\s，。！？、：:；;「『（(])@([^@\s，。！？、：:；;」』）)]*)$/u.exec(prefix);
  if (!match) return null;
  const start = prefix.lastIndexOf('@');
  return { start, end: caret, query: match[1] };
}

export function spokenText(value) {
  let depth = 0, output = '';
  for (const char of String(value)) {
    if (char === '(' || char === '（') { depth++; continue; }
    if (char === ')' || char === '）') { if (depth) depth--; continue; }
    if (!depth) output += char;
  }
  return output.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function isSilent(value) {
  return !value.trim() || /^(?:\[沉默\]|【沉默】)$/u.test(value.trim());
}
