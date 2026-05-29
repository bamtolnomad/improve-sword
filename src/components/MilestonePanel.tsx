import { Flag } from "lucide-react";
import {
  milestoneRewards,
  type MilestoneReward,
  type MilestoneRewardDefinition,
} from "../core/milestones";
import { formatNumber } from "../core/format";
import { RewardChips, type RewardChipItem } from "./RewardChips";

interface MilestonePanelProps {
  bestLevel: number;
  claimedIds: string[];
}

function getRewardItems(reward: MilestoneReward): RewardChipItem[] {
  const items: RewardChipItem[] = [];

  if (reward.gold) {
    items.push({ kind: "gold", label: "골드", value: `${formatNumber(reward.gold)}G` });
  }

  if (reward.stones) {
    items.push({ kind: "stone", label: "강화석", value: formatNumber(reward.stones) });
  }

  if (reward.protectionStones) {
    items.push({
      kind: "protection",
      label: "보호석",
      value: formatNumber(reward.protectionStones),
    });
  }

  if (reward.safeguardStones) {
    items.push({
      kind: "safeguard",
      label: "수호석",
      value: formatNumber(reward.safeguardStones),
    });
  }

  if (reward.blessingStones) {
    items.push({
      kind: "blessing",
      label: "축복석",
      value: formatNumber(reward.blessingStones),
    });
  }

  return items;
}

function getVisibleMilestones(
  bestLevel: number,
  claimedIds: string[],
): MilestoneRewardDefinition[] {
  const claimed = new Set(claimedIds);
  const firstUnclaimedIndex = milestoneRewards.findIndex(
    (milestone) => !claimed.has(milestone.id),
  );
  const startIndex = Math.max(
    0,
    firstUnclaimedIndex === -1
      ? milestoneRewards.length - 3
      : firstUnclaimedIndex - 1,
  );

  return milestoneRewards.slice(startIndex, startIndex + 4).filter((milestone) => {
    if (claimed.has(milestone.id)) return true;
    return milestone.level <= Math.max(bestLevel + 5, 15);
  });
}

export function MilestonePanel({ bestLevel, claimedIds }: MilestonePanelProps) {
  const claimed = new Set(claimedIds);
  const visibleMilestones = getVisibleMilestones(bestLevel, claimedIds);

  return (
    <section className="milestonePanel" aria-label="돌파 의뢰">
      <div className="panelTitle">
        <span>
          <Flag size={17} />
          돌파 의뢰
        </span>
        <strong>최고 +{bestLevel}</strong>
      </div>

      <div className="milestoneList">
        {visibleMilestones.map((milestone) => {
          const isClaimed = claimed.has(milestone.id);
          const progress = Math.min(1, bestLevel / milestone.level);

          return (
            <article
              key={milestone.id}
              className={`milestoneCard ${isClaimed ? "claimed" : ""}`}
            >
              <div className="milestoneHead">
                <span>+{milestone.level}</span>
                <strong>{isClaimed ? "완료" : milestone.title}</strong>
              </div>
              <p>{milestone.description}</p>
              <div className="miniTrack" aria-hidden="true">
                <div style={{ width: `${progress * 100}%` }} />
              </div>
              <RewardChips items={getRewardItems(milestone.reward)} compact />
            </article>
          );
        })}
      </div>
    </section>
  );
}
