import {
  successRate,
  type SessionStats,
  type TotalStats,
} from "../domain/statistics";

import type { Translate } from "../i18n/translations";

interface Props {
  session: SessionStats;
  total: TotalStats;
  t: Translate;
  legacyTotal?: TotalStats | null;
}

export default function Scoreboard({ session, total, t, legacyTotal }: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>{t("stats")}</h2>
      </div>

      <h3 className="stats-subtitle">{t("session")}</h3>

      <div className="stats-grid">
        <div className="stat">
          <span>{t("correct")}</span>
          <strong className="positive">{session.correct}</strong>
        </div>

        <div className="stat">
          <span>{t("incorrect")}</span>
          <strong className="negative">{session.incorrect}</strong>
        </div>

        <div className="stat">
          <span>{t("attempts")}</span>
          <strong>{session.correct + session.incorrect}</strong>
        </div>

        <div className="stat">
          <span>{t("accuracy")}</span>
          <strong>{successRate(session.correct, session.incorrect)}%</strong>
        </div>

        <div className="stat">
          <span>{t("streak")}</span>
          <strong className="accent">{session.streak}</strong>
        </div>

        <div className="stat">
          <span>{t("bestStreak")}</span>
          <strong>{session.bestStreak}</strong>
        </div>
      </div>

      <div className="total-stats">
        <h3 className="stats-subtitle">{t("totalStats")}</h3>

        <div className="total-grid">
          <div>
            <span>{t("correct")}</span>
            <strong>{total.correct}</strong>
          </div>

          <div>
            <span>{t("incorrect")}</span>
            <strong>{total.incorrect}</strong>
          </div>

          <div>
            <span>{t("totalAttempts")}</span>
            <strong>{total.correct + total.incorrect}</strong>
          </div>

          <div>
            <span>{t("accuracy")}</span>
            <strong>{successRate(total.correct, total.incorrect)}%</strong>
          </div>

          <div>
            <span>{t("record")}</span>
            <strong>{total.bestStreak}</strong>
          </div>
        </div>
      </div>

      {legacyTotal && legacyTotal.correct + legacyTotal.incorrect > 0 && (
        <p className="settings-help">
          {t("legacyStats")}: {legacyTotal.correct} {t("correct").toLowerCase()}
          , {legacyTotal.incorrect} {t("incorrect").toLowerCase()}.{" "}
          {t("legacyStatsHelp")}
        </p>
      )}
    </section>
  );
}
