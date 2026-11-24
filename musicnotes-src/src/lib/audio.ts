import { noteFrequency } from "../domain/audio";
import type { PlaybackEvent } from "../domain/playback";

let audioContext: AudioContext | null = null;
let isPlaying = false;
let generation = 0;

const activeOscillators = new Set<OscillatorNode>();

/**
 * Stop the active playback and invalidate pending async starts.
 */
export function stopPlayback(): void {
  generation++;
  isPlaying = false;

  for (const oscillator of activeOscillators) {
    try {
      oscillator.stop();
    } catch {
      // The oscillator may already have stopped.
    }
  }

  activeOscillators.clear();
}

/**
 * Schedule melodic or harmonic playback with the Web Audio API.
 * Only one playback session can run at a time.
 */
export async function playEvents(
  events: readonly PlaybackEvent[],
): Promise<void> {
  if (isPlaying || events.length === 0) return;

  if (
    typeof window === "undefined" ||
    typeof window.AudioContext !== "function"
  ) {
    throw new Error("Web Audio is not supported.");
  }

  isPlaying = true;
  const playbackGeneration = ++generation;

  try {
    const context = audioContext ?? new AudioContext();
    audioContext = context;

    if (context.state === "suspended") {
      await context.resume();
    }

    // The user may have changed the question while audio resumed.
    if (playbackGeneration !== generation) return;

    const baseTime = context.currentTime + 0.03;

    for (const event of events) {
      const startTime = baseTime + event.start;
      const endTime = startTime + event.duration;

      // Reduce gain when several tones sound simultaneously.
      const volume = 0.16 / Math.sqrt(event.notes.length);

      for (const note of event.notes) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(noteFrequency(note), startTime);

        // Smooth attack and release to avoid audible clicks.
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
        gain.gain.setValueAtTime(
          volume,
          Math.max(startTime + 0.02, endTime - 0.12),
        );
        gain.gain.linearRampToValueAtTime(0, endTime);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.onended = () => {
          activeOscillators.delete(oscillator);
          oscillator.disconnect();
          gain.disconnect();

          if (
            playbackGeneration === generation &&
            activeOscillators.size === 0
          ) {
            isPlaying = false;
          }
        };

        activeOscillators.add(oscillator);
        oscillator.start(startTime);
        oscillator.stop(endTime);
      }
    }

    if (activeOscillators.size === 0) {
      isPlaying = false;
    }
  } catch (error) {
    if (playbackGeneration === generation) {
      stopPlayback();
    }

    throw error;
  }
}
