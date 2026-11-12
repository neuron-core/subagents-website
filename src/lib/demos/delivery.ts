import { COMPETITORS, RELEASE_VERSION } from '../../consts/example';
import { chatState, type ChatScript, type ChatState } from './chat';
import { REPORTS_IN } from './story';

const APPROVAL_AT = 2400;
const APPROVED_AT = 5200;
const DELIVER_AT = 7100;
const CONTINUE_UNTIL = 10000;
const RESEARCH_DONE_AT = [3000, 6300, 6600];
const RESEARCH_OFFSET = [130, 125, 118];

export const deliveryScript: ChatScript = {
  length: 16000,
  scale: 30,
  busy: [
    [1500, 2400],
    [5200, 6900],
    [DELIVER_AT, CONTINUE_UNTIL],
  ],
  chips: COMPETITORS.map((label, i) => ({
    tool: 'researcher',
    label,
    at: 0,
    offset: RESEARCH_OFFSET[i],
    done: RESEARCH_DONE_AT[i],
    gone: DELIVER_AT,
  })),
  msgs: [
    { k: 'user', at: 1500, typeFrom: 300, text: `Meanwhile, email the ${RELEASE_VERSION} release notes to the team.` },
    {
      k: 'call',
      at: 2000,
      name: 'send_email',
      args: `({"to": "team@example.com", "subject": "Release notes ${RELEASE_VERSION}"})`,
    },
    { k: 'approval', at: APPROVAL_AT, name: 'send_email', until: APPROVED_AT },
    { k: 'ret', at: 5600, text: '{"status": "sent"}' },
    { k: 'agent', at: 5900, think: 300, text: 'Sent. The release notes are on their way to the team.' },
    {
      k: 'sys',
      at: DELIVER_AT,
      title: `${COMPETITORS.length} background results delivered in one message`,
      body: COMPETITORS.map((name) => `researcher · ${name} · completed`).join('\n'),
    },
    { k: 'agent', at: 7900, think: 600, text: `${REPORTS_IN} Want me to turn this into a comparison table?` },
  ],
};

/** The moment the Approve button jumps to: just before the approval lands. */
export const APPROVE_TIME = APPROVED_AT - 50;

export type Door = 'free' | 'busy' | 'user';

export const DOORS: Array<{ id: Door; title: string; body: string }> = [
  { id: 'free', title: 'Free', body: 'deliver now' },
  { id: 'busy', title: 'Busy', body: 'wait for the turn to end' },
  { id: 'user', title: 'Waiting for the user', body: 'wait for the user' },
];

export interface DeliveryState extends ChatState {
  door: Door;
  waiting: string;
  continues: boolean;
}

const results = (n: number) => (n === 1 ? '1 result' : `${n} results`);

export function deliveryState(t: number): DeliveryState {
  const chat = chatState(deliveryScript, t);
  const door: Door = t >= APPROVAL_AT && t < APPROVED_AT ? 'user' : chat.busy ? 'busy' : 'free';
  const finished = t < DELIVER_AT ? RESEARCH_DONE_AT.filter((at) => t >= at).length : 0;

  let waiting = 'No results waiting';
  if (finished > 0) {
    if (door === 'user') waiting = `${results(finished)} waiting for your approval`;
    else if (door === 'busy') waiting = `${results(finished)} waiting for the turn to end`;
    else waiting = `${results(finished)}, delivered together`;
  } else if (t >= DELIVER_AT && t < DELIVER_AT + 1800) {
    waiting = `${results(COMPETITORS.length)} delivered in one message`;
  }

  return { ...chat, door, waiting, continues: t >= DELIVER_AT && t < CONTINUE_UNTIL };
}
