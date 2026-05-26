import { describe, expect, it } from "vitest";
import {
  BASE_GPS,
  BLESSING_STONE_COST,
  PROTECTION_STONE_COST,
  SAFEGUARD_STONE_COST,
  calculateMiningReward,
  calculateGps,
  calculateOfflineReward,
  getMiningGoldReward,
  getSalvageStonesForLevel,
  getStoredSwordGpsBonus,
} from "./economy";
import {
  getSellPriceForLevel,
  getSellStrategyForLevel,
  getTotalEnhancementCostToLevel,
} from "./enhancementTable";
import type { StoredSword } from "./types";

describe("economy", () => {
  it("uses enhancement table salvage values for sword levels", () => {
    expect(getSalvageStonesForLevel(1)).toBe(0);
    expect(getSalvageStonesForLevel(2)).toBe(1);
    expect(getSalvageStonesForLevel(5)).toBe(4);
    expect(getSalvageStonesForLevel(7)).toBe(3);
    expect(getSalvageStonesForLevel(9)).toBe(5);
    expect(getSalvageStonesForLevel(15)).toBe(16);
    expect(getSalvageStonesForLevel(30)).toBe(550);
  });

  it("prices support stones by their protection strength", () => {
    expect(PROTECTION_STONE_COST).toBeLessThan(SAFEGUARD_STONE_COST);
    expect(BLESSING_STONE_COST).toBeLessThan(SAFEGUARD_STONE_COST);
  });

  it("uses tiered selling so low levels lose, mid levels recover, and high levels cash out", () => {
    expect(getSellStrategyForLevel(2).band).toBe("loss");
    expect(getSellPriceForLevel(2)).toBeLessThan(getTotalEnhancementCostToLevel(2));
    expect(getSellStrategyForLevel(10).band).toBe("recover");
    expect(getSellPriceForLevel(10)).toBe(getTotalEnhancementCostToLevel(10));
    expect(getSellStrategyForLevel(11).band).toBe("profit");
    expect(getSellPriceForLevel(11)).toBeGreaterThan(
      getTotalEnhancementCostToLevel(11) * 1.4,
    );
    expect(getSellPriceForLevel(20)).toBeGreaterThan(
      getTotalEnhancementCostToLevel(20) * 2.5,
    );
  });

  it("gives stronger GPS for higher stored swords", () => {
    expect(getStoredSwordGpsBonus(4)).toBe(0);
    expect(getStoredSwordGpsBonus(10)).toBeGreaterThan(getStoredSwordGpsBonus(5));
    expect(getStoredSwordGpsBonus(25)).toBeGreaterThan(getStoredSwordGpsBonus(20));
  });

  it("combines base, collection, and stored sword GPS", () => {
    const storedSwords: StoredSword[] = [
      { id: "a", level: 10, storedAt: "2026-05-26T00:00:00.000Z", gpsBonus: 7.5 },
      { id: "b", level: 10, storedAt: "2026-05-26T00:01:00.000Z", gpsBonus: 7.5 },
      { id: "c", level: 15, storedAt: "2026-05-26T00:02:00.000Z", gpsBonus: 18 },
    ];

    expect(calculateGps(storedSwords)).toBe(BASE_GPS + 1 + 33);
    expect(calculateGps(storedSwords, 1)).toBe((BASE_GPS + 1 + 33) * 1.5);
  });

  it("caps offline reward at 12 hours", () => {
    const reward = calculateOfflineReward(
      10,
      "2026-05-25T00:00:00.000Z",
      new Date("2026-05-26T00:00:00.000Z"),
    );

    expect(reward.seconds).toBe(86_400);
    expect(reward.cappedSeconds).toBe(43_200);
    expect(reward.gold).toBe(432_000);
  });

  it("pays mining gold from current enhancement cost with a floor", () => {
    expect(getMiningGoldReward(100)).toBe(300);
    expect(getMiningGoldReward(36_000)).toBe(12_600);
  });

  it("rolls mining stones with pity protection", () => {
    expect(calculateMiningReward(1_000, 0, 0.8).stones).toBe(0);
    expect(calculateMiningReward(1_000, 0, 0.8).nextPity).toBe(1);

    const lucky = calculateMiningReward(1_000, 2, 0.1, 0.99);
    expect(lucky.stones).toBe(3);
    expect(lucky.nextPity).toBe(0);
    expect(lucky.pityTriggered).toBe(false);

    const pitied = calculateMiningReward(1_000, 3, 0.99, 0.99);
    expect(pitied.stones).toBe(1);
    expect(pitied.nextPity).toBe(0);
    expect(pitied.pityTriggered).toBe(true);
  });
});
