import { listOf } from '../lib/format';
import type { Lang } from '../lib/highlight';
import { COMPETITORS } from './example';
import { BASH_TIMEOUT_SECONDS, FRAMEWORKS, PACKAGE } from './product';

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
  ledger: {
    lang: 'php',
    code: String.raw`use NeuronAI\Subagents\Ledger\Ledgers;

$tasks = (new Ledgers($persistence))->of($threadId)->tasks();

foreach ($tasks as $task) {
    $task->id;            // "sub_01a1c6da-..."
    $task->tool;          // "researcher"
    $task->inputs;        // ['prompt' => 'Research ${firstCompetitor} pricing...']
    $task->status;        // TaskStatus::Pending, Completed or Failed
    $task->attempts;      // 0 while queued, 1 or more once a worker started it
    $task->stopRequested; // true after the model asked to stop it
}`,
  },
  history: {
    lang: 'php',
    code: String.raw`foreach ($agent->getChatHistory()->getMessages() as $message) {
    if ($message->getMetadata('background') !== null) {
        // A delivered result: show it as a notice, or hide it
    }
}`,
  },
  install: { lang: 'bash', code: `composer require ${PACKAGE}` },
  bootstrap: {
    lang: 'php',
    code: String.raw`// background.php: loaded by every process of your application
$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite', options: [PDO::ATTR_TIMEOUT => 5]);

return new Background(
    persistence: new DatabasePersistence($pdo),
    runner: new ProcessRunner(__FILE__),
    parent: fn (string $agent, string $threadId, Background $background): Agent
        => (new $agent($background))->for($threadId),
);`,
  },
  agent: {
    lang: 'php',
    code: String.raw`class SupportAgent extends Agent
{
    public function __construct(protected Background $background)
    {
        parent::__construct();
    }

    protected function tools(): array
    {
        return [
            $this->background->toolkit($this, [
                // A sub-agent, always in the background
                new Subagent(
                    'researcher',
                    'Research a topic and report the findings.',
                    fn (Task $task): Agent => new ResearchAgent(),
                ),
                // bash: a normal call, or a background one when the model asks for it
                (new ToolInBackground(BashTool::make(), leaseTimeout: ${lease}))
                    ->onDemand(fn (BashTool $tool) => $tool->setTimeout(${background})),
            ]),
            // ...your other tools
        ];
    }
}`,
  },
  serve: {
    lang: 'php',
    code: String.raw`// Serve the conversation as usual
$agent = (new SupportAgent($background))->for($threadId);

$agent->chat(new UserMessage('Compare our pricing with ${listOf(COMPETITORS)}'));`,
  },
  cron: {
    lang: 'bash',
    code: String.raw`# crontab: recover lost work every minute
* * * * * php /path/to/app/vendor/bin/neuron background sweep --bootstrap=/path/to/app/background.php`,
  },
  laravelInstall: { lang: 'bash', code: `composer require ${FRAMEWORKS.laravel.package}` },
  laravelServe: {
    lang: 'php',
    code: String.raw`$agent = app(SupportAgent::class)->for($conversation->id);

$agent->chat(new UserMessage($request->input('message')));`,
  },
  symfonyInstall: { lang: 'bash', code: `composer require ${FRAMEWORKS.symfony.package}` },
} satisfies Record<string, Snippet>;
