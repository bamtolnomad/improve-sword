import { describe, expect, it } from "vitest";
import { attemptsToCsv } from "./exportCsv";
import { runBalanceSimulation } from "./simulator";
import type { EnhancementAttemptRecord } from "./types";

describe("balance simulator", () => {
  it("returns deterministic reports for a seed", () => {
    const options = {
      runs: 20,
      initialGold: 100_000,
      targetLevel: 20,
      maxAttemptsPerRun: 500,
      seed: 42,
    };
    const first = runBalanceSimulation(options);
    const second = runBalanceSimulation(options);

    expect(first.averageBestLevel).toBe(second.averageBestLevel);
    expect(first.targetReachRate).toBe(second.targetReachRate);
    expect(first.outcomeRates.success).toBe(second.outcomeRates.success);
  });

  it("can simulate a cashout strategy", () => {
    const report = runBalanceSimulation({
      runs: 10,
      initialGold: 50_000,
      targetLevel: 30,
      cashoutLevel: 10,
      maxAttemptsPerRun: 200,
      seed: 7,
    });

    expect(report.runs.some((run) => run.cashoutCount > 0)).toBe(true);
  });

  it("tracks protection and blessing strategies", () => {
    const report = runBalanceSimulation({
      runs: 20,
      initialGold: 2_000_000,
      targetLevel: 25,
      protectionFromLevel: 15,
      blessingFromLevel: 20,
      maxAttemptsPerRun: 1000,
      seed: 99,
    });

    expect(report.averageProtectedCount).toBeGreaterThanOrEqual(0);
    expect(report.averageBlessingUsedCount).toBeGreaterThan(0);
    expect(report.outcomeRates.protected).toBeGreaterThanOrEqual(0);
  });

  it("tracks safeguard strategies separately from basic protection", () => {
    const report = runBalanceSimulation({
      runs: 20,
      initialGold: 2_000_000,
      targetLevel: 25,
      protectionFromLevel: 15,
      safeguardFromLevel: 16,
      maxAttemptsPerRun: 1000,
      seed: 100,
    });

    expect(report.averageSafeguardUsedCount).toBeGreaterThanOrEqual(0);
    expect(report.options.safeguardFromLevel).toBe(16);
  });


  it("ignores a cashout level that would create a sell-only loop", () => {
    const report = runBalanceSimulation({
      runs: 1,
      initialGold: 1000,
      targetLevel: 3,
      cashoutLevel: 1,
      maxAttemptsPerRun: 10,
      seed: 1,
    });

    expect(report.options.cashoutLevel).toBeUndefined();
    expect(report.runs[0].attempts).toBeGreaterThan(0);
  });
});

describe("attempt CSV export", () => {
  it("serializes structured attempt records", () => {
    const record: EnhancementAttemptRecord = {
      attempt: 1,
      timestamp: "2026-05-26T00:00:00.000Z",
      fromLevel: 1,
      targetLevel: 2,
      outcome: "success",
      nextLevel: 2,
      cost: 100,
      goldBefore: 5000,
      goldAfter: 4900,
      sellPriceBefore: 50,
      stonesAfter: 0,
      soulMileageBefore: 0,
      soulMileageAfter: 0,
      soulBurstUsed: false,
      protectionStoneUsed: false,
      safeguardStoneUsed: false,
      blessingStoneUsed: false,
      rebirthCount: 0,
      successBonusRate: 0,
    };
    const csv = attemptsToCsv([record]);

    expect(csv).toContain("attempt,timestamp,fromLevel");
    expect(csv).toContain("1,2026-05-26T00:00:00.000Z,1,2,success,2");
  });
});
