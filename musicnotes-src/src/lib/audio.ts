import type { Question } from "../domain/music";
import { noteFrequency } from "../domain/audio";

let audioContext: AudioContext | null = null;
let activeGain: GainNode | null = null;

export async function playNote(question: Question): Promise<void> {
  if (typeof window.AudioContext !== "function") {
    throw new Error("Web Audio nije podržan.");
  }

  // One AudioContext po stranici je preporučena praksa.
  const context = audioContext ?? new AudioContext();

  audioContext = context;

  // Browsers may suspend playback until the user interacts with the page.
  if (context.state === "suspended") {
    await context.resume();
  }

  const now = context.currentTime;

  // Quickly fade out the previous note if it's still playing.
  if (activeGain) {
    activeGain.gain.cancelScheduledValues(now);

    activeGain.gain.setTargetAtTime(0.0001, now, 0.01);
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";

  oscillator.frequency.setValueAtTime(noteFrequency(question), now);

  // Short attack and release to avoid clicks.
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.02);

  gain.gain.setTargetAtTime(0.0001, now + 0.2, 0.09);

  oscillator.connect(gain);
  gain.connect(context.destination);

  activeGain = gain;

  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();

    if (activeGain === gain) {
      activeGain = null;
    }
  };

  oscillator.start(now);
  oscillator.stop(now + 0.65);
}
