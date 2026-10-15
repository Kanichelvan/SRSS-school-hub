import { useEffect, useRef, useState } from 'react';
import { Pause } from '@phosphor-icons/react/dist/csr/Pause';
import { Play } from '@phosphor-icons/react/dist/csr/Play';

export const HERO_CLIPS = {
  assembly: { src: '/assets/video/assembly-loop-v1.mp4', mobileSrc: '/assets/video/assembly-mobile-loop-v1.mp4', poster: '/assets/video/assembly-poster-v1.jpg', alt: 'Illustrative scene of primary pupils in lavender and purple uniforms gathered for assembly.' },
  malaysia: { src: '/assets/video/malaysia-flag-loop-v1.mp4', mobileSrc: '/assets/video/malaysia-flag-mobile-loop-v1.mp4', poster: '/assets/video/malaysia-flag-poster-v1.jpg', alt: 'Illustrative scene of pupils at assembly as the Malaysian flag is raised.' },
  school: { src: '/assets/video/school-flag-loop-v1.mp4', mobileSrc: '/assets/video/school-flag-mobile-loop-v1.mp4', poster: '/assets/video/school-flag-poster-v1.jpg', alt: 'Illustrative scene of pupils raising a purple school flag in the school courtyard.' },
};

// The poster is always available; video downloads begin only when playback is allowed.
export default function HeroVideo({ clip, className = '', priority = false, autoPlay = false, playbackRate = .8 }) {
  const container = useRef(null);
  const video = useRef(null);
  const [automatic, setAutomatic] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [requested, setRequested] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [failed, setFailed] = useState(false);
  const [small, setSmall] = useState(() => window.matchMedia('(max-width: 620px)').matches);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 620px)');
    const resize = () => { setSmall(mobile.matches); setHasFrame(false); };
    mobile.addEventListener('change', resize);
    const connection = navigator.connection;
    const update = () => setAutomatic(autoPlay && !reduced.matches && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType));
    update();
    reduced.addEventListener('change', update);
    connection?.addEventListener?.('change', update);
    const visibility = () => setTabVisible(!document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .1), { threshold: [0, .1] });
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      mobile.removeEventListener('change', resize);
      reduced.removeEventListener('change', update);
      connection?.removeEventListener?.('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [autoPlay]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.playbackRate = playbackRate;
    let cancelled = false;
    if ((automatic || requested) && !userPaused && visible && tabVisible && !failed) {
      element.play()?.catch(() => { if (!cancelled) setPlaying(false); });
    } else element.pause();
    return () => { cancelled = true; element.pause(); };
  }, [automatic, requested, userPaused, visible, tabVisible, failed, small, playbackRate]);

  const toggle = () => {
    if (playing) { setUserPaused(true); video.current.pause(); }
    else {
      setRequested(true); setUserPaused(false);
      // Direct user gesture also works where mobile autoplay is unavailable.
      video.current.play()?.catch(() => setPlaying(false));
    }
  };

  return <div ref={container} className={`hero-video ${className}${hasFrame && !failed ? ' has-frame' : ''}`}>
    <img className="hero-video-poster" src={clip.poster} alt={clip.alt} fetchPriority={priority ? 'high' : 'auto'} />
    <video ref={video} className="hero-video-footage" src={small ? clip.mobileSrc : clip.src} poster={clip.poster} preload="none" muted loop playsInline disablePictureInPicture aria-hidden="true"
      onLoadedMetadata={() => { video.current.playbackRate = playbackRate; }}
      onLoadedData={() => setHasFrame(true)} onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setFailed(true); setPlaying(false); }} />
    {!failed && <button type="button" className="hero-video-control" onClick={toggle} aria-label={playing ? 'Pause background video' : 'Play background video'} aria-pressed={playing}>
      {playing ? <Pause size={15} weight="fill" aria-hidden="true" /> : <Play size={15} weight="fill" aria-hidden="true" />}
      <span>{playing ? 'Pause' : 'Play'}</span>
    </button>}
  </div>;
}
