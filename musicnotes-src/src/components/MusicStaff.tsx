import { useEffect, useRef } from "react";
import {
  Accidental,
  Formatter,
  Renderer,
  Stave,
  StaveNote,
  Voice,
} from "vexflow";
import type { AccidentalType } from "../domain/music";
import type { PracticeQuestion } from "../domain/exercises";

interface Props {
  question: PracticeQuestion;
  ariaLabel: string;
}

const STAFF_HEIGHT = 185;
const STAFF_SCALE = 1.3;

export default function MusicStaff({ question, ariaLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScale = question.kind === "scale";

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const notes =
      question.kind === "note"
        ? [question.value]
        : question.kind === "interval"
          ? [question.value.first, question.value.second]
          : question.value.notes;

    const clef =
      question.kind === "note"
        ? question.value.clef
        : question.kind === "interval"
          ? question.value.first.clef
          : question.value.clef;

    function draw() {
      if (!container) return;

      const width = Math.floor(container.clientWidth);
      if (width <= 0) return;

      // Eight notes and up to seven key-signature accidentals
      // need enough horizontal space on narrow screens.
      const rendererWidth = isScale ? Math.max(width, 660) : width;

      container.replaceChildren();

      const renderer = new Renderer(container, Renderer.Backends.SVG);

      renderer.resize(rendererWidth, STAFF_HEIGHT);

      const context = renderer.getContext();
      const scale = isScale ? 1 : STAFF_SCALE;

      context.scale(scale, scale);

      const logicalWidth = rendererWidth / scale;

      // SHorter stave for a single note.
      const staveWidth = isScale
        ? logicalWidth - 24
        : Math.min(logicalWidth - 12, notes.length === 1 ? 230 : 320);

      // Horizontal centering.
      const staveX = (logicalWidth - staveWidth) / 2;
      // Vertical position.
      const stave = new Stave(staveX, 8, staveWidth);

      stave.addClef(clef);

      if (question.kind === "scale") {
        stave.addKeySignature(question.value.keySignature);
      }

      stave.setContext(context).draw();

      // VexFlow uses B, but we display H to the user (croatian notation).

      const symbols: Record<Exclude<AccidentalType, "none">, string> = {
        natural: "n",
        sharp: "#",
        flat: "b",
        "double-sharp": "##",
        "double-flat": "bb",
      };

      const staveNotes = notes.map((source) => {
        const key = `${source.letter.toLowerCase()}/${source.octave}`;

        const note = new StaveNote({
          keys: [key],
          duration: isScale ? "q" : "w",
          clef,
        });

        if (source.accidental !== "none") {
          note.addModifier(new Accidental(symbols[source.accidental]), 0);
        }

        return note;
      });

      const voice = new Voice({
        numBeats: isScale ? staveNotes.length : staveNotes.length * 4,
        beatValue: 4,
      });

      voice.addTickables(staveNotes);

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
    <div
      className={isScale ? "staff-surface scale-staff" : "staff-surface"}
      role="img"
      aria-label={ariaLabel}>
      <div
        ref={containerRef}
        className="staff-canvas"
        style={{ height: STAFF_HEIGHT }}
      />
    </div>
  );
}
