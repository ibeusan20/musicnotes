import { describe, expect, it } from "vitest";

import {
  emptySession,
  emptyTotal,
  recordResult,
  successRate,
} from "../src/domain/statistics";

describe("Statistika", () => {
  it("započinje s nulama", () => {
    expect(emptySession()).toEqual({
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
    });

    expect(emptyTotal()).toEqual({
      correct: 0,
      incorrect: 0,
      bestStreak: 0,
    });
  });

  it("točan odgovor povećava streak", () => {
    const result = recordResult(emptySession(), emptyTotal(), true);
    expect(result.session.correct).toBe(1);
    expect(result.session.streak).toBe(1);
    expect(result.total.correct).toBe(1);
  });

  it("pogreška prekida niz, ali čuva rekord", () => {
    const first = recordResult(emptySession(), emptyTotal(), true);
    const second = recordResult(first.session, first.total, true);
    const third = recordResult(second.session, second.total, false);
    expect(third.session.streak).toBe(0);
    expect(third.session.bestStreak).toBe(2);
    expect(third.total.bestStreak).toBe(2);
    expect(third.session.incorrect).toBe(1);
  });

  it("računa postotak bez dijeljenja nulom", () => {
    expect(successRate(0, 0)).toBe(0);
    expect(successRate(3, 1)).toBe(75);
    expect(successRate(1, 2)).toBe(33);
  });
});
