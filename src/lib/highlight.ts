export type Lang = 'php' | 'bash' | 'text';

export interface Token {
  text: string;
  kind: 'keyword' | 'string' | 'comment' | null;
}

const PATTERNS: Record<Lang, RegExp | null> = {
  php: /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(new|fn|function|class|extends|return|use|protected|public|private|foreach|as|if|null|true|false|string|parent|static)\b/g,
  bash: /(#[^\n]*)/g,
  text: null,
};

/** A small highlighter for the code samples: comments, strings and keywords. */
export function highlight(source: string, lang: Lang): Token[] {
  const pattern = PATTERNS[lang];
  if (!pattern) return [{ text: source, kind: null }];

  const tokens: Token[] = [];
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index > last) tokens.push({ text: source.slice(last, match.index), kind: null });
    tokens.push({ text: match[0], kind: match[1] ? 'comment' : match[2] ? 'string' : 'keyword' });
    last = match.index + match[0].length;
  }
  if (last < source.length) tokens.push({ text: source.slice(last), kind: null });
  return tokens;
}
