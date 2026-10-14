import type { ReactNode } from 'react';
/** Inline message band with a coloured top rule. */
export interface NoticeProps {
  title?: ReactNode;
  children?: ReactNode;
  tone?: 'info' | 'gold' | 'success' | 'warning' | 'danger';
  style?: React.CSSProperties;
}
export declare function Notice(props: NoticeProps): JSX.Element;
