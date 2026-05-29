import { describe, expect, it } from "vitest";
import {
  createContractRewardResult,
  getContractFortuneBonus,
  getDeliveryContractReward,
  getForgeContractReadiness,
  getForgeContractTargets,
  getNextContractStreak,
  getPatronGiftReward,
  getRecoveryContractReward,
} from "./contracts";

describe("forge contracts", () => {
  it("sets reachable targets from the player best level", () => {
    expect(getForgeContractTargets(1)).toEqual({
      deliveryTarget: 3,
      recoveryTarget: 2,
    });
    expect(getForgeContractTargets(18)).toEqual({
      deliveryTarget: 18,
      recoveryTarget: 17,
    });
  });

  it("keeps daily claim streaks alive across consecutive days", () => {
    expect(getNextContractStreak("2026-05-27", ["patron-gift"], 3, "2026-05-28")).toBe(4);
    expect(getNextContractStreak("2026-05-26", ["patron-gift"], 3, "2026-05-28")).toBe(1);
    expect(getNextContractStreak("2026-05-28", ["patron-gift"], 3, "2026-05-28")).toBe(3);
  });

  it("marks contracts ready only if the daily claim is open and the sword qualifies", () => {
    const ready = getForgeContractReadiness({
      swordLevel: 10,
      bestLevel: 10,
      contractDailyDate: "2026-05-28",
      contractClaimsToday: ["patron-gift"],
      todayKey: "2026-05-28",
    });

    expect(ready.canClaimPatronGift).toBe(false);
    expect(ready.canCompleteDelivery).toBe(true);
    expect(ready.canCompleteRecovery).toBe(true);
    expect(ready.hasReadyContract).toBe(true);
  });

  it("scales rewards with level and streak", () => {
    expect(getPatronGiftReward(8, 5).stones).toBeGreaterThan(
      getPatronGiftReward(1, 1).stones,
    );
    expect(getDeliveryContractReward(15, 20_000, 4).gold).toBeGreaterThan(
      getDeliveryContractReward(5, 1_000, 1).gold,
    );
    expect(getRecoveryContractReward(16, 3).safeguardStones).toBe(1);
  });

  it("raises contract fortune through blacksmith level and streak", () => {
    expect(getContractFortuneBonus(20, 10)).toBeGreaterThan(getContractFortuneBonus(1, 1));
    expect(getContractFortuneBonus(99, 99)).toBe(28);
  });

  it("adds three gacha bonus cards on top of the guaranteed reward", () => {
    const result = createContractRewardResult(
      "patron-gift",
      getPatronGiftReward(10, 7),
      {
        swordLevel: 12,
        blacksmithLevel: 10,
        contractStreak: 7,
      },
      () => 0,
    );

    expect(result.bonusCards).toHaveLength(3);
    expect(result.bonusCards.every((card) => card.rarity === "legendary")).toBe(true);
    expect(result.totalReward.gold).toBeGreaterThanOrEqual(result.baseReward.gold);
    expect(result.totalReward.blacksmithExp).toBeGreaterThanOrEqual(
      result.baseReward.blacksmithExp,
    );
  });
});
