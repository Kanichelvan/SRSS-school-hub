import type { ReactNode } from 'react';
/** Large serif figure + uppercase gold label. The jubilee band's counting unit. */
export interface StatBlockProps {
  value?: ReactNode;
  label?: ReactNode;
  sublabel?: ReactNode;
  tone?: 'navy' | 'light';
  align?: 'left' | 'center';
  /** Fill the figure with the gold or silver foil gradient. */
  metal?: 'gold' | 'silver';
  style?: React.CSSProperties;
}
export declare function StatBlock(props: StatBlockProps): JSX.Element;
