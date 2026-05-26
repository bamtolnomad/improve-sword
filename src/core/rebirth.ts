import { MAX_SWORD_LEVEL } from "./enhancementTable";

export const REBIRTH_SUCCESS_BONUS_PER_COUNT = 0.5;
export const REBIRTH_GPS_BONUS_PER_COUNT = 0.5;

export function canRebirth(bestLevel: number): boolean {
  return Number.isFinite(bestLevel) && bestLevel >= MAX_SWORD_LEVEL;
}

export function getRebirthSuccessBonus(rebirthCount: number): number {
  const count = Number.isFinite(rebirthCount) ? Math.max(0, Math.trunc(rebirthCount)) : 0;
  return count * REBIRTH_SUCCESS_BONUS_PER_COUNT;
}

export function getRebirthGpsMultiplier(rebirthCount: number): number {
  const count = Number.isFinite(rebirthCount) ? Math.max(0, Math.trunc(rebirthCount)) : 0;
  return 1 + count * REBIRTH_GPS_BONUS_PER_COUNT;
}

export function addDiscoveredLevel(discoveredLevels: number[], level: number): number[] {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);
  return Array.from(new Set([...discoveredLevels, safeLevel])).sort((a, b) => a - b);
}

export function getCollectionProgress(discoveredLevels: number[]): number {
  return Math.min(new Set(discoveredLevels).size, MAX_SWORD_LEVEL);
}
