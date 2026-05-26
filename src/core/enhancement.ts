import {
  MAX_SWORD_LEVEL,
  SOUL_BURST_THRESHOLD,
  getEnhancementRow,
} from "./enhancementTable";
import type {
  EnhancementOutcome,
  EnhancementResult,
  EnhancementRow,
} from "./types";

export interface EnhancementOptions {
  useProtectionStone?: boolean;
  useBlessingStone?: boolean;
  successBonusRate?: number;
}

export function validateEnhancementTable(rows: EnhancementRow[]): boolean {
  return rows.every((row) => {
    const total = row.successRate + row.keepRate + row.downRate + row.destroyRate;
    return total === 100 && row.fromLevel + 1 === row.toLevel;
  });
}

export function applySoulBurst(row: EnhancementRow): EnhancementRow {
  const successRate = Math.min(100, row.successRate * 2);
  const remainingRate = 100 - successRate;
  const nonDestroyBase = row.keepRate + row.downRate;
  const keepRate =
    nonDestroyBase > 0 ? Math.round((row.keepRate / nonDestroyBase) * remainingRate) : 0;
  const downRate = remainingRate - keepRate;

  return {
    ...row,
    successRate,
    keepRate,
    downRate,
    destroyRate: 0,
    recommendedItem: "원혼 폭주",
  };
}

export function applyBlessingStone(row: EnhancementRow): EnhancementRow {
  const successRate = Math.min(100, row.successRate * 1.5);
  const remainingRate = 100 - successRate;
  const nonSuccessBase = row.keepRate + row.downRate + row.destroyRate;

  if (nonSuccessBase <= 0) {
    return {
      ...row,
      successRate: 100,
      keepRate: 0,
      downRate: 0,
      destroyRate: 0,
      recommendedItem: "축복석",
    };
  }

  return {
    ...row,
    successRate,
    keepRate: (row.keepRate / nonSuccessBase) * remainingRate,
    downRate: (row.downRate / nonSuccessBase) * remainingRate,
    destroyRate: (row.destroyRate / nonSuccessBase) * remainingRate,
    recommendedItem: row.recommendedItem === "원혼 폭주" ? "원혼 폭주+축복석" : "축복석",
  };
}

export function applySuccessBonus(row: EnhancementRow, successBonusRate: number): EnhancementRow {
  const bonus = Math.max(0, successBonusRate);
  if (bonus <= 0) return row;

  const successRate = Math.min(100, row.successRate + bonus);
  const remainingRate = 100 - successRate;
  const nonSuccessBase = row.keepRate + row.downRate + row.destroyRate;

  if (nonSuccessBase <= 0) {
    return {
      ...row,
      successRate: 100,
      keepRate: 0,
      downRate: 0,
      destroyRate: 0,
    };
  }

  return {
    ...row,
    successRate,
    keepRate: (row.keepRate / nonSuccessBase) * remainingRate,
    downRate: (row.downRate / nonSuccessBase) * remainingRate,
    destroyRate: (row.destroyRate / nonSuccessBase) * remainingRate,
  };
}

export function rollEnhancement(
  row: EnhancementRow,
  randomValue = Math.random(),
): EnhancementOutcome {
  const roll = Math.min(Math.max(randomValue, 0), 0.999999) * 100;
  let cursor = row.successRate;

  if (roll < cursor) return "success";
  cursor += row.keepRate;
  if (roll < cursor) return "keep";
  cursor += row.downRate;
  if (roll < cursor) return "down";

  return "destroyed";
}

export function getNextSwordLevel(
  currentLevel: number,
  outcome: EnhancementOutcome,
): number {
  if (outcome === "success") return Math.min(currentLevel + 1, MAX_SWORD_LEVEL);
  if (outcome === "down") return Math.max(currentLevel - 1, 1);
  if (outcome === "destroyed") return 1;

  return currentLevel;
}

export function calculateEnhancementResult(
  currentLevel: number,
  soulMileage: number,
  randomValue = Math.random(),
  options: EnhancementOptions = {},
): EnhancementResult | undefined {
  const baseRow = getEnhancementRow(currentLevel);
  if (!baseRow) return undefined;

  const soulBurstUsed = soulMileage >= SOUL_BURST_THRESHOLD;
  const blessingStoneUsed = Boolean(options.useBlessingStone);
  const successBonusRate = Math.max(0, options.successBonusRate ?? 0);
  const rowAfterSoul = soulBurstUsed ? applySoulBurst(baseRow) : baseRow;
  const rowAfterBlessing = blessingStoneUsed ? applyBlessingStone(rowAfterSoul) : rowAfterSoul;
  const row = applySuccessBonus(rowAfterBlessing, successBonusRate);
  const rolledOutcome = rollEnhancement(row, randomValue);
  const protectionStoneUsed =
    rolledOutcome === "destroyed" && Boolean(options.useProtectionStone);
  const outcome = protectionStoneUsed ? "protected" : rolledOutcome;
  const nextLevel = getNextSwordLevel(currentLevel, outcome);
  const destroyed = outcome === "destroyed";

  return {
    outcome,
    nextLevel,
    spentGold: row.cost,
    gainedStones: destroyed ? baseRow.salvageStones : 0,
    gainedSoulMileage: destroyed ? baseRow.destroyMileage : 0,
    soulBurstUsed,
    protectionStoneUsed,
    blessingStoneUsed,
    successBonusRate,
    row,
  };
}
