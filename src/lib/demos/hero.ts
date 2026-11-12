import { COMPETITORS, RELEASE_VERSION } from '../../consts/example';
import { listOf, numberWord } from '../format';
import type { ChatScript } from './chat';
import { REPORTS_IN } from './story';

const RESEARCH_DONE_AT = [11400, 10600, 12300];

export const heroScript: ChatScript = {
  length: 22000,
  scale: 30,
  busy: [
    [1500, 4100],
    [6800, 9900],
    [13000, 15900],
  ],
  chips: COMPETITORS.map((label, i) => ({
    tool: 'researcher',
    label,
    at: 2700 + i * 150,
    done: RESEARCH_DONE_AT[i],
    gone: 13000,
  })),
  msgs: [
    { k: 'user', at: 1500, typeFrom: 300, text: `Compare our pricing with ${listOf(COMPETITORS)}.` },
    {
      k: 'agent',
      at: 2500,
      think: 800,
      text: `I've started ${numberWord(COMPETITORS.length)} research tasks, one for each competitor. I'll get back to you with the comparison.`,
    },
    { k: 'user', at: 6800, typeFrom: 5000, text: `While they run, draft the release notes for ${RELEASE_VERSION}.` },
    {
      k: 'agent',
      at: 7600,
      think: 700,
      text: `Here's a first draft:\n\nVersion ${RELEASE_VERSION}\n- Export invoices to CSV from the billing page\n- Faster search on large projects\n- Weekly reports now use your timezone`,
    },
    { k: 'sys', at: 13000, title: 'Background results delivered', body: `researcher · ${COMPETITORS.length} tasks · completed` },
    { k: 'agent', at: 13900, think: 700, text: `${REPORTS_IN} Want me to put them side by side with our plans?` },
  ],
};
