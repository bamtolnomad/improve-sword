import type { EnhancementOutcome, TemperingGrade } from "./types";

export const BLACKSMITH_MAX_LEVEL = 30;

const ENHANCEMENT_XP_MULTIPLIER: Record<EnhancementOutcome, number> = {
  great_success: 1.8,
  success: 1.4,
  keep: 0.8,
  down: 1,
  destroyed: 1.15,
  great_failure: 1.25,
  protected: 1,
};

const TEMPERING_BLACKSMITH_XP: Record<TemperingGrade, number> = {
  cracked: 8,
  C: 12,
  B: 18,
  A: 28,
  S: 40,
  master: 55,
};

export function getBlacksmithExpToNext(level: number): number {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), BLACKSMITH_MAX_LEVEL);
  return Math.round(80 + safeLevel * 42 + Math.pow(safeLevel, 1.28) * 18);
}

export function applyBlacksmithExp(
  level: number,
  exp: number,
  gainedExp: number,
): { level: number; exp: number } {
  let nextLevel = Math.min(Math.max(Math.trunc(level), 1), BLACKSMITH_MAX_LEVEL);
  let nextExp = Math.max(0, Math.trunc(exp + gainedExp));

  while (nextLevel < BLACKSMITH_MAX_LEVEL) {
    const required = getBlacksmithExpToNext(nextLevel);
    if (nextExp < required) break;
    nextExp -= required;
    nextLevel += 1;
  }

  if (nextLevel >= BLACKSMITH_MAX_LEVEL) {
    nextExp = Math.min(nextExp, getBlacksmithExpToNext(BLACKSMITH_MAX_LEVEL));
  }

  return { level: nextLevel, exp: nextExp };
}

export function getEnhancementBlacksmithExp(
  swordLevel: number,
  outcome: EnhancementOutcome,
  blacksmithLevel: number,
): number {
  const safeSwordLevel = Math.min(Math.max(Math.trunc(swordLevel), 1), 30);
  const safeBlacksmithLevel = Math.min(
    Math.max(Math.trunc(blacksmithLevel), 1),
    BLACKSMITH_MAX_LEVEL,
  );
  const baseExp = Math.max(2, safeSwordLevel * 2);
  const lowLevelPenalty = safeSwordLevel <= safeBlacksmithLevel / 3 ? 0.25 : 1;

  return Math.max(
    1,
    Math.round(baseExp * ENHANCEMENT_XP_MULTIPLIER[outcome] * lowLevelPenalty),
  );
}

export function getTemperingBlacksmithExp(grade: TemperingGrade): number {
  return TEMPERING_BLACKSMITH_XP[grade];
}
