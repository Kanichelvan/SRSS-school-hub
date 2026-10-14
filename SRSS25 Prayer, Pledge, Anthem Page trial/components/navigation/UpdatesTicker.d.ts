import type { ReactNode } from 'react';
/** Thin navy announcement strip that sits above the masthead. */
export interface UpdatesTickerProps {
  label?: string;
  /** Human-formatted date, e.g. "20 Jul 2026". */
  date?: ReactNode;
  message?: ReactNode;
  linkLabel?: string;
  href?: string;
  paused?: boolean;
  onTogglePause?: () => void;
  style?: React.CSSProperties;
}
export declare function UpdatesTicker(props: UpdatesTickerProps): JSX.Element;
