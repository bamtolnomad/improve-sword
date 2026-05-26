import { calculateEnhancementResult } from "../src/core/enhancement";
import { getEnhancementRow, getSellPriceForLevel } from "../src/core/enhancementTable";
import {
  PROTECTION_STONE_COST,
  calculateGps,
  getSalvageStonesForLevel,
  getStoredSwordGpsBonus,
} from "../src/core/economy";
import { createSeededRandom } from "../src/core/random";
import type { StoredSword } from "../src/core/types";

const INITIAL_GOLD = 100_000;
const RUNS = 1000;
const MAX_ACTIONS = 180;
const SEED = 20260526;

interface Policy {
  label: string;
  cashoutLevel?: number;
  salvageLevel?: number;
  storeLevel?: number;
  prepareProtectionLevel?: number;
  protectionFromLevel?: number;
}

interface SessionResult {
  attempts: number;
  endingGold: number;
  endingLevel: number;
  bestLevel: number;
  stones: number;
  protectionStones: number;
  boughtProtectionCount: number;
  protectedCount: number;
  destroyedCount: number;
  soldCount: number;
  salvagedCount: number;
  storedCount: number;
  gps: number;
}

const policies: Policy[] = [
  { label: "그냥 밀기" },
  { label: "+12 판매 반복", cashoutLevel: 12 },
  { label: "+12 분해 반복", salvageLevel: 12 },
  { label: "+12 보관 반복", storeLevel: 12 },
  { label: "+15 판매 반복", cashoutLevel: 15 },
  { label: "+15 분해 반복", salvageLevel: 15 },
  { label: "+12 분해 후 보호", prepareProtectionLevel: 12, protectionFromLevel: 15 },
  { label: "+15 보호 사용", protectionFromLevel: 15 },
];

function runSession(policy: Policy, random: () => number): SessionResult {
  let gold = INITIAL_GOLD;
  let stones = 0;
  let protectionStones = 0;
  let level = 1;
  let soulMileage = 0;
  let attempts = 0;
  let actions = 0;
  let bestLevel = 1;
  let boughtProtectionCount = 0;
  let protectedCount = 0;
  let destroyedCount = 0;
  let soldCount = 0;
  let salvagedCount = 0;
  let storedCount = 0;
  const storedSwords: StoredSword[] = [];

  while (actions < MAX_ACTIONS) {
    actions += 1;

    if (policy.cashoutLevel && level >= policy.cashoutLevel) {
      gold += getSellPriceForLevel(level);
      soldCount += 1;
      level = 1;
      continue;
    }

    if (policy.salvageLevel && level >= policy.salvageLevel) {
      stones += getSalvageStonesForLevel(level);
      salvagedCount += 1;
      level = 1;
      continue;
    }

    if (policy.storeLevel && level >= policy.storeLevel) {
      storedSwords.push({
        id: `${storedCount + 1}`,
        level,
        storedAt: "session",
        gpsBonus: getStoredSwordGpsBonus(level),
      });
      storedCount += 1;
      level = 1;
      continue;
    }

    if (
      policy.protectionFromLevel &&
      protectionStones === 0 &&
      stones >= PROTECTION_STONE_COST
    ) {
      stones -= PROTECTION_STONE_COST;
      protectionStones += 1;
      boughtProtectionCount += 1;
      continue;
    }

    if (
      policy.prepareProtectionLevel &&
      level >= policy.prepareProtectionLevel &&
      protectionStones === 0 &&
      stones < PROTECTION_STONE_COST
    ) {
      stones += getSalvageStonesForLevel(level);
      salvagedCount += 1;
      level = 1;
      continue;
    }

    const row = getEnhancementRow(level);
    if (!row || gold < row.cost) break;

    const result = calculateEnhancementResult(level, soulMileage, random(), {
      useProtectionStone:
        Boolean(policy.protectionFromLevel) &&
        level >= (policy.protectionFromLevel ?? 31) &&
        protectionStones > 0,
    });
    if (!result) break;

    attempts += 1;
    gold -= result.spentGold;
    stones += result.gainedStones;
    soulMileage = result.soulBurstUsed
      ? Math.max(0, soulMileage - 100) + result.gainedSoulMileage
      : soulMileage + result.gainedSoulMileage;
    level = result.nextLevel;
    bestLevel = Math.max(bestLevel, level);

    if (result.protectionStoneUsed) {
      protectionStones -= 1;
      protectedCount += 1;
    }

    if (result.outcome === "destroyed") {
      destroyedCount += 1;
    }
  }

  return {
    attempts,
    endingGold: gold,
    endingLevel: level,
    bestLevel,
    stones,
    protectionStones,
    boughtProtectionCount,
    protectedCount,
    destroyedCount,
    soldCount,
    salvagedCount,
    storedCount,
    gps: calculateGps(storedSwords),
  };
}

function average(results: SessionResult[], key: keyof SessionResult): number {
  return results.reduce((sum, result) => sum + Number(result[key]), 0) / results.length;
}

function rate(results: SessionResult[], predicate: (result: SessionResult) => boolean): number {
  return results.filter(predicate).length / results.length;
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

for (const policy of policies) {
  const random = createSeededRandom(SEED);
  const results = Array.from({ length: RUNS }, () => runSession(policy, random));

  console.log(`\n## ${policy.label}`);
  console.log(`avgBestLevel=${average(results, "bestLevel").toFixed(2)}`);
  console.log(`avgAttempts=${average(results, "attempts").toFixed(1)}`);
  console.log(`avgEndingGold=${Math.round(average(results, "endingGold"))}`);
  console.log(`avgStones=${average(results, "stones").toFixed(2)}`);
  console.log(`avgGPS=${average(results, "gps").toFixed(2)}`);
  console.log(`avgSold=${average(results, "soldCount").toFixed(2)}`);
  console.log(`avgSalvaged=${average(results, "salvagedCount").toFixed(2)}`);
  console.log(`avgStored=${average(results, "storedCount").toFixed(2)}`);
  console.log(`avgDestroyed=${average(results, "destroyedCount").toFixed(2)}`);
  console.log(`avgProtectionBought=${average(results, "boughtProtectionCount").toFixed(2)}`);
  console.log(`avgProtected=${average(results, "protectedCount").toFixed(2)}`);
  console.log(
    `reach +12/${pct(rate(results, (result) => result.bestLevel >= 12))} +15/${pct(rate(results, (result) => result.bestLevel >= 15))} +20/${pct(rate(results, (result) => result.bestLevel >= 20))}`,
  );
}
