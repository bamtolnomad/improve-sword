import { describe, expect, it } from "vitest";
import {
  addDiscoveredLevel,
  canRebirth,
  getCollectionProgress,
  getRebirthGpsMultiplier,
  getRebirthSuccessBonus,
} from "./rebirth";

describe("rebirth", () => {
  it("unlocks once the best level reaches 30", () => {
    expect(canRebirth(29)).toBe(false);
    expect(canRebirth(30)).toBe(true);
  });

  it("calculates simple MVP rebirth bonuses", () => {
    expect(getRebirthSuccessBonus(0)).toBe(0);
    expect(getRebirthSuccessBonus(3)).toBe(1.5);
    expect(getRebirthGpsMultiplier(0)).toBe(1);
    expect(getRebirthGpsMultiplier(2)).toBe(2);
  });

  it("deduplicates discovered levels", () => {
    expect(addDiscoveredLevel([1, 2, 2], 3)).toEqual([1, 2, 3]);
    expect(addDiscoveredLevel([1, 2, 3], 2)).toEqual([1, 2, 3]);
    expect(getCollectionProgress([1, 2, 2, 30])).toBe(3);
  });
});
