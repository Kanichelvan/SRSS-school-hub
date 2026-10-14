import type { ButtonHTMLAttributes } from 'react';

/**
 * Glyph-only control. 44px minimum so it stays a valid touch target.
 * Circular variant is used only for the footer social row.
 */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Lucide slug. */
  icon?: string;
  /** Accessible name — required in practice. */
  label?: string;
  shape?: 'square' | 'circle';
  tone?: 'onNavy' | 'onNavyRing' | 'gold' | 'ink';
  /** Box size in px. Never below 44 in production surfaces. */
  size?: number;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
