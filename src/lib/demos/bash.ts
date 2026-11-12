import type { ChatScript } from './chat';

export const bashScript: ChatScript = {
  length: 19500,
  scale: 120,
  busy: [
    [1100, 4200],
    [6200, 8300],
    [12000, 15400],
  ],
  chips: [{ tool: 'bash', label: 'vendor/bin/phpunit', at: 2200, done: 11500, gone: 12000 }],
  msgs: [
    { k: 'user', at: 1100, typeFrom: 200, text: 'Run the full test suite.' },
    { k: 'call', at: 1700, name: 'bash', args: '({"command": "vendor/bin/phpunit", "run_in_background": true})' },
    { k: 'ret', at: 2200, text: '{"task_id": "sub_01a1c6e1-...", "status": "pending"}' },
    {
      k: 'agent',
      at: 2600,
      think: 300,
      text: "Started the full test suite in the background. It usually takes about 20 minutes, I'll tell you how it went.",
    },
    { k: 'user', at: 6200, typeFrom: 4700, text: 'Unrelated: which Laravel version are we on?' },
    { k: 'call', at: 6800, name: 'bash', args: '({"command": "composer show laravel/framework | grep versions"})' },
    { k: 'ret', at: 7300, text: 'versions : * v11.31.0' },
    { k: 'agent', at: 7700, think: 300, text: "You're on Laravel 11.31.0." },
    { k: 'sys', at: 12000, title: 'Background result delivered', body: 'bash · sub_01a1c6e1-... · completed' },
    {
      k: 'agent',
      at: 12700,
      think: 600,
      text: 'The test suite finished: 412 tests, 2 failures, both in InvoiceExportTest. The export now writes dates in UTC and the assertions still expect local time. Want me to update them?',
    },
  ],
};
