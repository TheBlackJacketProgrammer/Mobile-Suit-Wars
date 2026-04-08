"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** Imperative hooks for pages that need to pause/restart looped BGM (e.g. battle stingers). */
export type ExternalBgmControls = {
  pause: () => void;
  resume: () => void;
  restartFromBeginning: () => void;
};

type Props = {
  /** Path under `public/`, e.g. `/sounds/bgm.mp3` */
  src: string;
  volume?: number;
  /**
   * Start playback when the track is ready. Browsers may still block audio
   * until the user interacts; we retry once on the first click/keypress.
   */
  autoPlay?: boolean;
  /** Called with controls when the audio element is ready; `null` on cleanup. */
  registerExternalControls?: (controls: ExternalBgmControls | null) => void;
};

export default function BackgroundMusic({
  src,
  volume = 0.35,
  autoPlay = true,
  registerExternalControls,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const userPausedRef = useRef(false);

  useLayoutEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  useLayoutEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (!autoPlay) {
      return () => {
        el.pause();
        el.currentTime = 0;
      };
    }

    if (!userPausedRef.current) {
      void el
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }

    return () => {
      el.pause();
      el.currentTime = 0;
    };
  }, [autoPlay, src]);

  useEffect(() => {
    if (!autoPlay) return;

    const onGesture = () => {
      if (userPausedRef.current) return;
      const el = audioRef.current;
      if (!el || !el.paused) return;
      el.volume = volume;
      void el
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    };

    window.addEventListener("pointerdown", onGesture, true);
    window.addEventListener("keydown", onGesture, true);
    return () => {
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
    };
  }, [autoPlay, volume, src]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !registerExternalControls) return;

    const pause = () => {
      el.pause();
      setPlaying(false);
    };
    const resume = () => {
      if (userPausedRef.current) return;
      el.volume = volume;
      void el
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    };
    const restartFromBeginning = () => {
      userPausedRef.current = false;
      el.pause();
      el.currentTime = 0;
      el.volume = volume;
      void el
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    };

    registerExternalControls({ pause, resume, restartFromBeginning });
    return () => registerExternalControls(null);
  }, [registerExternalControls, volume, src]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      userPausedRef.current = true;
      setPlaying(false);
      return;
    }
    userPausedRef.current = false;
    el.volume = volume;
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [playing, volume]);

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        playsInline
      />
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-neutral-800/90 px-3 py-2 text-sm text-white shadow-md hover:bg-neutral-700/90"
        aria-pressed={playing}
        aria-label={playing ? "Pause background music" : "Play background music"}
      >
        {playing ? "Mute BGM" : "Play BGM"}
      </button>
    </>
  );
}
