import type { SelectHTMLAttributes } from 'react';
/** Native select styled to match Input, with a chevron affordance. */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'style'> {
  label?: string;
  hint?: string;
  /** Strings, or { label, value } objects. */
  options?: (string | { label: string; value: string })[];
  tone?: 'light' | 'navy';
  required?: boolean;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
