export interface SessionStats {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
}

export interface TotalStats {
  correct: number;
  incorrect: number;
  bestStreak: number;
}

export const emptySession = (): SessionStats => ({
  correct: 0,
  incorrect: 0,
  streak: 0,
  bestStreak: 0,
});

export const emptyTotal = (): TotalStats => ({
  correct: 0,
  incorrect: 0,
  bestStreak: 0,
});

export function recordResult(
  session: SessionStats,
  total: TotalStats,
  correct: boolean,
): {
  session: SessionStats;
  total: TotalStats;
} {
  const streak = correct ? session.streak + 1 : 0;
  const bestStreak = Math.max(session.bestStreak, streak);

  return {
    session: {
      correct: session.correct + Number(correct),
      incorrect: session.incorrect + Number(!correct),
      streak,
      bestStreak,
    },

    total: {
      correct: total.correct + Number(correct),
      incorrect: total.incorrect + Number(!correct),
      bestStreak: Math.max(total.bestStreak, streak),
    },
  };
}

export function successRate(correct: number, incorrect: number): number {
  const count = correct + incorrect;

  if (count === 0) return 0;

  return Math.round((correct / count) * 100);
}
