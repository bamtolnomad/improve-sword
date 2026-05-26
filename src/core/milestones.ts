export interface MilestoneReward {
  gold?: number;
  stones?: number;
  protectionStones?: number;
  safeguardStones?: number;
  blessingStones?: number;
}

export interface MilestoneRewardDefinition {
  id: string;
  level: number;
  title: string;
  description: string;
  reward: MilestoneReward;
}

export const milestoneRewards: MilestoneRewardDefinition[] = [
  {
    id: "reach-10",
    level: 10,
    title: "첫 대박 직전",
    description: "+10은 회수 구간, +11부터 판매 대박 구간입니다.",
    reward: { stones: 6, blessingStones: 1 },
  },
  {
    id: "reach-15",
    level: 15,
    title: "균열 진입",
    description: "파괴 위험이 열리는 구간에 들어섭니다.",
    reward: { stones: 4, protectionStones: 1 },
  },
  {
    id: "reach-18",
    level: 18,
    title: "하락 장벽",
    description: "하락을 막고 고점을 노리는 수호석이 빛나는 구간입니다.",
    reward: { safeguardStones: 1 },
  },
  {
    id: "reach-20",
    level: 20,
    title: "장인의 축복",
    description: "축복석으로 성공률을 끌어올릴 이유가 생깁니다.",
    reward: { stones: 8, blessingStones: 1 },
  },
  {
    id: "reach-23",
    level: 23,
    title: "별철 도전권",
    description: "축복석과 수호석을 함께 쓰는 고단계 도전 구간입니다.",
    reward: { protectionStones: 2, safeguardStones: 1, blessingStones: 1 },
  },
  {
    id: "reach-25",
    level: 25,
    title: "고대 제련식",
    description: "파괴와 하락을 관리하며 최종장을 준비합니다.",
    reward: { stones: 20, blessingStones: 2 },
  },
  {
    id: "reach-27",
    level: 27,
    title: "불멸의 문턱",
    description: "모든 보조 아이템을 써서 마지막 확률 싸움을 엽니다.",
    reward: { safeguardStones: 2, blessingStones: 2 },
  },
  {
    id: "reach-30",
    level: 30,
    title: "불멸의 검",
    description: "환생을 준비할 수 있는 최종 돌파입니다.",
    reward: { gold: 1_000_000, stones: 50, blessingStones: 3 },
  },
];

export function getUnclaimedMilestoneRewards(
  bestLevel: number,
  claimedIds: string[],
): MilestoneRewardDefinition[] {
  const claimed = new Set(claimedIds);

  return milestoneRewards.filter(
    (milestone) => bestLevel >= milestone.level && !claimed.has(milestone.id),
  );
}

export function sumMilestoneRewards(
  milestones: MilestoneRewardDefinition[],
): Required<MilestoneReward> {
  return milestones.reduce(
    (total, milestone) => ({
      gold: total.gold + (milestone.reward.gold ?? 0),
      stones: total.stones + (milestone.reward.stones ?? 0),
      protectionStones:
        total.protectionStones + (milestone.reward.protectionStones ?? 0),
      safeguardStones:
        total.safeguardStones + (milestone.reward.safeguardStones ?? 0),
      blessingStones:
        total.blessingStones + (milestone.reward.blessingStones ?? 0),
    }),
    {
      gold: 0,
      stones: 0,
      protectionStones: 0,
      safeguardStones: 0,
      blessingStones: 0,
    },
  );
}
