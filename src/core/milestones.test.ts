import { describe, expect, it } from "vitest";
import { getUnclaimedMilestoneRewards, sumMilestoneRewards } from "./milestones";

describe("milestone rewards", () => {
  it("returns unclaimed rewards up to the best level", () => {
    const rewards = getUnclaimedMilestoneRewards(18, ["reach-10"]);

    expect(rewards.map((reward) => reward.id)).toEqual(["reach-15", "reach-18"]);
  });

  it("sums mixed reward currencies", () => {
    const rewards = getUnclaimedMilestoneRewards(20, []);
    const total = sumMilestoneRewards(rewards);

    expect(total.stones).toBeGreaterThan(0);
    expect(total.protectionStones).toBeGreaterThan(0);
    expect(total.safeguardStones).toBeGreaterThan(0);
    expect(total.blessingStones).toBeGreaterThan(0);
  });
});
