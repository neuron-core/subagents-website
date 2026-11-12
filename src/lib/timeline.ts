export interface TimelineRow {
  label: string;
  /** Start of the bar, as a CSS percentage of the timeline. */
  left: string;
  /** Length of the bar, as a CSS percentage of the timeline. */
  width: string;
  text: string;
  mono?: boolean;
  highlight?: boolean;
  wash?: boolean;
}

/** A share of the timeline as a CSS percentage. */
export const percent = (part: number, total: number): string => `${((part / total) * 100).toFixed(2)}%`;
