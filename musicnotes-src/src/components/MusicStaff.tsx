import { useEffect, useRef } from "react";
import {
  Accidental,
  Formatter,
  Renderer,
  Stave,
  StaveNote,
  Voice,
} from "vexflow";
import type { Question } from "../domain/music";

interface Props {
  question: Question;
}

export default function MusicStaff({ question }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    function draw() {
      if (!container) return;

      const width = Math.max(280, Math.floor(container.clientWidth));
      const height = 185;

      // Remove the previous SVG before drawing a new one.
      container.replaceChildren();

      const renderer = new Renderer(container, Renderer.Backends.SVG);

      renderer.resize(width, height);

      const context = renderer.getContext();

      // Enlarge all musical elements by 20%.
      const scale = 1.2;

      context.scale(scale, scale);

      // Width is calculated with scaling in mind.
      const logicalWidth = width / scale;
      // SHorter stave for a single note.
      const staveWidth = Math.min(logicalWidth - 40, 160);
      // Horizontal centering.
      const staveX = (logicalWidth - staveWidth) / 2;
      // Vertical position.
      const stave = new Stave(staveX, 14, staveWidth);

      stave.addClef(question.clef);
      stave.setContext(context).draw();

      // VexFlow uses B, but we display H to the user (croatian notation).
      const key = `${question.letter.toLowerCase()}/${question.octave}`;
      // Cijela nota (bez vrata) za čist prikaz.
      const note = new StaveNote({
        keys: [key],
        duration: "w",
        clef: question.clef,
      });

      const symbols: Record<string, string> = {
        natural: "n",
        sharp: "#",
        flat: "b",
      };

      if (question.accidental !== "none") {
        note.addModifier(new Accidental(symbols[question.accidental]), 0);
      }

      const voice = new Voice({
        numBeats: 4,
        beatValue: 4,
      });

      voice.addTickables([note]);
      new Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(context, stave);
    }

    // Prilagodi crtovlje širini ekrana.
    const observer = new ResizeObserver(draw);

    observer.observe(container);
    draw();

    return () => {
      observer.disconnect();
      container.replaceChildren();
    };
  }, [question]);

  const clefName = question.clef === "treble" ? "violinskom" : "basovskom";

  return (
    <div
      className="staff-surface"
      role="img"
      aria-label={
        `Notno crtovlje u ${clefName} ključu. ` + "Odredi naziv prikazane note."
      }>
      <div ref={containerRef} className="staff-canvas" />
    </div>
  );
}
