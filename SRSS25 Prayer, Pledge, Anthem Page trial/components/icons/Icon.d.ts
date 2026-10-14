import type { CSSProperties } from 'react';

/** Inline SVG glyph that inherits currentColor. */
export interface IconProps {
  /** Glyph slug — see ICONS for the full set, e.g. "arrow-right", "search", "menu". */
  name?: string;
  /** Square px size. 16 inline, 20 default, 24 in headers. */
  size?: number;
  style?: CSSProperties;
}
/** Map of slug to { v: viewBox, k: 'stroke' | 'fill', d: inner SVG markup }. */
export declare const ICONS: Record<string, { v: string; k: 'stroke' | 'fill'; d: string }>;
export declare function Icon(props: IconProps): JSX.Element | null;
