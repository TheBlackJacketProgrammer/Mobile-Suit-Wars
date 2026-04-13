import { getGlobalMuteState } from "@/contexts/SoundContext";

/**
 * Play a short sound (e.g. button click). Call from a click/tap handler so
 * the browser treats it as a user gesture. Paths are under `public/`, e.g.
 * `/sounds/click.mp3`.
 */
export function playSound(
  src: string,
  options?: { volume?: number }
): void {
  // Don't play if globally muted
  if (getGlobalMuteState()) {
    return;
  }

  const audio = new Audio(src);
  audio.volume = Math.min(1, Math.max(0, options?.volume ?? 0.65));
  void audio.play().catch(() => {
    /* missing file or playback blocked */
  });
}

let lastHoverSoundAt = 0;

/**
 * Quiet hover feedback, rate-limited so moving across a row of controls does not stack clips.
 * Some browsers block audio until the user has clicked or otherwise gestured on the page once.
 */
export function playHoverSound(
  src: string,
  options?: { volume?: number; minIntervalMs?: number }
): void {
  const minInterval = options?.minIntervalMs ?? 90;
  const now = performance.now();
  if (now - lastHoverSoundAt < minInterval) return;
  lastHoverSoundAt = now;
  playSound(src, { volume: options?.volume ?? 0.3 });
}
