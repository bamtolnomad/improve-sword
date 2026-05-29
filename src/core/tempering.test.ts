import { describe, expect, it } from "vitest";
import {
  TEMPERING_DAILY_FREE_ATTEMPTS,
  applyTemperingExp,
  consumeTemperingBuffs,
  getActiveTemperingBonus,
  getTemperingExpReward,
  getTemperingGrade,
  getTemperingMasteryBonus,
  getTemperingTotalScore,
  resolveTemperingAttempt,
} from "./tempering";

describe("tempering core", () => {
  it("grades strong tempering runs as master", () => {
    const totalScore = getTemperingTotalScore({
      heatScore: 98,
      hammerScore: 95,
      quenchScore: 96,
      polishScore: 94,
    });

    expect(totalScore).toBeGreaterThanOrEqual(94);
    expect(getTemperingGrade(totalScore)).toBe("master");
  });

  it("penalizes weak stages with cracked results", () => {
    const totalScore = getTemperingTotalScore({
      heatScore: 25,
      hammerScore: 42,
      quenchScore: 35,
      polishScore: 45,
    });

    expect(getTemperingGrade(totalScore)).toBe("cracked");
  });

  it("creates a buff and rewards from a high grade attempt", () => {
    const result = resolveTemperingAttempt(
      {
        heatScore: 92,
        hammerScore: 88,
        quenchScore: 90,
        polishScore: 84,
      },
      1,
      0,
      0,
    );

    expect(result.record.grade).toBe("S");
    expect(result.record.buff?.successBonusRate).toBeGreaterThan(0);
    expect(result.record.shardsGained).toBeGreaterThan(0);
  });

  it("levels mastery from accumulated exp", () => {
    const result = applyTemperingExp(1, 0, 1000);

    expect(result.level).toBeGreaterThan(1);
    expect(result.exp).toBeGreaterThanOrEqual(0);
  });

  it("lets a strong daily run produce meaningful mastery progress", () => {
    const strongDailyExp = TEMPERING_DAILY_FREE_ATTEMPTS * getTemperingExpReward("master");
    const result = applyTemperingExp(10, 0, strongDailyExp);

    expect(TEMPERING_DAILY_FREE_ATTEMPTS).toBe(7);
    expect(result.level).toBeGreaterThanOrEqual(12);
    expect(result.level).toBeLessThanOrEqual(13);
  });

  it("scales mastery bonuses down at late sword levels", () => {
    const early = getTemperingMasteryBonus(30, 10);
    const late = getTemperingMasteryBonus(30, 27);

    expect(early.successBonusRate).toBe(3);
    expect(late.successBonusRate).toBe(1.5);
    expect(late.destroyRateReduction).toBe(1);
  });

  it("sums and consumes active tempering buffs", () => {
    const buffs = [
      {
        id: "a",
        label: "A",
        grade: "A" as const,
        successBonusRate: 1,
        downRateReduction: 2,
        destroyRateReduction: 1,
        remainingEnhanceAttempts: 2,
      },
      {
        id: "b",
        label: "B",
        grade: "B" as const,
        successBonusRate: 0.5,
        downRateReduction: 1,
        destroyRateReduction: 0,
        remainingEnhanceAttempts: 1,
      },
    ];

    expect(getActiveTemperingBonus(buffs).successBonusRate).toBe(1.5);
    expect(consumeTemperingBuffs(buffs)).toHaveLength(1);
  });
});
