/**
 * Type-only lockup for contexts too small or too flat for the crest.
 */
export interface WordmarkProps {
  /** srss25 = "SRSS25" with gold 25 · full = school name + bilingual tagline. */
  variant?: 'srss25' | 'full';
  tone?: 'onNavy' | 'onLight';
  /** Cap height driver in px. */
  size?: number;
  style?: React.CSSProperties;
}
export declare function Wordmark(props: WordmarkProps): JSX.Element;
