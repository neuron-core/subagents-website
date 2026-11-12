import { percent } from '../timeline';
import { chatState, type ChatScript, type ChatState } from './chat';
import { FIRST_COMPETITOR } from './story';

export const flowScript: ChatScript = {
  length: 18000,
  busy: [
    [1200, 4200],
    [9800, 12800],
  ],
  msgs: [
    { k: 'user', at: 1200, typeFrom: 200, text: `Research how ${FIRST_COMPETITOR} prices its plans.` },
    {
      k: 'call',
      at: 1900,
      name: 'researcher',
      args: `({"prompt": "Find out how ${FIRST_COMPETITOR} prices its plans: tiers, units and discounts."})`,
    },
    { k: 'ret', at: 2500, text: '{"task_id": "sub_01a1c6da-...", "status": "pending"}' },
    {
      k: 'agent',
      at: 3000,
      think: 400,
      text: `I've started a research task on ${FIRST_COMPETITOR}'s pricing. I'll report back here when it's done.`,
    },
    { k: 'sys', at: 9600, title: 'Background result delivered', body: 'researcher · sub_01a1c6da-... · completed' },
    {
      k: 'agent',
      at: 10400,
      think: 600,
      text: `The research on ${FIRST_COMPETITOR} is back. They charge per seat, with a lower price on annual billing and a free plan for small teams. Want me to compare it with ours?`,
    },
  ],
};

/** When each of the four steps of "How it works" starts and ends. */
const STEP_START = [1200, 2500, 4600, 9400];
const STEP_END = [2400, 4500, 9300, 17900];

/** The moment a step button jumps to: just before the step starts, or its end without motion. */
export const stepTime = (step: number, live: boolean): number => (live ? STEP_START[step] - 150 : STEP_END[step]);

const LANE_SPAN = 14000;
const LANES = [
  { label: 'Turn 1', sub: 'web request', from: 1200, to: 4200, hot: false },
  { label: 'Worker process', sub: 'sub_01a1c6da', from: 4600, to: 9000, hot: true },
  { label: 'Delivery', sub: 'dlv_01a1c6dc', from: 9400, to: 9800, hot: false },
  { label: 'Turn 2', sub: 'background', from: 9800, to: 12800, hot: false },
];

const LOG: Array<[number, string]> = [
  [1200, 'turn 1 started in the web request'],
  [1900, 'model called researcher'],
  [2500, 'task sub_01a1c6da-... created, pending'],
  [4200, 'turn 1 ended, the chat is free'],
  [4600, 'worker started sub_01a1c6da-..., attempt 1'],
  [5600, 'ResearchAgent called web_search'],
  [6800, 'ResearchAgent called fetch_page'],
  [8000, 'ResearchAgent wrote its report'],
  [9000, 'task sub_01a1c6da-... completed'],
  [9400, 'delivery dlv_01a1c6dc-..., conversation is free'],
  [9800, 'turn 2 started in a background process'],
  [12800, 'turn 2 ended'],
];
const LOG_LINES = 5;

export interface Lane {
  label: string;
  sub: string;
  hot: boolean;
  left: string;
  width: string;
  text: string;
}

export interface FlowState extends ChatState {
  /** The current step, 0 to 3, or -1 before the first one. */
  step: number;
  lanes: Lane[];
  log: string[];
  buzz: boolean;
}

export function flowState(t: number): FlowState {
  const lanes = LANES.map((lane) => {
    const on = t >= lane.from;
    const running = on && t < lane.to;
    const width = on ? Math.max(0.8, ((Math.min(t, lane.to) - lane.from) / LANE_SPAN) * 100) : 0;
    return {
      label: lane.label,
      sub: lane.sub,
      hot: lane.hot,
      left: percent(lane.from, LANE_SPAN),
      width: `${width.toFixed(2)}%`,
      text: on && lane.to - lane.from > 1500 ? (running ? 'running' : 'done') : '',
    };
  });

  return {
    ...chatState(flowScript, t),
    step: STEP_START.filter((start) => t >= start).length - 1,
    lanes,
    log: LOG.filter(([at]) => t >= at)
      .slice(-LOG_LINES)
      .map(([, line]) => line),
    buzz: t >= 9400 && t < 10800,
  };
}
