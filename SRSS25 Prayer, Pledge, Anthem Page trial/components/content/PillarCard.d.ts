import type { ReactNode } from 'react';
/** One column in the three-up "mind, heart and character" pillar row. */
export interface PillarCardProps {
  title?: ReactNode;
  body?: ReactNode;
  align?: 'center' | 'left';
  tone?: 'light' | 'navy';
  /** Left hairline divider — omit on the first column of the row. */
  divider?: boolean;
  style?: React.CSSProperties;
}
export declare function PillarCard(props: PillarCardProps): JSX.Element;
