import { describe, expect, it } from "vitest";
import { enhancementTable } from "./enhancementTable";
import {
  applyBlessingStone,
  applyRiskReduction,
  applySoulBurst,
  applySuccessBonus,
  calculateEnhancementResult,
  getGreatFailureRate,
  getGreatSuccessRate,
  getNextSwordLevel,
  getSoulMileageGain,
  rollEnhancement,
  validateEnhancementTable,
} from "./enhancement";

describe("enhancement core", () => {
  it("keeps every enhancement row normalized", () => {
    expect(validateEnhancementTable(enhancementTable)).toBe(true);
  });

  it("rolls deterministic outcomes from rate boundaries", () => {
    const row = enhancementTable.find((item) => item.fromLevel === 15)!;

    expect(rollEnhancement(row, 0.0)).toBe("great_success");
    expect(rollEnhancement(row, 0.045)).toBe("success");
    expect(rollEnhancement(row, 0.455)).toBe("keep");
    expect(rollEnhancement(row, 0.755)).toBe("down");
    expect(rollEnhancement(row, 0.965)).toBe("destroyed");
    expect(rollEnhancement(row, 0.98)).toBe("great_failure");
  });

  it("applies sword level changes for each outcome", () => {
    expect(getNextSwordLevel(10, "great_success")).toBe(12);
    expect(getNextSwordLevel(10, "success")).toBe(11);
    expect(getNextSwordLevel(10, "keep")).toBe(10);
    expect(getNextSwordLevel(10, "down")).toBe(9);
    expect(getNextSwordLevel(10, "great_failure")).toBe(8);
    expect(getNextSwordLevel(10, "destroyed")).toBe(1);
  });

  it("derives rare great success and great failure rates from the final row", () => {
    const row = enhancementTable.find((item) => item.fromLevel === 15)!;

    expect(getGreatSuccessRate(row)).toBe(4.5);
    expect(getGreatFailureRate(row)).toBe(3);
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

    expect(blessedRow.successRate).toBe(45);
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

    expect(boostedRow.successRate).toBe(31.5);
    expect(
      boostedRow.successRate +
        boostedRow.keepRate +
        boostedRow.downRate +
        boostedRow.destroyRate,
    ).toBe(100);
  });

  it("lets tempering reduce downgrade and destruction risk", () => {
    const row = enhancementTable.find((item) => item.fromLevel === 20)!;
    const temperedRow = applyRiskReduction(row, 4, 3);

    expect(temperedRow.downRate).toBe(28);
    expect(temperedRow.destroyRate).toBe(12);
    expect(temperedRow.keepRate).toBe(30);
    expect(
      temperedRow.successRate +
        temperedRow.keepRate +
        temperedRow.downRate +
        temperedRow.destroyRate,
    ).toBe(100);
  });

  it("turns destruction into protection when a protection stone is active", () => {
    const result = calculateEnhancementResult(29, 0, 0.96, {
      useProtectionStone: true,
    })!;

    expect(result.outcome).toBe("protected");
    expect(result.nextLevel).toBe(29);
    expect(result.protectionStoneUsed).toBe(true);
    expect(result.safeguardStoneUsed).toBe(false);
    expect(result.gainedSoulMileage).toBe(0);
  });

  it("can roll a great success that jumps two levels", () => {
    const result = calculateEnhancementResult(15, 0, 0.0)!;

    expect(result.outcome).toBe("great_success");
    expect(result.nextLevel).toBe(17);
  });

  it("can roll a great failure and lets safeguard stones block it", () => {
    const failedResult = calculateEnhancementResult(15, 0, 0.98)!;
    const protectedResult = calculateEnhancementResult(15, 0, 0.98, {
      useSafeguardStone: true,
    })!;

    expect(failedResult.outcome).toBe("great_failure");
    expect(failedResult.nextLevel).toBe(13);
    expect(failedResult.gainedSoulMileage).toBe(10);
    expect(protectedResult.outcome).toBe("protected");
    expect(protectedResult.nextLevel).toBe(15);
    expect(protectedResult.safeguardStoneUsed).toBe(true);
  });

  it("turns downgrade into protection with a safeguard stone", () => {
    const result = calculateEnhancementResult(15, 0, 0.8, {
      useSafeguardStone: true,
    })!;

    expect(result.outcome).toBe("protected");
    expect(result.nextLevel).toBe(15);
    expect(result.protectionStoneUsed).toBe(false);
    expect(result.safeguardStoneUsed).toBe(true);
    expect(result.gainedSoulMileage).toBe(0);
  });

  it("uses the cheaper protection stone first when both stones can block destruction", () => {
    const result = calculateEnhancementResult(29, 0, 0.96, {
      useProtectionStone: true,
      useSafeguardStone: true,
    })!;

    expect(result.outcome).toBe("protected");
    expect(result.protectionStoneUsed).toBe(true);
    expect(result.safeguardStoneUsed).toBe(false);
  });

  it("charges soul mileage from frustrating outcomes", () => {
    const row = enhancementTable.find((item) => item.fromLevel === 15)!;

    expect(getSoulMileageGain(row, "success")).toBe(0);
    expect(getSoulMileageGain(row, "great_success")).toBe(0);
    expect(getSoulMileageGain(row, "keep")).toBe(1);
    expect(getSoulMileageGain(row, "down")).toBe(5);
    expect(getSoulMileageGain(row, "great_failure")).toBe(10);
    expect(getSoulMileageGain(row, "destroyed")).toBe(10);
  });

  it("returns undefined at max level", () => {
    expect(calculateEnhancementResult(30, 0, 0.1)).toBeUndefined();
  });
});
