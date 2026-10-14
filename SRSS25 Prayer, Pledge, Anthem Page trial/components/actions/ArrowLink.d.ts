import type { AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * Secondary text call-to-action: label + arrow over a gold rule that
 * extends to full width on hover. Used beside every primary Button.
 */
export interface ArrowLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'style'> {
  children?: ReactNode;
  href?: string;
  /** navy on cream grounds, onNavy for white-on-navy, gold for gold labels. */
  tone?: 'navy' | 'onNavy' | 'gold';
  size?: 'sm' | 'md';
  /** Lucide slug — arrow-right (in-page) or arrow-up-right (off-site/story). */
  icon?: string;
  underline?: boolean;
  style?: React.CSSProperties;
}
export declare function ArrowLink(props: ArrowLinkProps): JSX.Element;
