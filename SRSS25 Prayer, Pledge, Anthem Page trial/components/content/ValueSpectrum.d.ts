/**
 * The five Human Values in their crest petal colours.
 */
export interface ValueSpectrumProps {
  /** row = swatch bar + labels · rule = bare gradient rule · stack = dotted list. */
  variant?: 'row' | 'rule' | 'stack';
  tone?: 'navy' | 'light';
  /** Show the Malay name beneath the English one. */
  bilingual?: boolean;
  /** Swatch/rule thickness in px. */
  height?: number;
  style?: React.CSSProperties;
}
export declare function ValueSpectrum(props: ValueSpectrumProps): JSX.Element;
