import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Primary action control. Gold fill is reserved for the single most
 * important action on a view; everything else is outline or ghost.
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** primary = gold fill (on navy or cream). outline = gold hairline on navy. outline-ink = navy hairline on cream. ghost = text only. solid = navy fill on cream. */
  variant?: 'primary' | 'outline' | 'outline-ink' | 'ghost' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  /** Lucide slug; rendered via Icon. */
  icon?: string;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
