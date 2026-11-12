import { COMPETITORS, DRAFT_MINUTES, PARALLEL_MINUTES, RESEARCH_MINUTES, SEQUENTIAL_MINUTES } from '../../consts/example';
import { clock, minutes } from '../format';
import { percent, type TimelineRow } from '../timeline';

export const RACE_LENGTH = 15000;

/** Each simulated minute takes this long, after a short pause. */
const MS_PER_MINUTE = 650;
const PAUSE = 800;

interface Bar {
  label: string;
  from: number;
  to: number;
}

const DRAFT = 'Draft the release notes';
const LOCKED = 'Chat locked for the user';

const SEQUENTIAL: Bar[] = [
  ...COMPETITORS.map((name, i) => ({
    label: `Research ${name}`,
    from: i * RESEARCH_MINUTES,
    to: (i + 1) * RESEARCH_MINUTES,
  })),
  { label: DRAFT, from: COMPETITORS.length * RESEARCH_MINUTES, to: SEQUENTIAL_MINUTES },
  { label: LOCKED, from: 0, to: SEQUENTIAL_MINUTES },
];

const PARALLEL: Bar[] = [
  ...COMPETITORS.map((name) => ({ label: `Research ${name}`, from: 0, to: RESEARCH_MINUTES })),
  { label: DRAFT, from: 0, to: DRAFT_MINUTES },
  { label: LOCKED, from: 0, to: DRAFT_MINUTES },
];

export interface RaceState {
  clock: string;
  sequential: { rows: TimelineRow[]; status: string };
  parallel: { rows: TimelineRow[]; status: string };
  saved: boolean;
}

export function raceState(t: number): RaceState {
  const sim = Math.max(0, Math.min(SEQUENTIAL_MINUTES, (t - PAUSE) / MS_PER_MINUTE));
  const saved = sim >= SEQUENTIAL_MINUTES;
  const row = (bar: Bar, wash: boolean): TimelineRow => ({
    label: bar.label,
    left: percent(bar.from, SEQUENTIAL_MINUTES),
    width: sim > bar.from ? percent(Math.min(sim, bar.to) - bar.from, SEQUENTIAL_MINUTES) : '0%',
    text: sim >= bar.to ? minutes(bar.to - bar.from) : '',
    wash,
  });
  const status = (ready: number) => (sim >= ready ? `comparison ready after ${minutes(ready)}` : 'running');

  return {
    clock: clock(sim * 60),
    sequential: { rows: SEQUENTIAL.map((bar) => row(bar, false)), status: status(SEQUENTIAL_MINUTES) },
    parallel: { rows: PARALLEL.map((bar) => row(bar, saved)), status: status(PARALLEL_MINUTES) },
    saved,
  };
}
