import type { ReactNode } from 'react';
/**
 * The standard SRSS heading block: gold eyebrow, Playfair display title with
 * an optional gold accent line, and a Poppins standfirst.
 */
export interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** Second line rendered in gold — the brand's signature emphasis. */
  accent?: ReactNode;
  standfirst?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'navy';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: number | string;
  style?: React.CSSProperties;
}
export declare function SectionHeading(props: SectionHeadingProps): JSX.Element;
