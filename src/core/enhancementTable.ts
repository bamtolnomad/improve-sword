import type { EnhancementRow } from "./types";

export const MAX_SWORD_LEVEL = 30;
export const SOUL_BURST_THRESHOLD = 40;

export const enhancementTable: EnhancementRow[] = [
  { fromLevel: 1, toLevel: 2, successRate: 100, keepRate: 0, downRate: 0, destroyRate: 0, cost: 100, sellPrice: 50, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 2, toLevel: 3, successRate: 95, keepRate: 5, downRate: 0, destroyRate: 0, cost: 150, sellPrice: 120, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 3, toLevel: 4, successRate: 90, keepRate: 10, downRate: 0, destroyRate: 0, cost: 250, sellPrice: 240, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 4, toLevel: 5, successRate: 85, keepRate: 15, downRate: 0, destroyRate: 0, cost: 400, sellPrice: 450, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 5, toLevel: 6, successRate: 80, keepRate: 20, downRate: 0, destroyRate: 0, cost: 600, sellPrice: 750, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 6, toLevel: 7, successRate: 80, keepRate: 20, downRate: 0, destroyRate: 0, cost: 900, sellPrice: 1200, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 7, toLevel: 8, successRate: 75, keepRate: 25, downRate: 0, destroyRate: 0, cost: 1300, sellPrice: 2200, salvageStones: 1, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 8, toLevel: 9, successRate: 75, keepRate: 25, downRate: 0, destroyRate: 0, cost: 1800, sellPrice: 3600, salvageStones: 2, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 9, toLevel: 10, successRate: 70, keepRate: 30, downRate: 0, destroyRate: 0, cost: 2500, sellPrice: 5600, salvageStones: 3, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 10, toLevel: 11, successRate: 65, keepRate: 30, downRate: 5, destroyRate: 0, cost: 3500, sellPrice: 8500, salvageStones: 4, destroyMileage: 0, recommendedItem: "분해/판매" },
  { fromLevel: 11, toLevel: 12, successRate: 60, keepRate: 30, downRate: 10, destroyRate: 0, cost: 5000, sellPrice: 12500, salvageStones: 5, destroyMileage: 0, recommendedItem: "분해/판매" },
  { fromLevel: 12, toLevel: 13, successRate: 55, keepRate: 30, downRate: 15, destroyRate: 0, cost: 7000, sellPrice: 18500, salvageStones: 7, destroyMileage: 0, recommendedItem: "분해/판매" },
  { fromLevel: 13, toLevel: 14, successRate: 50, keepRate: 30, downRate: 20, destroyRate: 0, cost: 10000, sellPrice: 27000, salvageStones: 9, destroyMileage: 0, recommendedItem: "분해/판매" },
  { fromLevel: 14, toLevel: 15, successRate: 45, keepRate: 30, downRate: 25, destroyRate: 0, cost: 15000, sellPrice: 39000, salvageStones: 12, destroyMileage: 0, recommendedItem: "분해/판매" },
  { fromLevel: 15, toLevel: 16, successRate: 45, keepRate: 30, downRate: 20, destroyRate: 5, cost: 18000, sellPrice: 56000, salvageStones: 16, destroyMileage: 10, recommendedItem: "보호석" },
  { fromLevel: 16, toLevel: 17, successRate: 42, keepRate: 28, downRate: 25, destroyRate: 5, cost: 26000, sellPrice: 78000, salvageStones: 22, destroyMileage: 10, recommendedItem: "수호석" },
  { fromLevel: 17, toLevel: 18, successRate: 38, keepRate: 27, downRate: 27, destroyRate: 8, cost: 36000, sellPrice: 108000, salvageStones: 30, destroyMileage: 15, recommendedItem: "수호석" },
  { fromLevel: 18, toLevel: 19, successRate: 35, keepRate: 25, downRate: 30, destroyRate: 10, cost: 52000, sellPrice: 150000, salvageStones: 40, destroyMileage: 15, recommendedItem: "수호석" },
  { fromLevel: 19, toLevel: 20, successRate: 32, keepRate: 25, downRate: 30, destroyRate: 13, cost: 72000, sellPrice: 210000, salvageStones: 55, destroyMileage: 20, recommendedItem: "수호석" },
  { fromLevel: 20, toLevel: 21, successRate: 30, keepRate: 23, downRate: 32, destroyRate: 15, cost: 105000, sellPrice: 290000, salvageStones: 70, destroyMileage: 20, recommendedItem: "수호석" },
  { fromLevel: 21, toLevel: 22, successRate: 25, keepRate: 23, downRate: 34, destroyRate: 18, cost: 150000, sellPrice: 410000, salvageStones: 95, destroyMileage: 25, recommendedItem: "수호석" },
  { fromLevel: 22, toLevel: 23, successRate: 24, keepRate: 22, downRate: 34, destroyRate: 20, cost: 215000, sellPrice: 580000, salvageStones: 120, destroyMileage: 25, recommendedItem: "수호석" },
  { fromLevel: 23, toLevel: 24, successRate: 15, keepRate: 20, downRate: 40, destroyRate: 25, cost: 350000, sellPrice: 670000, salvageStones: 100, destroyMileage: 25, recommendedItem: "수호석+축복석" },
  { fromLevel: 24, toLevel: 25, successRate: 15, keepRate: 20, downRate: 40, destroyRate: 25, cost: 500000, sellPrice: 950000, salvageStones: 130, destroyMileage: 25, recommendedItem: "수호석+축복석" },
  { fromLevel: 25, toLevel: 26, successRate: 10, keepRate: 15, downRate: 45, destroyRate: 30, cost: 750000, sellPrice: 1350000, salvageStones: 170, destroyMileage: 30, recommendedItem: "수호석+축복석" },
  { fromLevel: 26, toLevel: 27, successRate: 10, keepRate: 15, downRate: 45, destroyRate: 30, cost: 1100000, sellPrice: 1950000, salvageStones: 220, destroyMileage: 30, recommendedItem: "수호석+축복석" },
  { fromLevel: 27, toLevel: 28, successRate: 5, keepRate: 15, downRate: 45, destroyRate: 35, cost: 1600000, sellPrice: 2800000, salvageStones: 300, destroyMileage: 35, recommendedItem: "풀도핑" },
  { fromLevel: 28, toLevel: 29, successRate: 5, keepRate: 10, downRate: 45, destroyRate: 40, cost: 2400000, sellPrice: 4100000, salvageStones: 400, destroyMileage: 40, recommendedItem: "풀도핑" },
  { fromLevel: 29, toLevel: 30, successRate: 3, keepRate: 5, downRate: 42, destroyRate: 50, cost: 3500000, sellPrice: 6000000, salvageStones: 550, destroyMileage: 50, recommendedItem: "풀도핑" },
];

export function getEnhancementRow(level: number): EnhancementRow | undefined {
  return enhancementTable.find((row) => row.fromLevel === level);
}

export function getTotalEnhancementCostToLevel(level: number): number {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);

  return enhancementTable
    .filter((row) => row.fromLevel < safeLevel)
    .reduce((sum, row) => sum + row.cost, 0);
}

export type SellStrategyBand = "locked" | "loss" | "recover" | "profit";

export interface SellStrategy {
  band: SellStrategyBand;
  label: string;
  multiplier: number;
}

export function getSellValueMultiplierForLevel(level: number): number {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);

  if (safeLevel <= 1) return 0;
  if (safeLevel <= 5) return 0.45;
  if (safeLevel <= 10) return 0.8 + (safeLevel - 6) * 0.05;

  return 1.5 + (safeLevel - 11) * 0.14;
}

export function getSellStrategyForLevel(level: number): SellStrategy {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);
  const multiplier = getSellValueMultiplierForLevel(safeLevel);

  if (safeLevel <= 1) {
    return { band: "locked", label: "대기", multiplier };
  }

  if (safeLevel <= 5) {
    return { band: "loss", label: "손해", multiplier };
  }

  if (safeLevel <= 10) {
    return { band: "recover", label: "회수", multiplier };
  }

  return { band: "profit", label: "대박", multiplier };
}

function roundSellPrice(value: number): number {
  if (value <= 0) return 0;
  if (value < 10_000) return Math.ceil(value / 10) * 10;
  if (value < 100_000) return Math.ceil(value / 100) * 100;

  return Math.ceil(value / 1000) * 1000;
}

export function getSellPriceForLevel(level: number): number {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);
  const investedGold = getTotalEnhancementCostToLevel(safeLevel);

  return roundSellPrice(investedGold * getSellValueMultiplierForLevel(safeLevel));
}

export function getSwordImagePath(level: number): string {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);
  const stage = String(safeLevel).padStart(2, "0");
  return `/assets/swords-transparent/sword_stage_${stage}.png`;
}
