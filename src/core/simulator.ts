import { calculateEnhancementResult } from "./enhancement";
import {
  MAX_SWORD_LEVEL,
  SOUL_BURST_THRESHOLD,
  getEnhancementRow,
  getSellPriceForLevel,
} from "./enhancementTable";
import { createSeededRandom } from "./random";
import { getUnclaimedMilestoneRewards, sumMilestoneRewards } from "./milestones";
import { ENHANCEMENT_OUTCOMES, type EnhancementOutcome } from "./types";

export interface BalanceSimulationOptions {
  runs: number;
  initialGold: number;
  targetLevel: number;
  maxAttemptsPerRun: number;
  cashoutLevel?: number;
  protectionFromLevel?: number;
  safeguardFromLevel?: number;
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
  safeguardFromLevel?: number;
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
  safeguardUsedCount: number;
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
  averageSafeguardUsedCount: number;
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
  return Object.fromEntries(ENHANCEMENT_OUTCOMES.map((outcome) => [outcome, 0])) as Record<
    EnhancementOutcome,
    number
  >;
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
  let safeguardUsedCount = 0;
  let blessingUsedCount = 0;
  let cashoutCount = 0;
  let claimedMilestones: string[] = [];
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
      useSafeguardStone:
        options.safeguardFromLevel !== undefined && level >= options.safeguardFromLevel,
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
    const newMilestones = getUnclaimedMilestoneRewards(bestLevel, claimedMilestones);
    const milestoneReward = sumMilestoneRewards(newMilestones);
    gold += milestoneReward.gold;
    claimedMilestones = [
      ...claimedMilestones,
      ...newMilestones.map((milestone) => milestone.id),
    ];
    outcomeCounts[result.outcome] += 1;

    if (result.outcome === "destroyed") {
      destroyedCount += 1;
    }

    if (result.outcome === "protected") {
      protectedCount += 1;
    }

    if (result.safeguardStoneUsed) {
      safeguardUsedCount += 1;
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
    safeguardUsedCount,
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
    safeguardFromLevel: normalizeStrategyLevel(options.safeguardFromLevel),
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
      acc.safeguardUsedCount += run.safeguardUsedCount;
      acc.blessingUsedCount += run.blessingUsedCount;
      acc.reachedTarget += run.reachedTarget ? 1 : 0;
      acc.level10 += run.bestLevel >= 10 ? 1 : 0;
      acc.level15 += run.bestLevel >= 15 ? 1 : 0;
      acc.level20 += run.bestLevel >= 20 ? 1 : 0;
      acc.level25 += run.bestLevel >= 25 ? 1 : 0;
      acc.level30 += run.bestLevel >= 30 ? 1 : 0;
      for (const outcome of ENHANCEMENT_OUTCOMES) {
        acc.outcomes[outcome] += run.outcomeCounts[outcome];
      }
      return acc;
    },
    {
      attempts: 0,
      bestLevel: 0,
      endingGold: 0,
      destroyedCount: 0,
      protectedCount: 0,
      safeguardUsedCount: 0,
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
  const totalOutcomes = ENHANCEMENT_OUTCOMES.reduce(
    (sum, outcome) => sum + totals.outcomes[outcome],
    0,
  );
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
    averageSafeguardUsedCount: totals.safeguardUsedCount / normalizedOptions.runs,
    averageBlessingUsedCount: totals.blessingUsedCount / normalizedOptions.runs,
    targetReachRate: runRate(totals.reachedTarget),
    levelReachRates: {
      "10": runRate(totals.level10),
      "15": runRate(totals.level15),
      "20": runRate(totals.level20),
      "25": runRate(totals.level25),
      "30": runRate(totals.level30),
    },
    outcomeRates: Object.fromEntries(
      ENHANCEMENT_OUTCOMES.map((outcome) => [outcome, rate(totals.outcomes[outcome])]),
    ) as Record<EnhancementOutcome, number>,
  };
}
