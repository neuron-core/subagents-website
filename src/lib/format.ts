const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** 3 → "three". */
export const numberWord = (n: number): string => NUMBER_WORDS[n] ?? String(n);

export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const conjunction = new Intl.ListFormat('en-GB', { type: 'conjunction' });
const disjunction = new Intl.ListFormat('en-GB', { type: 'disjunction' });

/** ["Acme", "Globex", "Initech"] → "Acme, Globex and Initech". */
export const listOf = (items: readonly string[]): string => conjunction.format(items);

/** Parts of "a, b or c", to wrap each item in markup. */
export const oneOfParts = (items: readonly string[]) => disjunction.formatToParts(items);

/** 75 → "1:15". */
export function clock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const rest = total % 60;
  return `${Math.floor(total / 60)}:${rest < 10 ? '0' : ''}${rest}`;
}

/** 4 → "4 min". */
export const minutes = (n: number): string => `${n} min`;

/** 1 → "1 minute", 4 → "4 minutes". */
export const minutesLong = (n: number): string => `${n} minute${n === 1 ? '' : 's'}`;

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Renders the `code` and **bold** marks used by copy kept in src/consts. */
export const inline = (text: string): string =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code class="ic">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
