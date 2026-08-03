import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LazyVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & {
  src: string;
  rootMargin?: string;
};

/** Loads and plays video only when near the viewport — avoids multi‑MB downloads on first paint. */
export function LazyVideo({
  src,
  poster,
  className,
  rootMargin = "240px",
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = "none",
  ...props
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || shouldLoad) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, shouldLoad]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldLoad) return;

    el.src = src;
    el.load();
    el.muted = true;

    if (!autoPlay) return;

    const play = () => {
      void el.play().catch(() => {});
    };
    play();

    const onVisible = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [autoPlay, shouldLoad, src]);

  return (
    <video
      ref={videoRef}
      className={cn(className)}
      poster={poster}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      {...props}
    />
  );
}
