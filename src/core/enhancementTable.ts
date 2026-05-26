import type { EnhancementRow } from "./types";

export const MAX_SWORD_LEVEL = 30;
export const SOUL_BURST_THRESHOLD = 100;

export const enhancementTable: EnhancementRow[] = [
  { fromLevel: 1, toLevel: 2, successRate: 100, keepRate: 0, downRate: 0, destroyRate: 0, cost: 100, sellPrice: 50, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 2, toLevel: 3, successRate: 95, keepRate: 5, downRate: 0, destroyRate: 0, cost: 150, sellPrice: 120, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 3, toLevel: 4, successRate: 90, keepRate: 10, downRate: 0, destroyRate: 0, cost: 250, sellPrice: 240, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 4, toLevel: 5, successRate: 85, keepRate: 15, downRate: 0, destroyRate: 0, cost: 400, sellPrice: 450, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 5, toLevel: 6, successRate: 80, keepRate: 20, downRate: 0, destroyRate: 0, cost: 600, sellPrice: 750, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 6, toLevel: 7, successRate: 80, keepRate: 20, downRate: 0, destroyRate: 0, cost: 900, sellPrice: 1200, salvageStones: 0, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 7, toLevel: 8, successRate: 75, keepRate: 25, downRate: 0, destroyRate: 0, cost: 1300, sellPrice: 1900, salvageStones: 1, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 8, toLevel: 9, successRate: 75, keepRate: 25, downRate: 0, destroyRate: 0, cost: 1800, sellPrice: 2900, salvageStones: 1, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 9, toLevel: 10, successRate: 70, keepRate: 30, downRate: 0, destroyRate: 0, cost: 2500, sellPrice: 4300, salvageStones: 2, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 10, toLevel: 11, successRate: 65, keepRate: 30, downRate: 5, destroyRate: 0, cost: 3500, sellPrice: 6300, salvageStones: 3, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 11, toLevel: 12, successRate: 60, keepRate: 30, downRate: 10, destroyRate: 0, cost: 5000, sellPrice: 9100, salvageStones: 3, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 12, toLevel: 13, successRate: 55, keepRate: 30, downRate: 15, destroyRate: 0, cost: 7000, sellPrice: 13000, salvageStones: 4, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 13, toLevel: 14, successRate: 50, keepRate: 30, downRate: 20, destroyRate: 0, cost: 10000, sellPrice: 18000, salvageStones: 5, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 14, toLevel: 15, successRate: 45, keepRate: 30, downRate: 25, destroyRate: 0, cost: 15000, sellPrice: 25000, salvageStones: 7, destroyMileage: 0, recommendedItem: "없음" },
  { fromLevel: 15, toLevel: 16, successRate: 40, keepRate: 30, downRate: 25, destroyRate: 5, cost: 22000, sellPrice: 35000, salvageStones: 10, destroyMileage: 5, recommendedItem: "보호석" },
  { fromLevel: 16, toLevel: 17, successRate: 35, keepRate: 30, downRate: 30, destroyRate: 5, cost: 32000, sellPrice: 50000, salvageStones: 15, destroyMileage: 5, recommendedItem: "보호석" },
  { fromLevel: 17, toLevel: 18, successRate: 30, keepRate: 30, downRate: 30, destroyRate: 10, cost: 45000, sellPrice: 75000, salvageStones: 20, destroyMileage: 10, recommendedItem: "보호석" },
  { fromLevel: 18, toLevel: 19, successRate: 30, keepRate: 25, downRate: 35, destroyRate: 10, cost: 65000, sellPrice: 110000, salvageStones: 25, destroyMileage: 10, recommendedItem: "보호석" },
  { fromLevel: 19, toLevel: 20, successRate: 25, keepRate: 25, downRate: 35, destroyRate: 15, cost: 90000, sellPrice: 160000, salvageStones: 35, destroyMileage: 15, recommendedItem: "보호석" },
  { fromLevel: 20, toLevel: 21, successRate: 25, keepRate: 25, downRate: 35, destroyRate: 15, cost: 130000, sellPrice: 230000, salvageStones: 45, destroyMileage: 15, recommendedItem: "보호석" },
  { fromLevel: 21, toLevel: 22, successRate: 20, keepRate: 20, downRate: 40, destroyRate: 20, cost: 180000, sellPrice: 330000, salvageStones: 60, destroyMileage: 20, recommendedItem: "보호석" },
  { fromLevel: 22, toLevel: 23, successRate: 20, keepRate: 20, downRate: 40, destroyRate: 20, cost: 250000, sellPrice: 470000, salvageStones: 80, destroyMileage: 20, recommendedItem: "보호석" },
  { fromLevel: 23, toLevel: 24, successRate: 15, keepRate: 20, downRate: 40, destroyRate: 25, cost: 350000, sellPrice: 670000, salvageStones: 100, destroyMileage: 25, recommendedItem: "보호석+축복석" },
  { fromLevel: 24, toLevel: 25, successRate: 15, keepRate: 20, downRate: 40, destroyRate: 25, cost: 500000, sellPrice: 950000, salvageStones: 130, destroyMileage: 25, recommendedItem: "보호석+축복석" },
  { fromLevel: 25, toLevel: 26, successRate: 10, keepRate: 15, downRate: 45, destroyRate: 30, cost: 750000, sellPrice: 1350000, salvageStones: 170, destroyMileage: 30, recommendedItem: "보호석+축복석" },
  { fromLevel: 26, toLevel: 27, successRate: 10, keepRate: 15, downRate: 45, destroyRate: 30, cost: 1100000, sellPrice: 1950000, salvageStones: 220, destroyMileage: 30, recommendedItem: "보호석+축복석" },
  { fromLevel: 27, toLevel: 28, successRate: 5, keepRate: 15, downRate: 45, destroyRate: 35, cost: 1600000, sellPrice: 2800000, salvageStones: 300, destroyMileage: 35, recommendedItem: "풀도핑" },
  { fromLevel: 28, toLevel: 29, successRate: 5, keepRate: 10, downRate: 45, destroyRate: 40, cost: 2400000, sellPrice: 4100000, salvageStones: 400, destroyMileage: 40, recommendedItem: "풀도핑" },
  { fromLevel: 29, toLevel: 30, successRate: 3, keepRate: 5, downRate: 42, destroyRate: 50, cost: 3500000, sellPrice: 6000000, salvageStones: 550, destroyMileage: 50, recommendedItem: "풀도핑" },
];

export function getEnhancementRow(level: number): EnhancementRow | undefined {
  return enhancementTable.find((row) => row.fromLevel === level);
}

export function getSellPriceForLevel(level: number): number {
  if (level >= MAX_SWORD_LEVEL) {
    return enhancementTable[enhancementTable.length - 1].sellPrice;
  }

  return getEnhancementRow(level)?.sellPrice ?? 0;
}

export function getSwordImagePath(level: number): string {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);
  const stage = String(safeLevel).padStart(2, "0");
  return `/assets/swords/sword_stage_${stage}.png`;
}
