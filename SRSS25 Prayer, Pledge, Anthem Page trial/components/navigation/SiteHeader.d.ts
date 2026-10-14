/**
 * The SRSS masthead — crest lockup, nav, search, Parent Hub, gold-outlined CTA.
 */
export interface SiteHeaderProps {
  nav?: string[];
  /** Label of the current section — gets a gold underline. */
  active?: string;
  onNavigate?: (item: string) => void;
  /** Crest path relative to the consuming page. */
  crestSrc?: string;
  ctaLabel?: string;
  /** Shorter CTA label used in dense mode (6+ nav items). Default "Admissions". */
  denseCtaLabel?: string;
  onCta?: () => void;
  /** Shorter 76px bar with the tagline dropped — for interior pages. */
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function SiteHeader(props: SiteHeaderProps): JSX.Element;
