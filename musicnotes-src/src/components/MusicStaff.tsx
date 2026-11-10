import { useEffect, useRef } from "react";
import {
  Accidental,
  Formatter,
  Renderer,
  Stave,
  StaveNote,
  Voice,
} from "vexflow";
import { type AccidentalType, type Question } from "../domain/music";

interface Props {
  question: Question;
  ariaLabel: string;
}

const STAFF_HEIGHT = 185;
const STAFF_SCALE = 1.3;

export default function MusicStaff({ question, ariaLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    function draw() {
      if (!container) return;

      const width = Math.floor(container.clientWidth);
      if (width <= 0) return;

      // Remove the previous SVG before drawing a new one.
      container.replaceChildren();

      const renderer = new Renderer(container, Renderer.Backends.SVG);

      renderer.resize(width, STAFF_HEIGHT);

      const context = renderer.getContext();

      context.scale(STAFF_SCALE, STAFF_SCALE);

      const logicalWidth = width / STAFF_SCALE;

      // SHorter stave for a single note.
      const staveWidth = Math.min(logicalWidth - 40, 230);
      // Horizontal centering.
      const staveX = (logicalWidth - staveWidth) / 2;
      // Vertical position.
      const stave = new Stave(staveX, 8, staveWidth);

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

      const symbols: Record<Exclude<AccidentalType, "none">, string> = {
        natural: "n",
        sharp: "#",
        flat: "b",
        "double-sharp": "##",
        "double-flat": "bb",
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

  return (
    <div className="staff-surface" role="img" aria-label={ariaLabel}>
      <div
        ref={containerRef}
        className="staff-canvas"
        style={{ height: STAFF_HEIGHT }}
      />
    </div>
  );
}
