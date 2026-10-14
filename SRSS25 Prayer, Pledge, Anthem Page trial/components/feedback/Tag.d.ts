import type { ReactNode } from 'react';
/** Filterable topic chip for story lists and year-group filters. */
export interface TagProps {
  children?: ReactNode;
  active?: boolean;
  tone?: 'light' | 'navy';
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function Tag(props: TagProps): JSX.Element;
