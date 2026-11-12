import { clock } from '../format';

/** One step of a scripted conversation. Times are milliseconds from the start of the demo. */
export type ScriptMessage =
  | { k: 'user'; at: number; text: string; /** The user starts typing it in the composer. */ typeFrom?: number }
  | { k: 'agent'; at: number; text: string; /** The typing dots show this long before it. */ think?: number; instant?: boolean }
  | { k: 'call'; at: number; name: string; args: string }
  | { k: 'ret'; at: number; text: string }
  | { k: 'sys'; at: number; title: string; body: string }
  | { k: 'approval'; at: number; name: string; until: number };

/** A background task shown as a chip above the composer. */
export interface ScriptChip {
  tool: string;
  label: string;
  at: number;
  done: number;
  gone: number;
  /** Seconds the task had already run when the demo starts. */
  offset?: number;
}

export interface ChatScript {
  /** Milliseconds before the demo loops. */
  length: number;
  /** Spans of time when the agent is answering. */
  busy: Array<[number, number]>;
  msgs: ScriptMessage[];
  chips?: ScriptChip[];
  /** How many task seconds pass in one demo second. */
  scale?: number;
}

export type Message =
  | { kind: 'user'; text: string }
  | { kind: 'agent'; text: string; streaming: boolean }
  | { kind: 'call'; name: string; args: string }
  | { kind: 'ret'; text: string }
  | { kind: 'sys'; title: string; body: string }
  | { kind: 'approval'; name: string; approved: boolean };

export interface Chip {
  tool: string;
  label: string;
  done: boolean;
  meta: string;
}

export interface ChatState {
  msgs: Message[];
  typing: boolean;
  input: string;
  busy: boolean;
  chips: Chip[];
}

export const STATUS_TEXT = { busy: 'Answering', idle: 'Ready' };

const MS_PER_CHARACTER = 14;

export function chatState(script: ChatScript, t: number): ChatState {
  const msgs: Message[] = [];
  let typing = false;
  let input = '';

  for (const m of script.msgs) {
    if (m.k === 'user' && m.typeFrom !== undefined && t >= m.typeFrom && t < m.at) {
      input = m.text.slice(0, Math.ceil(((t - m.typeFrom) / (m.at - m.typeFrom)) * m.text.length));
    }
    if (m.k === 'agent') {
      if (t >= m.at) {
        const shown = m.instant ? m.text.length : Math.min(m.text.length, Math.floor((t - m.at) / MS_PER_CHARACTER));
        msgs.push({ kind: 'agent', text: m.text.slice(0, shown), streaming: shown < m.text.length });
      } else if (m.think !== undefined && t >= m.at - m.think) {
        typing = true;
      }
      continue;
    }
    if (t < m.at) continue;
    switch (m.k) {
      case 'user':
        msgs.push({ kind: 'user', text: m.text });
        break;
      case 'call':
        msgs.push({ kind: 'call', name: m.name, args: m.args });
        break;
      case 'ret':
        msgs.push({ kind: 'ret', text: m.text });
        break;
      case 'sys':
        msgs.push({ kind: 'sys', title: m.title, body: m.body });
        break;
      case 'approval':
        msgs.push({ kind: 'approval', name: m.name, approved: t >= m.until });
        break;
    }
  }

  const chips: Chip[] = [];
  for (const c of script.chips ?? []) {
    if (t < c.at || t >= c.gone) continue;
    const done = t >= c.done;
    const seconds = (c.offset ?? 0) + (((done ? c.done : t) - c.at) * (script.scale ?? 30)) / 1000;
    chips.push({ tool: c.tool, label: c.label, done, meta: done ? 'done' : clock(seconds) });
  }

  return {
    msgs,
    typing,
    input,
    busy: script.busy.some(([from, to]) => t >= from && t < to),
    chips,
  };
}
