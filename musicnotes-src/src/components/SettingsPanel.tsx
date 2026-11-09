import type { Settings } from "../domain/music";
import type { Translate } from "../i18n/translations";

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
  t: Translate;
}

export default function SettingsPanel({ settings, onChange, t }: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>{t("settings")}</h2>
      </div>

      <div className="settings-grid">
        <label className="field">
          <span>{t("clef")}</span>

          <select
            value={settings.clef}
            onChange={(event) =>
              onChange({
                ...settings,
                clef: event.target.value as Settings["clef"],
              })
            }>
            <option value="random">{t("clefRandom")}</option>
            <option value="treble-bass">{t("clefTrebleBass")}</option>
            <option value="treble">{t("clefTreble")}</option>
            <option value="bass">{t("clefBass")}</option>
            <option value="alto">{t("clefAlto")}</option>
            <option value="tenor">{t("clefTenor")}</option>
          </select>
        </label>

        <label className="field">
          <span>{t("difficulty")}</span>

          <select
            value={settings.difficulty}
            onChange={(event) =>
              onChange({
                ...settings,
                difficulty: event.target.value as Settings["difficulty"],
              })
            }>
            <option value="basic">{t("difficultyBasic")}</option>
            <option value="extended">{t("difficultyExtended")}</option>
            <option value="advanced">{t("difficultyAdvanced")}</option>
          </select>
        </label>

        <label className="field">
          <span>{t("answerMode")}</span>

          <select
            value={settings.answerMode}
            onChange={(event) =>
              onChange({
                ...settings,
                answerMode: event.target.value as Settings["answerMode"],
              })
            }>
            <option value="letter">{t("answerLetter")}</option>
            <option value="letter-octave">{t("answerLetterOctave")}</option>
          </select>
        </label>

        <label className="field">
          <span>{t("accidentals")}</span>

          <select
            value={settings.accidentalLevel}
            onChange={(event) =>
              onChange({
                ...settings,
                accidentalLevel: event.target
                  .value as Settings["accidentalLevel"],
              })
            }>
            <option value="off">{t("accidentalOff")}</option>
            <option value="single">{t("accidentalSingle")}</option>
            <option value="double">{t("accidentalDouble")}</option>
          </select>
        </label>
      </div>

      <p className="settings-help">{t("settingsHelp")}</p>
    </section>
  );
}
