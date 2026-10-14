const photo = (name, width, height, alt) => ({
  src: `/assets/photos/hero/${name}-cutout-v1-1536.webp`,
  srcSet: [640, 960, 1536].map((size) => `/assets/photos/hero/${name}-cutout-v1-${size}.webp ${Math.min(size, width)}w`).join(', '),
  width, height, alt,
});

export const HERO_PHOTOS = {
  reading: photo('reading', 1536, 1024, 'Illustrative scene of a teacher and three pupils reading a book together.'),
  science: photo('science', 1452, 1083, 'A teacher demonstrating a science experiment to pupils wearing safety goggles.'),
  friends: photo('friends', 1536, 526, 'SRSS pupils sitting together, smiling and making playful hand gestures.'),
  founder: { ...photo('founder', 1254, 1254, 'Illustrated portrait of Sathya Sai Baba in an orange robe.'), className: 'hero-photo-portrait' },
};

// Alpha belongs to the photographic asset, so its edges blend on every viewport.
export default function HeroPhoto({ image, className = '', priority = false, sizes = '(max-width: 900px) 100vw, 52vw' }) {
  return <img className={`hero-photo ${image.className || ''} ${className}`} src={image.src} srcSet={image.srcSet} sizes={sizes}
    width={image.width} height={image.height} alt={image.alt} loading={priority ? 'eager' : 'lazy'}
    fetchPriority={priority ? 'high' : 'auto'} decoding="async" />;
}
