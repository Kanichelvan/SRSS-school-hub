import type { ReactNode } from 'react';
/**
 * Photograph with a navy foot gradient and type set over the image.
 */
export interface StoryCardProps {
  /** Photo path, relative to the consuming page. */
  image?: string;
  /** Gold eyebrow, e.g. "Reflection · 5 min read" or "Voices". */
  kicker?: ReactNode;
  title?: ReactNode;
  body?: ReactNode;
  cta?: ReactNode;
  href?: string;
  height?: number | string;
  /** Title scale: sm 22px · md 32px · lg 40px. */
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}
export declare function StoryCard(props: StoryCardProps): JSX.Element;
