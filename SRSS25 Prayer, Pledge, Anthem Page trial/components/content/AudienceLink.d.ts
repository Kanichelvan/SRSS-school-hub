import type { ReactNode } from 'react';
/** One cell of the four-up audience router row at the foot of a page. */
export interface AudienceLinkProps {
  title?: ReactNode;
  body?: ReactNode;
  href?: string;
  tone?: 'light' | 'navy';
  /** Left hairline — omit on the first cell. */
  divider?: boolean;
  style?: React.CSSProperties;
}
export declare function AudienceLink(props: AudienceLinkProps): JSX.Element;
