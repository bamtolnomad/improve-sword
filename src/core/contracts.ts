import { getSalvageStonesForLevel } from "./economy";
import { getSellPriceForLevel } from "./enhancementTable";

export type ForgeContractId = "patron-gift" | "royal-delivery" | "recovery-order";
export type ForgeContractRarity = "common" | "rare" | "epic" | "legendary";
export type ForgeContractRewardKind =
  | "gold"
  | "stones"
  | "protectionStones"
  | "safeguardStones"
  | "blessingStones"
  | "blacksmithExp";

export interface ForgeContractReward {
  gold: number;
  stones: number;
  protectionStones: number;
  safeguardStones: number;
  blessingStones: number;
  blacksmithExp: number;
}

export interface ForgeContractBonusCard {
  id: string;
  kind: ForgeContractRewardKind;
  label: string;
  value: number;
  rarity: ForgeContractRarity;
  reward: ForgeContractReward;
}

export interface ForgeContractRewardResult {
  baseReward: ForgeContractReward;
  bonusReward: ForgeContractReward;
  totalReward: ForgeContractReward;
  bonusCards: ForgeContractBonusCard[];
  fortuneBonus: number;
}

export interface ForgeContractTargets {
  deliveryTarget: number;
  recoveryTarget: number;
}

export interface ForgeContractReadiness extends ForgeContractTargets {
  canClaimPatronGift: boolean;
  canCompleteDelivery: boolean;
  canCompleteRecovery: boolean;
  hasReadyContract: boolean;
}

interface ForgeContractReadinessInput {
  swordLevel: number;
  bestLevel: number;
  contractDailyDate: string;
  contractClaimsToday: ForgeContractId[];
  todayKey: string;
}

export function emptyContractReward(): ForgeContractReward {
  return {
    gold: 0,
    stones: 0,
    protectionStones: 0,
    safeguardStones: 0,
    blessingStones: 0,
    blacksmithExp: 0,
  };
}

export function sumContractRewards(
  ...rewards: ForgeContractReward[]
): ForgeContractReward {
  return rewards.reduce(
    (total, reward) => ({
      gold: total.gold + reward.gold,
      stones: total.stones + reward.stones,
      protectionStones: total.protectionStones + reward.protectionStones,
      safeguardStones: total.safeguardStones + reward.safeguardStones,
      blessingStones: total.blessingStones + reward.blessingStones,
      blacksmithExp: total.blacksmithExp + reward.blacksmithExp,
    }),
    emptyContractReward(),
  );
}

export function getContractFortuneBonus(
  blacksmithLevel: number,
  contractStreak: number,
): number {
  const safeLevel = Math.max(1, Math.trunc(blacksmithLevel));
  const safeStreak = Math.max(1, Math.trunc(contractStreak));

  return Math.min(28, Math.floor(safeLevel * 0.7 + safeStreak * 1.4));
}

export function getContractRarityLabel(rarity: ForgeContractRarity): string {
  switch (rarity) {
    case "legendary":
      return "전설";
    case "epic":
      return "영웅";
    case "rare":
      return "희귀";
    case "common":
      return "일반";
  }
}

export function getTodaysContractClaims(
  contractDailyDate: string,
  contractClaimsToday: ForgeContractId[],
  todayKey: string,
): ForgeContractId[] {
  if (contractDailyDate !== todayKey) return [];

  return contractClaimsToday ?? [];
}

function getPreviousDateKey(todayKey: string): string {
  const date = new Date(`${todayKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getNextContractStreak(
  contractDailyDate: string,
  contractClaimsToday: ForgeContractId[],
  currentStreak: number,
  todayKey: string,
): number {
  if (contractDailyDate === todayKey && contractClaimsToday.length > 0) {
    return Math.max(1, currentStreak);
  }

  if (
    contractDailyDate === getPreviousDateKey(todayKey) &&
    contractClaimsToday.length > 0
  ) {
    return Math.max(1, currentStreak) + 1;
  }

  return 1;
}

function clampLevel(level: number, min: number, max: number): number {
  return Math.min(Math.max(Math.trunc(level), min), max);
}

export function getForgeContractTargets(bestLevel: number): ForgeContractTargets {
  const safeBest = Math.max(1, Math.trunc(bestLevel));

  return {
    deliveryTarget: clampLevel(safeBest, 3, 24),
    recoveryTarget: clampLevel(safeBest - 1, 2, 20),
  };
}

export function getPatronGiftReward(
  blacksmithLevel: number,
  contractStreak: number,
): ForgeContractReward {
  const safeLevel = Math.max(1, Math.trunc(blacksmithLevel));
  const safeStreak = Math.max(1, Math.trunc(contractStreak));
  const streakBonus = Math.min(safeStreak, 14);

  return {
    gold: 1_400 + safeLevel * 520 + streakBonus * 280,
    stones: 2 + Math.floor(safeLevel / 4) + Math.floor(streakBonus / 4),
    protectionStones: safeLevel >= 5 || streakBonus >= 3 ? 1 : 0,
    safeguardStones: safeLevel >= 12 && streakBonus >= 5 ? 1 : 0,
    blessingStones: streakBonus >= 7 ? 1 : 0,
    blacksmithExp: 12 + safeLevel * 2,
  };
}

export function getDeliveryContractReward(
  swordLevel: number,
  currentEnhancementCost: number,
  contractStreak: number,
): ForgeContractReward {
  const safeLevel = Math.max(1, Math.trunc(swordLevel));
  const safeCost = Math.max(0, Math.trunc(currentEnhancementCost));
  const safeStreak = Math.max(1, Math.trunc(contractStreak));
  const sellPrice = getSellPriceForLevel(safeLevel);

  return {
    gold: Math.floor(sellPrice * 1.2 + safeCost * 0.45 + Math.min(safeStreak, 10) * 320),
    stones: safeLevel >= 7 ? Math.max(1, Math.floor(safeLevel / 5)) : 0,
    protectionStones: safeLevel >= 13 ? 1 : 0,
    safeguardStones: safeLevel >= 18 ? 1 : 0,
    blessingStones: safeLevel >= 15 ? 1 : 0,
    blacksmithExp: 18 + safeLevel * 4,
  };
}

export function getRecoveryContractReward(
  swordLevel: number,
  contractStreak: number,
): ForgeContractReward {
  const safeLevel = Math.max(1, Math.trunc(swordLevel));
  const safeStreak = Math.max(1, Math.trunc(contractStreak));

  return {
    gold: safeLevel * 95 + Math.min(safeStreak, 10) * 180,
    stones: getSalvageStonesForLevel(safeLevel) + Math.max(1, Math.floor(safeLevel / 3)),
    protectionStones: safeLevel >= 8 ? 1 : 0,
    safeguardStones: safeLevel >= 16 ? 1 : 0,
    blessingStones: safeLevel >= 20 ? 1 : 0,
    blacksmithExp: 14 + safeLevel * 3,
  };
}

function getRolledRarity(
  roll: number,
  fortuneBonus: number,
): ForgeContractRarity {
  const safeRoll = Math.min(Math.max(roll, 0), 0.999999);
  const fortune = Math.min(Math.max(fortuneBonus, 0), 28);
  const legendaryRate = 0.012 + fortune / 1_000;
  const epicRate = 0.055 + fortune / 500;
  const rareRate = 0.22 + fortune / 350;

  if (safeRoll < legendaryRate) return "legendary";
  if (safeRoll < legendaryRate + epicRate) return "epic";
  if (safeRoll < legendaryRate + epicRate + rareRate) return "rare";

  return "common";
}

function getRarityMultiplier(rarity: ForgeContractRarity): number {
  switch (rarity) {
    case "legendary":
      return 8;
    case "epic":
      return 4;
    case "rare":
      return 2;
    case "common":
      return 1;
  }
}

function getRewardKindLabel(kind: ForgeContractRewardKind): string {
  switch (kind) {
    case "gold":
      return "골드";
    case "stones":
      return "강화석";
    case "protectionStones":
      return "보호석";
    case "safeguardStones":
      return "수호석";
    case "blessingStones":
      return "축복석";
    case "blacksmithExp":
      return "장인 경험";
  }
}

function getContractBonusPool(contractId: ForgeContractId): ForgeContractRewardKind[] {
  switch (contractId) {
    case "patron-gift":
      return ["gold", "stones", "blacksmithExp", "protectionStones", "blessingStones"];
    case "royal-delivery":
      return ["gold", "gold", "stones", "blacksmithExp", "protectionStones", "blessingStones"];
    case "recovery-order":
      return [
        "stones",
        "stones",
        "gold",
        "blacksmithExp",
        "protectionStones",
        "safeguardStones",
      ];
  }
}

function createRewardForCard(
  kind: ForgeContractRewardKind,
  rarity: ForgeContractRarity,
  swordLevel: number,
  blacksmithLevel: number,
): ForgeContractReward {
  const reward = emptyContractReward();
  const safeLevel = Math.max(1, Math.trunc(swordLevel));
  const safeBlacksmith = Math.max(1, Math.trunc(blacksmithLevel));
  const multiplier = getRarityMultiplier(rarity);

  switch (kind) {
    case "gold":
      reward.gold = Math.floor((180 + safeLevel * 95 + safeBlacksmith * 40) * multiplier);
      break;
    case "stones":
      reward.stones = Math.max(1, Math.floor(safeLevel / 6) + multiplier);
      break;
    case "protectionStones":
      reward.protectionStones = rarity === "common" ? 1 : Math.max(1, Math.floor(multiplier / 2));
      break;
    case "safeguardStones":
      reward.safeguardStones = rarity === "common" ? 1 : Math.max(1, Math.floor(multiplier / 3));
      break;
    case "blessingStones":
      reward.blessingStones = rarity === "common" ? 1 : Math.max(1, Math.floor(multiplier / 3));
      break;
    case "blacksmithExp":
      reward.blacksmithExp = Math.floor((10 + safeLevel * 2 + safeBlacksmith * 2) * multiplier);
      break;
  }

  return reward;
}

function getCardValue(reward: ForgeContractReward, kind: ForgeContractRewardKind): number {
  return reward[kind];
}

export function createContractRewardResult(
  contractId: ForgeContractId,
  baseReward: ForgeContractReward,
  context: {
    swordLevel: number;
    blacksmithLevel: number;
    contractStreak: number;
  },
  random = Math.random,
): ForgeContractRewardResult {
  const fortuneBonus = getContractFortuneBonus(
    context.blacksmithLevel,
    context.contractStreak,
  );
  const pool = getContractBonusPool(contractId);
  const bonusCards = Array.from({ length: 3 }, (_, index) => {
    const rarity = getRolledRarity(random(), fortuneBonus);
    const kind = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
    const reward = createRewardForCard(
      kind,
      rarity,
      context.swordLevel,
      context.blacksmithLevel,
    );

    return {
      id: `${contractId}-${index}-${rarity}-${kind}`,
      kind,
      label: getRewardKindLabel(kind),
      value: getCardValue(reward, kind),
      rarity,
      reward,
    };
  });
  const bonusReward = sumContractRewards(...bonusCards.map((card) => card.reward));

  return {
    baseReward,
    bonusReward,
    totalReward: sumContractRewards(baseReward, bonusReward),
    bonusCards,
    fortuneBonus,
  };
}

export function getForgeContractReadiness({
  swordLevel,
  bestLevel,
  contractDailyDate,
  contractClaimsToday,
  todayKey,
}: ForgeContractReadinessInput): ForgeContractReadiness {
  const claims = getTodaysContractClaims(contractDailyDate, contractClaimsToday, todayKey);
  const targets = getForgeContractTargets(bestLevel);
  const canClaimPatronGift = !claims.includes("patron-gift");
  const canCompleteDelivery =
    swordLevel >= targets.deliveryTarget && !claims.includes("royal-delivery");
  const canCompleteRecovery =
    swordLevel >= targets.recoveryTarget && !claims.includes("recovery-order");

  return {
    ...targets,
    canClaimPatronGift,
    canCompleteDelivery,
    canCompleteRecovery,
    hasReadyContract: canClaimPatronGift || canCompleteDelivery || canCompleteRecovery,
  };
}
