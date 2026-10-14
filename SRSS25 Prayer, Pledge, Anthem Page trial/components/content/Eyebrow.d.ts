import type { ReactNode } from 'react';
/** Uppercase wide-tracked kicker above headings. Separate parts with " · ". */
export interface EyebrowProps {
  children?: ReactNode;
  /** gold on navy · goldInk on cream · onNavy for quiet white · navy on cream. */
  tone?: 'gold' | 'goldInk' | 'onNavy' | 'navy';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export declare function Eyebrow(props: EyebrowProps): JSX.Element;
