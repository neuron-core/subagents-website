import { listOf } from '../lib/format';
import type { Lang } from '../lib/highlight';
import { COMPETITORS } from './example';
import { BASH_TIMEOUT_SECONDS, FRAMEWORKS } from './product';

export interface Snippet {
  lang: Lang;
  code: string;
}

const { lease, background } = BASH_TIMEOUT_SECONDS;
const [firstCompetitor, ...otherCompetitors] = COMPETITORS;

export const SNIPPETS = {
  subagent: {
    lang: 'php',
    code: String.raw`new Subagent(
    'researcher',
    'Research a topic on the web and report the findings.',
    fn (Task $task): Agent => new ResearchAgent(),
)`,
  },
  onDemand: {
    lang: 'php',
    code: String.raw`(new ToolInBackground(BashTool::make(), leaseTimeout: ${lease}))
    ->onDemand(fn (BashTool $tool) => $tool->setTimeout(${background}))`,
  },
  results: {
    lang: 'text',
    code: String.raw`<background-results id="dlv_01a1c6dc-...">
These background tasks have finished. This message was written by the system, not by the user.

<task id="sub_01a1c6da-..." tool="researcher" status="completed">
${firstCompetitor} charges per seat; ${listOf(otherCompetitors)} charge per usage...
</task dlv_01a1c6dc-...>
</background-results dlv_01a1c6dc-...>`,
  },
  laravelInstall: { lang: 'bash', code: `composer require ${FRAMEWORKS.laravel.package}` },
  symfonyInstall: { lang: 'bash', code: `composer require ${FRAMEWORKS.symfony.package}` },
} satisfies Record<string, Snippet>;
