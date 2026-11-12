/** The running example the page and its demos share: researching competitors while drafting a release. */
export const COMPETITORS = ['Acme', 'Globex', 'Initech'] as const;
export const RELEASE_VERSION = '2.3';

export const RESEARCH_MINUTES = 4;
export const DRAFT_MINUTES = 1;
export const ANSWER_MINUTES = 1;

/** One synchronous turn: every research task in a row, then the answer. */
export const SYNC_TURN_MINUTES = COMPETITORS.length * RESEARCH_MINUTES + ANSWER_MINUTES;

/** Research and draft one after another, without background tasks. */
export const SEQUENTIAL_MINUTES = COMPETITORS.length * RESEARCH_MINUTES + DRAFT_MINUTES;

/** Research and draft side by side, with background tasks. */
export const PARALLEL_MINUTES = Math.max(RESEARCH_MINUTES, DRAFT_MINUTES);

export const SAVED_MINUTES = SEQUENTIAL_MINUTES - PARALLEL_MINUTES;
