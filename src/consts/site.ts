import { BRAND, PRODUCT } from './product';

/** The brand the site is published under, in the logo and the page title. The copy still talks about Neuron AI. */
export const SITE_BRAND = 'Neuron IQ';

export const SITE = {
  title: `${SITE_BRAND} ${PRODUCT}`,
  description: `Give any ${BRAND} agent background tools and sub-agents. It hands slow work to other processes, runs it side by side, and keeps talking with your user.`,
};

export const LINKS = {
  contact: 'https://form.typeform.com/to/Ba6XOU1t',
  neuronGithub: 'https://github.com/neuron-core/neuron-ai',
  neuronDocs: 'https://docs.neuron-ai.dev',
};

export const NAV = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Production', href: '#production' },
  { label: 'Get started', href: '#get-started' },
  { label: 'FAQ', href: '#faq' },
];
