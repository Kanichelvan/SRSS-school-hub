/**
 * Navy site footer: crest + blurb, contact table, link columns, social circles.
 */
export interface SiteFooterProps {
  blurb?: string;
  /** [label, value] rows for the contact table. */
  contact?: [string, string][];
  columns?: { title: string; links: string[] }[];
  /** Lucide slugs for the circular social row. */
  socials?: string[];
  crestSrc?: string;
  style?: React.CSSProperties;
}
export declare function SiteFooter(props: SiteFooterProps): JSX.Element;
