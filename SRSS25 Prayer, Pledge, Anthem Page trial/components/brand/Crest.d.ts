/**
 * Official school seal, alone or locked up with the bilingual name.
 */
export interface CrestProps {
  /** Crest px size. 64 in the site header, 40 in compact bars, 120+ on print. */
  size?: number;
  /** full = crest + name + tagline · name = crest + name · mark = crest only. */
  lockup?: 'full' | 'name' | 'mark';
  tone?: 'onNavy' | 'onLight';
  /** Path to the crest PNG, relative to the consuming page. Default "assets/logo-srss-crest.png". */
  src?: string;
  style?: React.CSSProperties;
}
export declare function Crest(props: CrestProps): JSX.Element;
