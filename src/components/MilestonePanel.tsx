import { Flag, Gift } from "lucide-react";
import {
  milestoneRewards,
  type MilestoneReward,
  type MilestoneRewardDefinition,
} from "../core/milestones";
import { formatNumber } from "../core/format";

interface MilestonePanelProps {
  bestLevel: number;
  claimedIds: string[];
}

function formatReward(reward: MilestoneReward): string {
  const parts = [
    reward.gold ? `${formatNumber(reward.gold)}G` : "",
    reward.stones ? `강화석 ${formatNumber(reward.stones)}` : "",
    reward.protectionStones ? `보호석 ${formatNumber(reward.protectionStones)}` : "",
    reward.safeguardStones ? `수호석 ${formatNumber(reward.safeguardStones)}` : "",
    reward.blessingStones ? `축복석 ${formatNumber(reward.blessingStones)}` : "",
  ].filter(Boolean);

  return parts.join(" · ");
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
              <small>
                <Gift size={14} />
                {formatReward(milestone.reward)}
              </small>
            </article>
          );
        })}
      </div>
    </section>
  );
}
