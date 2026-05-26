import { describe, expect, it } from "vitest";
import { enhancementTable } from "./enhancementTable";
import {
  applyBlessingStone,
  applySoulBurst,
  applySuccessBonus,
  calculateEnhancementResult,
  getNextSwordLevel,
  rollEnhancement,
  validateEnhancementTable,
} from "./enhancement";

describe("enhancement core", () => {
  it("keeps every enhancement row normalized", () => {
    expect(validateEnhancementTable(enhancementTable)).toBe(true);
  });

  it("rolls deterministic outcomes from rate boundaries", () => {
    const row = enhancementTable.find((item) => item.fromLevel === 15)!;

    expect(rollEnhancement(row, 0.0)).toBe("success");
    expect(rollEnhancement(row, 0.405)).toBe("keep");
    expect(rollEnhancement(row, 0.705)).toBe("down");
    expect(rollEnhancement(row, 0.98)).toBe("destroyed");
  });

  it("applies sword level changes for each outcome", () => {
    expect(getNextSwordLevel(10, "success")).toBe(11);
    expect(getNextSwordLevel(10, "keep")).toBe(10);
    expect(getNextSwordLevel(10, "down")).toBe(9);
    expect(getNextSwordLevel(10, "destroyed")).toBe(1);
  });

  it("prevents destruction during soul burst and keeps rates normalized", () => {
    const row = enhancementTable.find((item) => item.fromLevel === 29)!;
    const burstRow = applySoulBurst(row);
    const total =
      burstRow.successRate + burstRow.keepRate + burstRow.downRate + burstRow.destroyRate;

    expect(burstRow.successRate).toBe(6);
    expect(burstRow.destroyRate).toBe(0);
    expect(total).toBe(100);
  });

  it("boosts success rate with a blessing stone", () => {
    const row = enhancementTable.find((item) => item.fromLevel === 20)!;
    const blessedRow = applyBlessingStone(row);

    expect(blessedRow.successRate).toBe(37.5);
    expect(
      blessedRow.successRate +
        blessedRow.keepRate +
        blessedRow.downRate +
        blessedRow.destroyRate,
    ).toBe(100);
  });

  it("adds rebirth success bonus and redistributes the rest", () => {
    const row = enhancementTable.find((item) => item.fromLevel === 20)!;
    const boostedRow = applySuccessBonus(row, 1.5);

    expect(boostedRow.successRate).toBe(26.5);
    expect(
      boostedRow.successRate +
        boostedRow.keepRate +
        boostedRow.downRate +
        boostedRow.destroyRate,
    ).toBe(100);
  });

  it("turns destruction into protection when a protection stone is active", () => {
    const result = calculateEnhancementResult(29, 0, 0.99, {
      useProtectionStone: true,
    })!;

    expect(result.outcome).toBe("protected");
    expect(result.nextLevel).toBe(29);
    expect(result.protectionStoneUsed).toBe(true);
    expect(result.gainedSoulMileage).toBe(0);
  });

  it("returns undefined at max level", () => {
    expect(calculateEnhancementResult(30, 0, 0.1)).toBeUndefined();
  });
});
