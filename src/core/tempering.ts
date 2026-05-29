import type {
  TemperingBuff,
  TemperingGrade,
  TemperingRecord,
  TemperingScores,
} from "./types";

export const TEMPERING_DAILY_FREE_ATTEMPTS = 7;
export const TEMPERING_MAX_LEVEL = 30;
export const TEMPERING_HISTORY_LIMIT = 12;

export interface TemperingMasteryBonus {
  successBonusRate: number;
  downRateReduction: number;
  destroyRateReduction: number;
}

export interface TemperingAttemptResult {
  record: TemperingRecord;
  nextMasteryLevel: number;
  nextMasteryExp: number;
  nextCrackResearch: number;
}

export function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function clampTemperingScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(Math.max(Math.round(score), 0), 100);
}

export function getTemperingExpToNext(level: number): number {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), TEMPERING_MAX_LEVEL);
  return Math.round(90 + safeLevel * 34 + Math.pow(safeLevel, 1.28) * 16);
}

export function getTemperingTotalScore(scores: TemperingScores): number {
  const heat = clampTemperingScore(scores.heatScore);
  const hammer = clampTemperingScore(scores.hammerScore);
  const quench = clampTemperingScore(scores.quenchScore);
  const polish = clampTemperingScore(scores.polishScore);
  const weakest = Math.min(heat, hammer, quench, polish);
  const crackPenalty = weakest < 45 ? (45 - weakest) * 0.55 : 0;

  return Math.max(
    0,
    Math.round(heat * 0.24 + hammer * 0.28 + quench * 0.3 + polish * 0.18 - crackPenalty),
  );
}

export function getTemperingGrade(totalScore: number): TemperingGrade {
  if (totalScore >= 94) return "master";
  if (totalScore >= 86) return "S";
  if (totalScore >= 74) return "A";
  if (totalScore >= 60) return "B";
  if (totalScore >= 45) return "C";
  return "cracked";
}

export function getTemperingGradeLabel(grade: TemperingGrade): string {
  switch (grade) {
    case "master":
      return "명장";
    case "cracked":
      return "균열";
    default:
      return grade;
  }
}

export function getTemperingExpReward(grade: TemperingGrade): number {
  switch (grade) {
    case "master":
      return 225;
    case "S":
      return 180;
    case "A":
      return 132;
    case "B":
      return 88;
    case "C":
      return 56;
    case "cracked":
      return 32;
  }
}

export function getTemperingShardReward(grade: TemperingGrade): number {
  switch (grade) {
    case "master":
      return 8;
    case "S":
      return 5;
    case "A":
      return 3;
    case "B":
      return 2;
    case "C":
      return 1;
    case "cracked":
      return 0;
  }
}

export function createTemperingBuff(grade: TemperingGrade): TemperingBuff | undefined {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  switch (grade) {
    case "master":
      return {
        id,
        label: "명장의 감각",
        grade,
        successBonusRate: 3,
        downRateReduction: 4,
        destroyRateReduction: 2.5,
        remainingEnhanceAttempts: 3,
      };
    case "S":
      return {
        id,
        label: "심화 담금",
        grade,
        successBonusRate: 2.2,
        downRateReduction: 3,
        destroyRateReduction: 1.5,
        remainingEnhanceAttempts: 3,
      };
    case "A":
      return {
        id,
        label: "균열 억제",
        grade,
        successBonusRate: 1.5,
        downRateReduction: 2,
        destroyRateReduction: 1,
        remainingEnhanceAttempts: 2,
      };
    case "B":
      return {
        id,
        label: "열처리 양호",
        grade,
        successBonusRate: 1,
        downRateReduction: 1,
        destroyRateReduction: 0,
        remainingEnhanceAttempts: 2,
      };
    case "C":
      return {
        id,
        label: "잔열 보정",
        grade,
        successBonusRate: 0.6,
        downRateReduction: 0,
        destroyRateReduction: 0,
        remainingEnhanceAttempts: 1,
      };
    case "cracked":
      return undefined;
  }
}

export function applyTemperingExp(
  masteryLevel: number,
  masteryExp: number,
  gainedExp: number,
): { level: number; exp: number } {
  let level = Math.min(Math.max(Math.trunc(masteryLevel), 1), TEMPERING_MAX_LEVEL);
  let exp = Math.max(0, Math.trunc(masteryExp + gainedExp));

  while (level < TEMPERING_MAX_LEVEL) {
    const required = getTemperingExpToNext(level);
    if (exp < required) break;
    exp -= required;
    level += 1;
  }

  if (level >= TEMPERING_MAX_LEVEL) {
    exp = Math.min(exp, getTemperingExpToNext(TEMPERING_MAX_LEVEL));
  }

  return { level, exp };
}

export function resolveTemperingAttempt(
  scores: TemperingScores,
  masteryLevel: number,
  masteryExp: number,
  crackResearch: number,
): TemperingAttemptResult {
  const totalScore = Math.min(100, getTemperingTotalScore(scores) + Math.min(8, crackResearch));
  const grade = getTemperingGrade(totalScore);
  const masteryExpGained = getTemperingExpReward(grade);
  const shardsGained = getTemperingShardReward(grade);
  const buff = createTemperingBuff(grade);
  const nextMastery = applyTemperingExp(masteryLevel, masteryExp, masteryExpGained);
  const nextCrackResearch =
    grade === "cracked" ? Math.min(8, crackResearch + 2) : Math.max(0, crackResearch - 1);

  return {
    record: {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      grade,
      totalScore,
      heatScore: clampTemperingScore(scores.heatScore),
      hammerScore: clampTemperingScore(scores.hammerScore),
      quenchScore: clampTemperingScore(scores.quenchScore),
      polishScore: clampTemperingScore(scores.polishScore),
      masteryExpGained,
      shardsGained,
      buff,
    },
    nextMasteryLevel: nextMastery.level,
    nextMasteryExp: nextMastery.exp,
    nextCrackResearch,
  };
}

export function getTemperingMasteryBonus(
  masteryLevel: number,
  swordLevel: number,
): TemperingMasteryBonus {
  const safeMastery = Math.min(Math.max(Math.trunc(masteryLevel), 1), TEMPERING_MAX_LEVEL);
  const scale = swordLevel >= 26 ? 0.5 : swordLevel >= 21 ? 0.65 : swordLevel >= 11 ? 0.8 : 1;

  return {
    successBonusRate: Math.min(3, safeMastery * 0.1) * scale,
    downRateReduction: Math.min(3, safeMastery * 0.1) * scale,
    destroyRateReduction: Math.min(2, safeMastery * (2 / TEMPERING_MAX_LEVEL)) * scale,
  };
}

export function getActiveTemperingBonus(buffs: TemperingBuff[]): TemperingMasteryBonus {
  return buffs.reduce(
    (sum, buff) => ({
      successBonusRate: sum.successBonusRate + buff.successBonusRate,
      downRateReduction: sum.downRateReduction + buff.downRateReduction,
      destroyRateReduction: sum.destroyRateReduction + buff.destroyRateReduction,
    }),
    {
      successBonusRate: 0,
      downRateReduction: 0,
      destroyRateReduction: 0,
    },
  );
}

export function consumeTemperingBuffs(buffs: TemperingBuff[]): TemperingBuff[] {
  return buffs
    .map((buff) => ({
      ...buff,
      remainingEnhanceAttempts: buff.remainingEnhanceAttempts - 1,
    }))
    .filter((buff) => buff.remainingEnhanceAttempts > 0);
}
