import { describe, expect, it } from "vitest";
import {
  applyBlacksmithExp,
  getBlacksmithExpToNext,
  getEnhancementBlacksmithExp,
  getTemperingBlacksmithExp,
} from "./blacksmith";

describe("blacksmith progression", () => {
  it("levels from accumulated account exp", () => {
    const required = getBlacksmithExpToNext(1);
    const result = applyBlacksmithExp(1, required - 4, 12);

    expect(result.level).toBe(2);
    expect(result.exp).toBe(8);
  });

  it("rewards risky enhancement outcomes without making low-level farming efficient", () => {
    const highSwordExp = getEnhancementBlacksmithExp(18, "great_success", 12);
    const lowFarmExp = getEnhancementBlacksmithExp(2, "great_success", 12);

    expect(highSwordExp).toBeGreaterThan(60);
    expect(lowFarmExp).toBeLessThan(4);
  });

  it("uses tempering as a steady blacksmith exp source", () => {
    expect(getTemperingBlacksmithExp("cracked")).toBe(8);
    expect(getTemperingBlacksmithExp("master")).toBe(55);
  });
});
