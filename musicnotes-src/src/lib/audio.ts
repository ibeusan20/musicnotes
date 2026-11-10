import type { Question } from "../domain/music";
import { noteFrequency } from "../domain/audio";

const DURATION = 1.8;

let audioContext: AudioContext | null = null;
let isPlaying = false;

export async function playNote(question: Question): Promise<void> {
  // Ignore repeated requests while a note is playing.
  if (isPlaying) return;

  if (typeof window.AudioContext !== "function") {
    throw new Error("Web Audio nije podržan.");
  }

  // Lock immediately, including during AudioContext initialization.
  isPlaying = true;

  try {
    const context = audioContext ?? new AudioContext();
    audioContext = context;

    if (context.state === "suspended") {
      await context.resume();
    }

    const now = context.currentTime;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(noteFrequency(question), now);

    // Attack (0.02s), sustain (1.5s), release (0.3s).
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain.gain.setValueAtTime(0.16, now + 1.5);
    gain.gain.linearRampToValueAtTime(0, now + DURATION);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      isPlaying = false;
    };

    oscillator.start(now);
    oscillator.stop(now + DURATION);
  } catch (error) {
    isPlaying = false;
    throw error;
  }
}
