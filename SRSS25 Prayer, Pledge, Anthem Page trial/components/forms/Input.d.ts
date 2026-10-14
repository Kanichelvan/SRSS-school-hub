import type { InputHTMLAttributes } from 'react';
/** Labelled text field. Uppercase micro-label above, hint or error below. */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label?: string;
  hint?: string;
  /** Replaces the hint and turns the border red. */
  error?: string;
  tone?: 'light' | 'navy';
  required?: boolean;
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
