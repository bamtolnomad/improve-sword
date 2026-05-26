import { calculateEnhancementResult } from "../src/core/enhancement";
import { getEnhancementRow, getSellPriceForLevel } from "../src/core/enhancementTable";
import { calculateGps, getSalvageStonesForLevel, getStoredSwordGpsBonus } from "../src/core/economy";
import { createSeededRandom } from "../src/core/random";
import type { StoredSword } from "../src/core/types";

const INITIAL_GOLD = 12_000;
const RUNS = 1000;
const MAX_ACTIONS = 60;
const SEED = 20260526;

type Policy = "push" | "sell10" | "salvage10" | "store10";

interface SessionResult {
  attempts: number;
  endingGold: number;
  endingLevel: number;
  bestLevel: number;
  stones: number;
  soldCount: number;
  salvagedCount: number;
  storedCount: number;
  gps: number;
}

const policies: Array<{ label: string; policy: Policy }> = [
  { label: "그냥 밀기", policy: "push" },
  { label: "+10 판매 반복", policy: "sell10" },
  { label: "+10 분해 반복", policy: "salvage10" },
  { label: "+10 보관 반복", policy: "store10" },
];

function runSession(policy: Policy, random: () => number): SessionResult {
  let gold = INITIAL_GOLD;
  let stones = 0;
  let level = 1;
  let soulMileage = 0;
  let attempts = 0;
  let actions = 0;
  let bestLevel = 1;
  let soldCount = 0;
  let salvagedCount = 0;
  let storedCount = 0;
  const storedSwords: StoredSword[] = [];

  while (actions < MAX_ACTIONS) {
    actions += 1;

    if (policy === "sell10" && level >= 10) {
      gold += getSellPriceForLevel(level);
      soldCount += 1;
      level = 1;
      continue;
    }

    if (policy === "salvage10" && level >= 10) {
      stones += getSalvageStonesForLevel(level);
      salvagedCount += 1;
      level = 1;
      continue;
    }

    if (policy === "store10" && level >= 10) {
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

    const row = getEnhancementRow(level);
    if (!row || gold < row.cost) break;

    const result = calculateEnhancementResult(level, soulMileage, random());
    if (!result) break;

    attempts += 1;
    gold -= result.spentGold;
    stones += result.gainedStones;
    soulMileage = result.soulBurstUsed
      ? Math.max(0, soulMileage - 100) + result.gainedSoulMileage
      : soulMileage + result.gainedSoulMileage;
    level = result.nextLevel;
    bestLevel = Math.max(bestLevel, level);
  }

  return {
    attempts,
    endingGold: gold,
    endingLevel: level,
    bestLevel,
    stones,
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

for (const { label, policy } of policies) {
  const random = createSeededRandom(SEED);
  const results = Array.from({ length: RUNS }, () => runSession(policy, random));

  console.log(`\n## ${label}`);
  console.log(`avgBestLevel=${average(results, "bestLevel").toFixed(2)}`);
  console.log(`avgAttempts=${average(results, "attempts").toFixed(1)}`);
  console.log(`avgEndingGold=${Math.round(average(results, "endingGold"))}`);
  console.log(`avgStones=${average(results, "stones").toFixed(2)}`);
  console.log(`avgGPS=${average(results, "gps").toFixed(2)}`);
  console.log(`avgSold=${average(results, "soldCount").toFixed(2)}`);
  console.log(`avgSalvaged=${average(results, "salvagedCount").toFixed(2)}`);
  console.log(`avgStored=${average(results, "storedCount").toFixed(2)}`);
  console.log(
    `reach +10/${pct(rate(results, (result) => result.bestLevel >= 10))} +12/${pct(rate(results, (result) => result.bestLevel >= 12))} +15/${pct(rate(results, (result) => result.bestLevel >= 15))}`,
  );
}
