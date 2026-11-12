/** The open-source framework the product extends. */
export const BRAND = 'Neuron AI';
/** The brand of the product name, in the site title, the logo and the copy. */
export const TITLE_BRAND = 'Neuron IQ';
export const PRODUCT = 'Subagents';
export const PRODUCT_NAME = `${TITLE_BRAND} ${PRODUCT}`;

export const PACKAGE = 'neuron-core/subagents';
export const PHP_MIN_VERSION = '8.1';

export const FRAMEWORKS = {
  laravel: { name: 'Laravel', package: 'neuron-core/subagents-laravel' },
  symfony: { name: 'Symfony', package: 'neuron-core/subagents-symfony' },
} as const;

export const FRAMEWORK_NAMES = Object.values(FRAMEWORKS).map((framework) => framework.name);

/** The statuses a task has in the ledger. */
export const TASK_STATUSES = ['pending', 'completed', 'failed'] as const;

/** The statuses a front end can show for a task. */
export const TASK_CHIP_STATUSES = ['queued', 'running', 'stopping', 'done', 'failed'] as const;
export type TaskChipStatus = (typeof TASK_CHIP_STATUSES)[number];

/** The tools the toolkit adds next to the background tools. */
export const MANAGEMENT_TOOLS = { check: 'check_tool', stop: 'stop_tool' } as const;

export const SUBAGENT_MAX_ATTEMPTS = 3;

/** Time limits of the on-demand bash tool in the code examples. */
export const BASH_TIMEOUT_SECONDS = { lease: 1800, background: 1500 } as const;

/** Copy items use `code` and **bold**, rendered by `inline()` from src/lib/format.ts. */
export const BASIC_TERMS = [
  {
    term: 'Agent',
    definition:
      'A program that uses a language model (LLM) to decide what to do next. You give it instructions and tools; it chooses which tools to call, reads their results and writes an answer.',
  },
  {
    term: 'Tool',
    definition:
      'A function the agent can call: search the web, query your database, run a shell command, send an email.',
  },
  {
    term: 'Turn',
    definition:
      "Everything that happens between a message and the agent's answer to it. In one turn the model may call many tools, one after another, before it replies.",
  },
];

export const BACKGROUND_KINDS = [
  {
    name: 'Sub-agent',
    sees: 'a tool with a `prompt` argument',
    runs: 'always',
    use: 'research, code review, analysis: anything that needs its own reasoning',
  },
  {
    name: 'Background tool',
    sees: "`<tool>_background`, with the tool's own arguments",
    runs: 'always',
    use: 'deployments, exports, long reports: tools that are always slow',
  },
  {
    name: 'On-demand tool',
    sees: 'the tool itself, plus `run_in_background`',
    runs: 'when the model asks for it',
    use: '`bash`, builds, test suites: tools that are fast or slow depending on the call',
  },
];
