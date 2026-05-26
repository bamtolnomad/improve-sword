import { calculateEnhancementResult } from "./enhancement";
import {
  MAX_SWORD_LEVEL,
  SOUL_BURST_THRESHOLD,
  getEnhancementRow,
  getSellPriceForLevel,
} from "./enhancementTable";
import { createSeededRandom } from "./random";
import type { EnhancementOutcome } from "./types";

export interface BalanceSimulationOptions {
  runs: number;
  initialGold: number;
  targetLevel: number;
  maxAttemptsPerRun: number;
  cashoutLevel?: number;
  protectionFromLevel?: number;
  blessingFromLevel?: number;
  seed?: number;
}

export interface NormalizedBalanceSimulationOptions {
  runs: number;
  initialGold: number;
  targetLevel: number;
  maxAttemptsPerRun: number;
  cashoutLevel?: number;
  protectionFromLevel?: number;
  blessingFromLevel?: number;
  seed: number;
}

export interface BalanceRunSummary {
  run: number;
  attempts: number;
  endingGold: number;
  endingLevel: number;
  bestLevel: number;
  destroyedCount: number;
  protectedCount: number;
  blessingUsedCount: number;
  cashoutCount: number;
  reachedTarget: boolean;
  outcomeCounts: Record<EnhancementOutcome, number>;
}

export interface BalanceSimulationReport {
  options: NormalizedBalanceSimulationOptions;
  runs: BalanceRunSummary[];
  averageAttempts: number;
  averageBestLevel: number;
  averageEndingGold: number;
  averageDestroyedCount: number;
  averageProtectedCount: number;
  averageBlessingUsedCount: number;
  targetReachRate: number;
  levelReachRates: Record<"10" | "15" | "20" | "25" | "30", number>;
  outcomeRates: Record<EnhancementOutcome, number>;
}

function clampLevel(level: number): number {
  return Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);
}

function normalizeCashoutLevel(level: number | undefined): number | undefined {
  if (level === undefined) return undefined;

  const clampedLevel = clampLevel(level);
  return clampedLevel > 1 ? clampedLevel : undefined;
}

function normalizeStrategyLevel(level: number | undefined): number | undefined {
  if (level === undefined) return undefined;
  return clampLevel(level);
}

function emptyOutcomeCounts(): Record<EnhancementOutcome, number> {
  return {
    success: 0,
    keep: 0,
    down: 0,
    destroyed: 0,
    protected: 0,
  };
}

export function simulateBalanceRun(
  run: number,
  options: Omit<NormalizedBalanceSimulationOptions, "runs" | "seed">,
  random: () => number,
): BalanceRunSummary {
  let gold = options.initialGold;
  let level = 1;
  let soulMileage = 0;
  let attempts = 0;
  let bestLevel = 1;
  let destroyedCount = 0;
  let protectedCount = 0;
  let blessingUsedCount = 0;
  let cashoutCount = 0;
  const outcomeCounts = emptyOutcomeCounts();

  while (attempts < options.maxAttemptsPerRun && level < options.targetLevel) {
    if (options.cashoutLevel && level >= options.cashoutLevel) {
      gold += getSellPriceForLevel(level);
      cashoutCount += 1;
      level = 1;
      continue;
    }

    const row = getEnhancementRow(level);
    if (!row || gold < row.cost) break;

    const result = calculateEnhancementResult(level, soulMileage, random(), {
      useProtectionStone:
        options.protectionFromLevel !== undefined && level >= options.protectionFromLevel,
      useBlessingStone:
        options.blessingFromLevel !== undefined && level >= options.blessingFromLevel,
    });
    if (!result) break;

    attempts += 1;
    gold -= result.spentGold;
    soulMileage = result.soulBurstUsed
      ? Math.max(0, soulMileage - SOUL_BURST_THRESHOLD) + result.gainedSoulMileage
      : soulMileage + result.gainedSoulMileage;
    level = result.nextLevel;
    bestLevel = Math.max(bestLevel, level);
    outcomeCounts[result.outcome] += 1;

    if (result.outcome === "destroyed") {
      destroyedCount += 1;
    }

    if (result.outcome === "protected") {
      protectedCount += 1;
    }

    if (result.blessingStoneUsed) {
      blessingUsedCount += 1;
    }
  }

  return {
    run,
    attempts,
    endingGold: gold,
    endingLevel: level,
    bestLevel,
    destroyedCount,
    protectedCount,
    blessingUsedCount,
    cashoutCount,
    reachedTarget: bestLevel >= options.targetLevel,
    outcomeCounts,
  };
}

export function runBalanceSimulation(
  options: BalanceSimulationOptions,
): BalanceSimulationReport {
  const normalizedOptions = {
    runs: Math.max(1, Math.trunc(options.runs)),
    initialGold: Math.max(0, Math.trunc(options.initialGold)),
    targetLevel: clampLevel(options.targetLevel),
    maxAttemptsPerRun: Math.max(1, Math.trunc(options.maxAttemptsPerRun)),
    cashoutLevel: normalizeCashoutLevel(options.cashoutLevel),
    protectionFromLevel: normalizeStrategyLevel(options.protectionFromLevel),
    blessingFromLevel: normalizeStrategyLevel(options.blessingFromLevel),
    seed: options.seed ?? 20260526,
  };
  const random = createSeededRandom(normalizedOptions.seed);
  const runs = Array.from({ length: normalizedOptions.runs }, (_, index) =>
    simulateBalanceRun(index + 1, normalizedOptions, random),
  );
  const totals = runs.reduce(
    (acc, run) => {
      acc.attempts += run.attempts;
      acc.bestLevel += run.bestLevel;
      acc.endingGold += run.endingGold;
      acc.destroyedCount += run.destroyedCount;
      acc.protectedCount += run.protectedCount;
      acc.blessingUsedCount += run.blessingUsedCount;
      acc.reachedTarget += run.reachedTarget ? 1 : 0;
      acc.level10 += run.bestLevel >= 10 ? 1 : 0;
      acc.level15 += run.bestLevel >= 15 ? 1 : 0;
      acc.level20 += run.bestLevel >= 20 ? 1 : 0;
      acc.level25 += run.bestLevel >= 25 ? 1 : 0;
      acc.level30 += run.bestLevel >= 30 ? 1 : 0;
      acc.outcomes.success += run.outcomeCounts.success;
      acc.outcomes.keep += run.outcomeCounts.keep;
      acc.outcomes.down += run.outcomeCounts.down;
      acc.outcomes.destroyed += run.outcomeCounts.destroyed;
      acc.outcomes.protected += run.outcomeCounts.protected;
      return acc;
    },
    {
      attempts: 0,
      bestLevel: 0,
      endingGold: 0,
      destroyedCount: 0,
      protectedCount: 0,
      blessingUsedCount: 0,
      reachedTarget: 0,
      level10: 0,
      level15: 0,
      level20: 0,
      level25: 0,
      level30: 0,
      outcomes: emptyOutcomeCounts(),
    },
  );
  const totalOutcomes =
    totals.outcomes.success +
    totals.outcomes.keep +
    totals.outcomes.down +
    totals.outcomes.destroyed +
    totals.outcomes.protected;
  const rate = (value: number) => (totalOutcomes > 0 ? value / totalOutcomes : 0);
  const runRate = (value: number) => value / normalizedOptions.runs;

  return {
    options: normalizedOptions,
    runs,
    averageAttempts: totals.attempts / normalizedOptions.runs,
    averageBestLevel: totals.bestLevel / normalizedOptions.runs,
    averageEndingGold: totals.endingGold / normalizedOptions.runs,
    averageDestroyedCount: totals.destroyedCount / normalizedOptions.runs,
    averageProtectedCount: totals.protectedCount / normalizedOptions.runs,
    averageBlessingUsedCount: totals.blessingUsedCount / normalizedOptions.runs,
    targetReachRate: runRate(totals.reachedTarget),
    levelReachRates: {
      "10": runRate(totals.level10),
      "15": runRate(totals.level15),
      "20": runRate(totals.level20),
      "25": runRate(totals.level25),
      "30": runRate(totals.level30),
    },
    outcomeRates: {
      success: rate(totals.outcomes.success),
      keep: rate(totals.outcomes.keep),
      down: rate(totals.outcomes.down),
      destroyed: rate(totals.outcomes.destroyed),
      protected: rate(totals.outcomes.protected),
    },
  };
}
