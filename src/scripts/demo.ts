/*
 * Runs the animated demos. Each demo is a timed script that loops, restarts when it scrolls into view,
 * and stays on its final state for visitors who ask for reduced motion.
 * The markup comes from Astro; this file only updates the parts of it that change.
 */
import { STATUS_TEXT, type ChatState, type Chip, type Message } from '../lib/demos/chat';

const TICK_MS = 100;
const VISIBLE_RATIO = 0.3;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Running {
  length: number;
  draw: (t: number) => void;
  start: number;
  inView: boolean;
}

const running = new Map<Element, Running>();
let timer: number | undefined;

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const demo = running.get(entry.target);
      if (!demo) continue;
      if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO) {
        if (!demo.inView) {
          demo.inView = true;
          demo.start = performance.now();
          demo.draw(0);
        }
      } else if (!entry.isIntersecting) {
        demo.inView = false;
      }
    }
  },
  { threshold: [0, VISIBLE_RATIO] },
);

function tick() {
  const now = performance.now();
  for (const demo of running.values()) {
    if (!demo.inView) continue;
    if (now - demo.start >= demo.length) demo.start = now;
    demo.draw(now - demo.start);
  }
}

export interface DemoControl {
  /** Moves the demo to a moment of its script. */
  jump(t: number): void;
  /** Draws the current moment again, after a change that isn't about time. */
  redraw(): void;
  /** False when the visitor asked for reduced motion: the demo stays still. */
  live: boolean;
}

export function runDemo(root: HTMLElement, length: number, draw: (t: number) => void): DemoControl {
  let frozen = length - 1;
  const demo: Running = { length, draw, start: performance.now(), inView: false };
  const now = () => (reduceMotion ? frozen : performance.now() - demo.start);
  const control: DemoControl = {
    jump(t) {
      if (reduceMotion) frozen = t;
      else demo.start = performance.now() - t;
      draw(t);
    },
    redraw: () => draw(now()),
    live: !reduceMotion,
  };

  root.querySelector('[data-replay]')?.addEventListener('click', () => control.jump(reduceMotion ? length - 1 : 0));

  if (!reduceMotion) {
    running.set(root, demo);
    observer.observe(root);
    timer ??= window.setInterval(tick, TICK_MS);
  }
  control.redraw();
  return control;
}

export function setText(scope: ParentNode, key: string, value: string) {
  for (const el of scope.querySelectorAll(`[data-text="${key}"]`)) {
    if (el.textContent !== value) el.textContent = value;
  }
}

export function setShown(scope: ParentNode, key: string, shown: boolean) {
  for (const el of scope.querySelectorAll<HTMLElement>(`[data-if="${key}"]`)) el.hidden = !shown;
}

export function setData(el: HTMLElement, key: string, value: string) {
  if (el.dataset[key] !== value) el.dataset[key] = value;
}

/**
 * Makes the children of `list` match `items`, one element per item. An element is reused while its kind stays
 * the same, so only new items play their entrance animation. New elements are cloned from
 * `<template data-template="kind">` inside `root`.
 */
export function patchList<T>(
  root: HTMLElement,
  list: Element,
  items: T[],
  kindOf: (item: T) => string,
  fill: (el: HTMLElement, item: T) => void,
) {
  items.forEach((item, i) => {
    const kind = kindOf(item);
    let el = list.children[i] as HTMLElement | undefined;
    if (el?.dataset.kind !== kind) {
      const template = root.querySelector<HTMLTemplateElement>(`template[data-template="${kind}"]`)!;
      const fresh = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
      if (el) list.replaceChild(fresh, el);
      else list.append(fresh);
      el = fresh;
    }
    fill(el, item);
  });
  while (list.children.length > items.length) list.lastElementChild!.remove();
}

function fillMessage(el: HTMLElement, m: Message) {
  switch (m.kind) {
    case 'user':
    case 'ret':
      setText(el, 'text', m.text);
      break;
    case 'agent':
      setText(el, 'text', m.text);
      setShown(el, 'streaming', m.streaming);
      break;
    case 'call':
      setText(el, 'name', m.name);
      setText(el, 'args', m.args);
      break;
    case 'sys':
      setText(el, 'title', m.title);
      setText(el, 'body', m.body);
      break;
    case 'approval':
      setText(el, 'name', m.name);
      setData(el, 'state', m.approved ? 'approved' : 'pending');
      break;
  }
}

function fillChip(el: HTMLElement, chip: Chip) {
  setText(el, 'tool', chip.tool);
  setText(el, 'label', chip.label);
  setText(el, 'meta', chip.meta);
  setData(el, 'state', chip.done ? 'done' : 'running');
}

/** Updates the parts every chat panel shares: status, messages, typing dots, chips and composer. */
export function patchChat(root: HTMLElement, state: ChatState) {
  setText(root, 'status', state.busy ? STATUS_TEXT.busy : STATUS_TEXT.idle);
  setShown(root, 'busy', state.busy);
  setShown(root, 'idle', !state.busy);
  setShown(root, 'typing', state.typing);
  setText(root, 'input', state.input);
  setShown(root, 'typed', state.input !== '');
  setShown(root, 'empty', state.input === '');
  patchList(root, root.querySelector('[data-list="messages"]')!, state.msgs, (m) => m.kind, fillMessage);
  const chips = root.querySelector('[data-list="chips"]');
  if (chips) patchList(root, chips, state.chips, () => 'chip', fillChip);
}
