/**
 * Silver Jubilee emblem — six-petal bloom with the silver "25".
 */
export interface JubileeMarkProps {
  size?: number;
  /** mark = emblem only · stacked = emblem + "25 Years of Human Excellence". */
  lockup?: 'mark' | 'stacked';
  tone?: 'onNavy' | 'onLight';
  /** Path to the emblem PNG, relative to the consuming page. Default "assets/logo-srss25-jubilee.png". */
  src?: string;
  style?: React.CSSProperties;
}
export declare function JubileeMark(props: JubileeMarkProps): JSX.Element;
