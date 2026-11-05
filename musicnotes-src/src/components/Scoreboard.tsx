import {
  successRate,
  type SessionStats,
  type TotalStats,
} from "../domain/statistics";

interface Props {
  session: SessionStats;
  total: TotalStats;
}

export default function Scoreboard({ session, total }: Props) {
  const sessionCount = session.correct + session.incorrect;
  const totalCount = total.correct + total.incorrect;

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Statistika</h2>
      </div>

      <h3 className="stats-subtitle">Trenutačna sesija</h3>

      <div className="stats-grid">
        <div className="stat">
          <span>Točno</span>
          <strong className="positive">{session.correct}</strong>
        </div>

        <div className="stat">
          <span>Pogrešno</span>
          <strong className="negative">{session.incorrect}</strong>
        </div>

        <div className="stat">
          <span>Pokušaja</span>
          <strong>{sessionCount}</strong>
        </div>

        <div className="stat">
          <span>Točnost</span>
          <strong>{successRate(session.correct, session.incorrect)}%</strong>
        </div>

        <div className="stat">
          <span>Streak</span>
          <strong className="accent">{session.streak}</strong>
        </div>

        <div className="stat">
          <span>Najbolji niz</span>
          <strong>{session.bestStreak}</strong>
        </div>
      </div>

      <div className="total-stats">
        <h3 className="stats-subtitle">Ukupna statistika</h3>

        <div className="total-grid">
          <div>
            <span>Točno</span>
            <strong>{total.correct}</strong>
          </div>

          <div>
            <span>Pogrešno</span>
            <strong>{total.incorrect}</strong>
          </div>

          <div>
            <span>Ukupno</span>
            <strong>{totalCount}</strong>
          </div>

          <div>
            <span>Točnost</span>
            <strong>{successRate(total.correct, total.incorrect)}%</strong>
          </div>

          <div>
            <span>Rekord</span>
            <strong>{total.bestStreak}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
