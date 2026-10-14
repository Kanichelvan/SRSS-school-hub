/** Interior-page trail; the last item is the current page and is not a link. */
export interface BreadcrumbsProps {
  /** Strings, or { label, href } objects. */
  items?: (string | { label: string; href?: string })[];
  tone?: 'light' | 'navy';
  style?: React.CSSProperties;
}
export declare function Breadcrumbs(props: BreadcrumbsProps): JSX.Element;
