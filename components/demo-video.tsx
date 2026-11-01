"use client";

import { useEffect, useRef, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function PlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.2v13.6L19 12 8 5.2Z" fill="currentColor" /></svg>;
}

function PauseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5h3v14H8V5Zm5 0h3v14h-3V5Z" fill="currentColor" /></svg>;
}

export function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const motionPreference = window.matchMedia(REDUCED_MOTION_QUERY);

    const startPlayback = () => {
      video.play().catch(() => setIsPlaying(false));
    };
    const applyMotionPreference = (reduced: boolean) => {
      if (reduced) {
        video.pause();
        setIsPlaying(false);
      } else {
        startPlayback();
      }
    };
    const syncPlayState = () => setIsPlaying(!video.paused);
    const handleMotionChange = (event: MediaQueryListEvent) => applyMotionPreference(event.matches);

    video.addEventListener("play", syncPlayState);
    video.addEventListener("pause", syncPlayState);
    motionPreference.addEventListener("change", handleMotionChange);
    syncPlayState();
    applyMotionPreference(motionPreference.matches);

    return () => {
      video.removeEventListener("play", syncPlayState);
      video.removeEventListener("pause", syncPlayState);
      motionPreference.removeEventListener("change", handleMotionChange);
      video.pause();
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  };

  const label = isPlaying ? "Pause demo video" : "Play demo video";

  return (
    <figure className="demo-frame">
      <div className="demo-frame__media">
        <video ref={videoRef} muted loop playsInline preload="metadata" aria-label="Glance for Windows product demo">
          <source src="/assets/demo/glance-demo.mp4" type="video/mp4" />
          Your browser cannot play this video. Open it in a modern browser to see the Glance demo.
        </video>
        <button type="button" className="demo-frame__toggle" aria-label={label} aria-pressed={isPlaying} onClick={togglePlayback}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      <figcaption>Glance 0.1.7 · A quick look at the Windows app and face-unlock flow.</figcaption>
    </figure>
  );
}
