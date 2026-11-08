import type { Settings } from "../domain/music";

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

export default function SettingsPanel({ settings, onChange }: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Postavke</h2>
      </div>

      <div className="settings-grid">
        <label className="field">
          <span>Predznaci</span>

          <select
            value={settings.accidentalLevel}
            onChange={(event) =>
              onChange({
                ...settings,
                accidentalLevel: event.target
                  .value as Settings["accidentalLevel"],
              })
            }>
            <option value="off">Bez predznaka</option>

            <option value="single">Jednostruki (♯, ♭, ♮)</option>
          </select>
        </label>

        <label className="field">
          <span>Glazbeni ključ</span>

          <select
            value={settings.clef}
            onChange={(event) =>
              onChange({
                ...settings,
                clef: event.target.value as Settings["clef"],
              })
            }>
            <option value="random">Nasumično</option>
            <option value="treble">Violinski ključ</option>
            <option value="bass">Basovski ključ</option>
          </select>
        </label>

        <label className="field">
          <span>Težina</span>

          <select
            value={settings.difficulty}
            onChange={(event) =>
              onChange({
                ...settings,
                difficulty: event.target.value as Settings["difficulty"],
              })
            }>
            <option value="basic">Osnovna — bez pomoćnih crta</option>
            <option value="extended">Proširena — do 2 pomoćne crte</option>
            <option value="advanced">Napredna — do 4 pomoćne crte</option>
          </select>
        </label>

        <label className="field">
          <span>Način odgovaranja</span>

          <select
            value={settings.answerMode}
            onChange={(event) =>
              onChange({
                ...settings,
                answerMode: event.target.value as Settings["answerMode"],
              })
            }>
            <option value="letter">Samo naziv note (C, D, E...)</option>
            <option value="letter-octave">Naziv i oktava (C4, D5...)</option>
          </select>
        </label>
      </div>

      <p className="settings-help">
        Promjena postavki započinje novu sesiju. Ukupna statistika ostaje
        sačuvana.
      </p>
    </section>
  );
}
