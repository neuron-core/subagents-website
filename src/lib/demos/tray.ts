import { COMPETITORS, RELEASE_VERSION } from '../../consts/example';
import { MANAGEMENT_TOOLS, type TaskChipStatus } from '../../consts/product';
import { clock, listOf, numberWord } from '../format';
import { chatState, type ChatScript, type ChatState } from './chat';
import { FIRST_COMPETITOR, SECOND_COMPETITOR, THIRD_COMPETITOR } from './story';

interface Task {
  id: string;
  tool: string;
  title: string;
  inputs: string;
  /** Seconds the task had already run when the demo starts. */
  offset: number;
  /** [when, attempt number] pairs. */
  attempts: Array<[number, number]>;
  done?: number;
  fail?: number;
  stop?: number;
  gone?: number;
}

const research = (name: string) => `Research ${name} pricing`;
const STOP_AT = 4400;

const TASKS: Task[] = [
  { id: 'sub_01a1c6da', tool: 'researcher', title: research(FIRST_COMPETITOR), inputs: `['prompt' => '${research(FIRST_COMPETITOR)}...']`, offset: 130, attempts: [[0, 1]], done: 9000 },
  { id: 'sub_01a1c6db', tool: 'researcher', title: research(SECOND_COMPETITOR), inputs: `['prompt' => '${research(SECOND_COMPETITOR)}...']`, offset: 130, attempts: [[0, 1], [3000, 2]], done: 12500 },
  { id: 'sub_01a1c6dc', tool: 'researcher', title: research(THIRD_COMPETITOR), inputs: `['prompt' => '${research(THIRD_COMPETITOR)}...']`, offset: 130, attempts: [[0, 1]], stop: STOP_AT, gone: 6600 },
  { id: 'sub_01a1c6dd', tool: 'deploy', title: `Deploy ${RELEASE_VERSION} to staging`, inputs: "['environment' => 'staging']", offset: 0, attempts: [[0, 0], [2000, 1]], done: 11000 },
  { id: 'sub_01a1c6de', tool: 'bash', title: 'php artisan export:invoices', inputs: "['command' => 'php artisan export:invoices']", offset: 40, attempts: [[0, 1]], fail: 7600 },
];

export const TRAY_DEFAULT_TASK = TASKS[1].id;

export const trayScript: ChatScript = {
  length: 17000,
  busy: [[3800, 6300]],
  msgs: [
    {
      k: 'user',
      at: 0,
      text: `Research ${listOf(COMPETITORS)} pricing, deploy ${RELEASE_VERSION} to staging and export last month's invoices.`,
    },
    {
      k: 'agent',
      at: 0,
      instant: true,
      text: `Started ${numberWord(TASKS.length)} background tasks. You can follow them above the message box.`,
    },
    { k: 'user', at: 3800, typeFrom: 2400, text: `Skip ${THIRD_COMPETITOR}, we dropped it from the comparison.` },
    { k: 'call', at: STOP_AT, name: MANAGEMENT_TOOLS.stop, args: '({"task_id": "sub_01a1c6dc-..."})' },
    {
      k: 'agent',
      at: 5000,
      think: 300,
      text: `Stopping the ${THIRD_COMPETITOR} research. It ends at its next step and won't report anything.`,
    },
  ],
};

/** Task seconds that pass in one demo second. */
const SCALE = 40;
/** How long a changed property stays highlighted. */
const HOT_FOR = 1600;

export interface TrayTask {
  id: string;
  tool: string;
  title: string;
  status: TaskChipStatus;
  statusText: string;
  elapsed: string;
  selected: boolean;
}

export interface TaskProperty {
  key: string;
  value: string;
  hot: boolean;
}

export interface TrayState extends ChatState {
  tasks: TrayTask[];
  count: string;
  properties: TaskProperty[];
  /** The selected task was stopped and left the tray. */
  selectedGone: boolean;
}

export function trayState(t: number, selectedId: string): TrayState {
  const hot = (when: number | undefined) => when !== undefined && when > 0 && t >= when && t - when < HOT_FOR;
  const tasks: TrayTask[] = [];
  let properties: TaskProperty[] = [];
  let selectedGone = false;
  let inProgress = 0;

  for (const task of TASKS) {
    let attempts = 0;
    let attemptAt: number | undefined;
    for (const [at, n] of task.attempts) {
      if (t >= at) {
        attempts = n;
        attemptAt = at;
      }
    }

    let status: TaskChipStatus = attempts === 0 ? 'queued' : 'running';
    if (task.stop !== undefined && t >= task.stop) status = 'stopping';
    if (task.fail !== undefined && t >= task.fail) status = 'failed';
    if (task.done !== undefined && t >= task.done) status = 'done';

    const runStart = task.attempts.find(([, n]) => n > 0)?.[0];
    const started = runStart !== undefined && t >= runStart;
    const end = status === 'done' ? task.done! : status === 'failed' ? task.fail! : t;
    const seconds = started ? task.offset + ((end - runStart) * SCALE) / 1000 : 0;
    const gone = task.gone !== undefined && t >= task.gone;
    const selected = task.id === selectedId;

    if (selected) {
      const stopRequested = task.stop !== undefined && t >= task.stop;
      const finishedAt = status === 'done' ? task.done : status === 'failed' ? task.fail : undefined;
      selectedGone = gone;
      properties = [
        { key: '$task->id', value: `"${task.id}-..."`, hot: false },
        { key: '$task->tool', value: `"${task.tool}"`, hot: false },
        { key: '$task->inputs', value: task.inputs, hot: false },
        {
          key: '$task->status',
          value: status === 'done' ? 'TaskStatus::Completed' : status === 'failed' ? 'TaskStatus::Failed' : 'TaskStatus::Pending',
          hot: hot(finishedAt),
        },
        { key: '$task->attempts', value: String(attempts), hot: hot(attemptAt) },
        { key: '$task->stopRequested', value: String(stopRequested), hot: hot(stopRequested ? task.stop : undefined) },
      ];
    }

    if (gone) continue;
    if (status === 'queued' || status === 'running' || status === 'stopping') inProgress += 1;
    tasks.push({
      id: task.id,
      tool: task.tool,
      title: task.title,
      status,
      statusText: status === 'running' && attempts > 1 ? `attempt ${attempts}` : status,
      elapsed: started ? clock(seconds) : '',
      selected,
    });
  }

  return {
    ...chatState(trayScript, t),
    tasks,
    count: inProgress === 0 ? 'all finished' : `${inProgress} in progress`,
    properties,
    selectedGone,
  };
}
