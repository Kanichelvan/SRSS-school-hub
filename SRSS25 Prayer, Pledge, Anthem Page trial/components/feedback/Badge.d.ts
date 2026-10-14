import type { ReactNode } from 'react';
/** Small uppercase status pill. */
export interface BadgeProps {
  children?: ReactNode;
  tone?: 'gold' | 'navy' | 'onNavy' | 'silver' | 'success' | 'warning' | 'danger';
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
