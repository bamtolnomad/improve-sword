import { MAX_SWORD_LEVEL, getEnhancementRow } from "./enhancementTable";
import { getRebirthGpsMultiplier } from "./rebirth";
import type { StoredSword } from "./types";

export const BASE_GPS = 3;
export const OFFLINE_REWARD_CAP_SECONDS = 60 * 60 * 12;
export const PROTECTION_STONE_COST = 15;
export const BLESSING_STONE_COST = 25;

export function getSalvageStonesForLevel(level: number): number {
  if (level >= MAX_SWORD_LEVEL) {
    return getEnhancementRow(MAX_SWORD_LEVEL - 1)?.salvageStones ?? 0;
  }

  return getEnhancementRow(level)?.salvageStones ?? 0;
}

export function getStoredSwordGpsBonus(level: number): number {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);

  if (safeLevel < 5) return 0;
  if (safeLevel < 10) return safeLevel * 0.4;
  if (safeLevel < 15) return safeLevel * 0.75;
  if (safeLevel < 20) return safeLevel * 1.2;
  if (safeLevel < 25) return safeLevel * 1.8;

  return safeLevel * 2.6;
}

export function getCollectionBonus(storedSwords: StoredSword[]): number {
  const uniqueLevels = new Set(storedSwords.map((sword) => sword.level));
  return uniqueLevels.size * 0.5;
}

export function getStoredSwordBonus(storedSwords: StoredSword[]): number {
  return storedSwords.reduce((sum, sword) => sum + sword.gpsBonus, 0);
}

export function calculateGps(storedSwords: StoredSword[], rebirthCount = 0): number {
  const baseGps = BASE_GPS + getCollectionBonus(storedSwords) + getStoredSwordBonus(storedSwords);
  return baseGps * getRebirthGpsMultiplier(rebirthCount);
}

export function calculateOfflineReward(
  gps: number,
  lastRewardAt: string,
  now = new Date(),
): { seconds: number; cappedSeconds: number; gold: number } {
  const lastRewardTime = new Date(lastRewardAt).getTime();
  const elapsedSeconds = Number.isFinite(lastRewardTime)
    ? Math.max(0, Math.floor((now.getTime() - lastRewardTime) / 1000))
    : 0;
  const cappedSeconds = Math.min(elapsedSeconds, OFFLINE_REWARD_CAP_SECONDS);

  return {
    seconds: elapsedSeconds,
    cappedSeconds,
    gold: Math.floor(gps * cappedSeconds),
  };
}
