import type { ReactNode } from 'react';
/** Italic Playfair quotation with a gold rule and uppercase attribution. */
export interface PullQuoteProps {
  children?: ReactNode;
  attribution?: ReactNode;
  tone?: 'navy' | 'light';
  align?: 'left' | 'center';
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}
export declare function PullQuote(props: PullQuoteProps): JSX.Element;
