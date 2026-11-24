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
import {
  practiceQuestionClef,
  type PracticeQuestion,
} from "../domain/exercises";

interface Props {
  question: PracticeQuestion;
  ariaLabel: string;
}

const STAFF_HEIGHT = 185;
const STAFF_SCALE = 1.3;

const ACCIDENTAL_SYMBOLS: Record<Exclude<AccidentalType, "none">, string> = {
  natural: "n",
  sharp: "#",
  flat: "b",
  "double-sharp": "##",
  "double-flat": "bb",
};

export default function MusicStaff({ question, ariaLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScale = question.kind === "scale";
  const isChord = question.kind === "chord";
  const isKeySignature = question.kind === "key-signature";

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const notes =
      question.kind === "note"
        ? [question.value]
        : question.kind === "interval"
          ? [question.value.first, question.value.second]
          : question.kind === "key-signature"
            ? []
            : question.value.notes;

    const clef = practiceQuestionClef(question);

    function draw() {
      if (!container) return;

      const width = Math.floor(container.clientWidth);
      if (width <= 0) return;

      // Eight notes and up to seven key-signature accidentals
      // need enough horizontal space on narrow screens.
      const rendererWidth = isScale
        ? Math.max(width, 660)
        : isKeySignature
          ? Math.max(width, 330)
          : width;

      container.replaceChildren();

      const renderer = new Renderer(container, Renderer.Backends.SVG);

      renderer.resize(rendererWidth, STAFF_HEIGHT);

      const context = renderer.getContext();
      const scale = isScale || isKeySignature ? 1 : STAFF_SCALE;

      context.scale(scale, scale);

      const logicalWidth = rendererWidth / scale;

      // SHorter stave for a single note.

      const staveWidth = isScale
        ? logicalWidth - 24
        : isKeySignature
          ? Math.min(logicalWidth - 24, 290)
          : isChord
            ? Math.min(logicalWidth - 12, 180)
            : Math.min(logicalWidth - 12, notes.length === 1 ? 100 : 130);

      // Horizontal centering.
      const staveX = (logicalWidth - staveWidth) / 2;
      // Vertical position.
      const stave = new Stave(staveX, 8, staveWidth);

      stave.addClef(clef);

      if (question.kind === "scale" || question.kind === "key-signature") {
        stave.addKeySignature(question.value.keySignature);
      }
      stave.setContext(context).draw();

      // Key signature exercises contain no written notes.
      if (isKeySignature) return;

      // VexFlow uses B, but we display H to the user (croatian notation).

      const noteGroups = isChord ? [notes] : notes.map((note) => [note]);

      const staveNotes = noteGroups.map((group) => {
        const keys = group.map(
          (source) => `${source.letter.toLowerCase()}/${source.octave}`,
        );

        const note = new StaveNote({
          keys,
          duration: "w",
          clef,
        });

        group.forEach((source, index) => {
          if (source.accidental !== "none") {
            note.addModifier(
              new Accidental(ACCIDENTAL_SYMBOLS[source.accidental]),
              index,
            );
          }
        });

        return note;
      });

      const voice = new Voice({
        numBeats: staveNotes.length * 4,
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
      className={
        isScale || isKeySignature
          ? "staff-surface scale-staff"
          : "staff-surface"
      }
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
