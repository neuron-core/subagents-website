import type { APIRoute } from 'astro';
import {
  BACKGROUND_KINDS,
  BRAND,
  FRAMEWORKS,
  MANAGEMENT_TOOLS,
  PACKAGE,
  PHP_MIN_VERSION,
  PRODUCT_NAME,
  SUBAGENT_MAX_ATTEMPTS,
  TASK_STATUSES,
} from '../consts/product';
import { LINKS, SITE } from '../consts/site';
import { listOf, numberWord, oneOfParts } from '../lib/format';

// A summary of the page for language models, following https://llmstxt.org. Copy in src/consts already uses
// Markdown's `code` and **bold**, so it goes in as it is.

const code = (text: string) => `\`${text}\``;
const statuses = oneOfParts(TASK_STATUSES)
  .map((part) => (part.type === 'element' ? code(part.value) : part.value))
  .join('');
const frameworks = Object.values(FRAMEWORKS).map((framework) => `${framework.name} (${code(framework.package)})`);

const body = `# ${PRODUCT_NAME}

> ${SITE.description}

${PRODUCT_NAME} is an advanced extension of ${BRAND}, available under a commercial license. When the model calls a background tool, the tool answers at once with a task ID and the turn ends, so the chat stays free. Another PHP process does the work. When it finishes, the result is delivered into the conversation as a message and starts a new turn of the agent, which carries on by itself.

Kinds of background work:

${BACKGROUND_KINDS.map((kind) => `- **${kind.name}**: the model sees ${kind.sees}. Runs in the background ${kind.runs}. Typical use: ${kind.use}.`).join('\n')}

Key facts:

- Requires PHP ${PHP_MIN_VERSION} or later and an application that already uses ${BRAND}.
- Once your project has access, install it with ${code(`composer require ${PACKAGE}`)}.
- Integration packages for ${listOf(frameworks)} wire it into the framework. They build on ${PRODUCT_NAME} and need the same license.
- No queue is required: by default each task runs in its own PHP process. Tasks can also run on any job queue.
- Storage is a database or Redis that every process can reach, using the stores Neuron agents already use. No new tables.
- A result never interrupts a turn in progress. Results that finish close together are delivered in one message.
- Each task has a status: ${statuses}. Next to the background tools, the agent gets ${code(MANAGEMENT_TOOLS.check)} to check on a task and ${code(MANAGEMENT_TOOLS.stop)} to stop one.
- A scheduled sweep restarts work lost to a crash. A sub-agent resumes where it stopped, up to ${numberWord(SUBAGENT_MAX_ATTEMPTS)} attempts. A single tool call is reported as failed rather than run twice.
- The built-in process runner needs a POSIX shell, so it runs on Linux and macOS. On Windows, run the tasks on a queue.

## Links

- [Talk to us](${LINKS.contact}): get a license and access to the packages
- [${BRAND} on GitHub](${LINKS.neuronGithub}): the open-source framework, under the MIT license, that ${PRODUCT_NAME} extends
- [${BRAND} documentation](${LINKS.neuronDocs})
`;

export const GET: APIRoute = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
