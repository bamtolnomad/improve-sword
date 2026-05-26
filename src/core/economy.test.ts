import { describe, expect, it } from "vitest";
import {
  BASE_GPS,
  calculateGps,
  calculateOfflineReward,
  getSalvageStonesForLevel,
  getStoredSwordGpsBonus,
} from "./economy";
import type { StoredSword } from "./types";

describe("economy", () => {
  it("uses enhancement table salvage values for sword levels", () => {
    expect(getSalvageStonesForLevel(1)).toBe(0);
    expect(getSalvageStonesForLevel(7)).toBe(1);
    expect(getSalvageStonesForLevel(9)).toBe(2);
    expect(getSalvageStonesForLevel(15)).toBe(10);
    expect(getSalvageStonesForLevel(30)).toBe(550);
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
});
