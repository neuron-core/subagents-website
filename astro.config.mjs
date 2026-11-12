// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://subagents.neuron-iq.dev',
  integrations: [sitemap()],
  // Class-based scoping lets a parent's scoped styles reach a child component through its `class` prop.
  scopedStyleStrategy: 'class',
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Lets every component write `@use 'variables/breakpoints'`. Resolved from the project root.
          loadPaths: ['src/styles'],
        },
      },
    },
  },
});
