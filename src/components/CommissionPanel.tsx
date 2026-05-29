import {
  CheckCircle2,
  Coins,
  Gem,
  Gift,
  Hammer,
  PackageCheck,
  Pickaxe,
  Recycle,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Trophy,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import {
  getContractFortuneBonus,
  getContractRarityLabel,
  getDeliveryContractReward,
  getForgeContractTargets,
  getNextContractStreak,
  getPatronGiftReward,
  getRecoveryContractReward,
  getTodaysContractClaims,
  type ForgeContractId,
  type ForgeContractRarity,
  type ForgeContractReward,
  type ForgeContractRewardKind,
  type ForgeContractRewardResult,
} from "../core/contracts";
import {
  MINING_DURATION_MS,
  MINING_STONE_PITY_THRESHOLD,
  getMiningGoldReward,
  type MiningReward,
} from "../core/economy";
import { formatNumber } from "../core/format";
import { getTodayKey } from "../core/tempering";
import { RewardChips, type RewardChipItem } from "./RewardChips";

interface CommissionPanelProps {
  gold: number;
  stones: number;
  currentEnhancementCost: number;
  miningCooldownUntil: string | null;
  miningStonePity: number;
  bestLevel: number;
  swordLevel: number;
  blacksmithLevel: number;
  contractDailyDate: string;
  contractClaimsToday: ForgeContractId[];
  contractStreak: number;
  onMine: () => MiningReward | null;
  onClaimPatronGift: () => ForgeContractRewardResult | null;
  onCompleteDeliveryContract: () => ForgeContractRewardResult | null;
  onCompleteRecoveryContract: () => ForgeContractRewardResult | null;
}

function getRemainingMs(cooldownUntil: string | null, now: number): number {
  if (!cooldownUntil) return 0;

  const cooldownTime = new Date(cooldownUntil).getTime();
  if (!Number.isFinite(cooldownTime)) return 0;

  return Math.max(0, cooldownTime - now);
}

function getRewardItems(reward: ForgeContractReward): RewardChipItem[] {
  const items: RewardChipItem[] = [];

  if (reward.gold) {
    items.push({ kind: "gold", label: "골드", value: `${formatNumber(reward.gold)}G` });
  }
  if (reward.stones) {
    items.push({ kind: "stone", label: "강화석", value: `+${formatNumber(reward.stones)}` });
  }
  if (reward.protectionStones) {
    items.push({
      kind: "protection",
      label: "보호",
      value: `+${formatNumber(reward.protectionStones)}`,
    });
  }
  if (reward.safeguardStones) {
    items.push({
      kind: "safeguard",
      label: "수호",
      value: `+${formatNumber(reward.safeguardStones)}`,
    });
  }
  if (reward.blessingStones) {
    items.push({
      kind: "blessing",
      label: "축복",
      value: `+${formatNumber(reward.blessingStones)}`,
    });
  }
  if (reward.blacksmithExp) {
    items.push({
      kind: "mastery",
      label: "장인",
      value: `+${formatNumber(reward.blacksmithExp)}XP`,
    });
  }

  return items;
}

const rewardCardIcons: Record<ForgeContractRewardKind, typeof Coins> = {
  gold: Coins,
  stones: Gem,
  protectionStones: Shield,
  safeguardStones: ShieldCheck,
  blessingStones: Sparkles,
  blacksmithExp: Hammer,
};

function getRarityRank(rarity: ForgeContractRarity): number {
  switch (rarity) {
    case "legendary":
      return 4;
    case "epic":
      return 3;
    case "rare":
      return 2;
    case "common":
      return 1;
  }
}

function formatBonusCardValue(kind: ForgeContractRewardKind, value: number): string {
  if (kind === "gold") return `${formatNumber(value)}G`;
  if (kind === "blacksmithExp") return `+${formatNumber(value)}XP`;

  return `+${formatNumber(value)}`;
}

function ContractProgress({ current, target }: { current: number; target: number }) {
  const ratio = Math.min(1, current / Math.max(1, target));

  return (
    <div className="contractProgress" aria-label={`진행 ${current}/${target}`}>
      <span style={{ width: `${Math.round(ratio * 100)}%` }} />
      <strong>
        +{Math.min(current, target)} / +{target}
      </strong>
    </div>
  );
}

function ContractGachaReveal({
  title,
  result,
}: {
  title: string;
  result: ForgeContractRewardResult;
}) {
  const sortedCards = [...result.bonusCards].sort(
    (a, b) => getRarityRank(b.rarity) - getRarityRank(a.rarity),
  );

  return (
    <div className="contractGachaReveal" role="status">
      <div className="contractPackCore" aria-hidden="true">
        <span />
        <Sparkles size={24} />
      </div>
      <div className="contractGachaHeader">
        <span>계약 봉인 개봉</span>
        <strong>{title}</strong>
        <small>계약 행운 +{result.fortuneBonus}% · 룬 카드 3장</small>
      </div>
      <div className="gachaCardFan" aria-label="보너스 룬 카드">
        {sortedCards.map((card, index) => {
          const Icon = rewardCardIcons[card.kind];

          return (
            <div
              key={`${card.id}-${index}`}
              className={`gachaRewardCard ${card.rarity}`}
              style={{ "--card-index": index } as CSSProperties}
            >
              <div className="gachaCardBack" aria-hidden="true">
                <Star size={20} />
              </div>
              <div className="gachaCardFace">
                <span>{getContractRarityLabel(card.rarity)}</span>
                <Icon size={24} />
                <strong>{card.label}</strong>
                <em>{formatBonusCardValue(card.kind, card.value)}</em>
              </div>
            </div>
          );
        })}
      </div>
      <div className="contractRewardBurst">
        <Sparkles size={18} />
        <strong>총 보상</strong>
        <RewardChips items={getRewardItems(result.totalReward)} compact />
      </div>
    </div>
  );
}

export function CommissionPanel({
  gold,
  stones,
  currentEnhancementCost,
  miningCooldownUntil,
  miningStonePity,
  bestLevel,
  swordLevel,
  blacksmithLevel,
  contractDailyDate,
  contractClaimsToday,
  contractStreak,
  onMine,
  onClaimPatronGift,
  onCompleteDeliveryContract,
  onCompleteRecoveryContract,
}: CommissionPanelProps) {
  const [now, setNow] = useState(Date.now());
  const [isMining, setIsMining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MiningReward | null>(null);
  const [lastContractReward, setLastContractReward] = useState<{
    title: string;
    result: ForgeContractRewardResult;
  } | null>(null);
  const frameRef = useRef<number | null>(null);
  const todayKey = getTodayKey();
  const todaysClaims = getTodaysContractClaims(
    contractDailyDate ?? "",
    contractClaimsToday ?? [],
    todayKey,
  );
  const previewStreak = getNextContractStreak(
    contractDailyDate ?? "",
    contractClaimsToday ?? [],
    contractStreak ?? 0,
    todayKey,
  );
  const shownStreak = todaysClaims.length > 0 ? Math.max(1, contractStreak) : previewStreak;
  const targets = getForgeContractTargets(bestLevel);
  const patronClaimed = todaysClaims.includes("patron-gift");
  const deliveryClaimed = todaysClaims.includes("royal-delivery");
  const recoveryClaimed = todaysClaims.includes("recovery-order");
  const canClaimPatron = !patronClaimed;
  const canDeliver = swordLevel >= targets.deliveryTarget && !deliveryClaimed;
  const canRecover = swordLevel >= targets.recoveryTarget && !recoveryClaimed;
  const cooldownMs = getRemainingMs(miningCooldownUntil, now);
  const cooldownSeconds = Math.ceil(cooldownMs / 1000);
  const rewardGold = getMiningGoldReward(currentEnhancementCost);
  const nextStoneGuaranteed = miningStonePity >= MINING_STONE_PITY_THRESHOLD;
  const canMine = !isMining && cooldownMs <= 0;
  const patronReward = getPatronGiftReward(blacksmithLevel, previewStreak);
  const deliveryReward = getDeliveryContractReward(
    swordLevel,
    currentEnhancementCost,
    previewStreak,
  );
  const recoveryReward = getRecoveryContractReward(swordLevel, previewStreak);
  const fortuneBonus = getContractFortuneBonus(blacksmithLevel, previewStreak);
  const completedCount = todaysClaims.length;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(timer);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleContractAction = (
    title: string,
    action: () => ForgeContractRewardResult | null,
  ) => {
    const result = action();
    if (!result) return;

    setLastContractReward({ title, result });
  };

  const handleMine = () => {
    if (!canMine) return;

    const startedAt = performance.now();
    setResult(null);
    setProgress(0);
    setIsMining(true);

    const tick = (time: number) => {
      const nextProgress = Math.min(1, (time - startedAt) / MINING_DURATION_MS);
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        frameRef.current = null;
        const reward = onMine();
        setResult(reward);
        setIsMining(false);
        setProgress(0);
        setNow(Date.now());
        return;
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
  };

  return (
    <section className="commissionPanel" aria-label="장인의 계약소">
      <div className="contractHero">
        <div className="contractHeroText">
          <span className="commissionEyebrow">장인의 계약소</span>
          <strong>오늘의 의뢰서로 검의 운명을 정하세요</strong>
          <p>납품은 골드, 회수는 강화석, 후원은 매일 접속 보상을 줍니다.</p>
        </div>
        <div className="contractHeroSeal" aria-label={`계약 연속 ${shownStreak}일`}>
          <Trophy size={18} />
          <span>{shownStreak}일</span>
        </div>
        <div className="contractFortuneBadge" aria-label={`계약 행운 ${fortuneBonus}%`}>
          <Sparkles size={14} />
          <span>계약 행운 +{fortuneBonus}%</span>
        </div>
        <div className="commissionLedger" aria-label="보유 재화">
          <span>
            <Coins size={15} />
            {formatNumber(gold)}G
          </span>
          <span>
            <Gem size={15} />
            {formatNumber(stones)}
          </span>
        </div>
      </div>

      {lastContractReward ? (
        <ContractGachaReveal
          title={lastContractReward.title}
          result={lastContractReward.result}
        />
      ) : null}

      <div className="contractDeck" aria-label="오늘의 계약">
        <article
          className={`contractCard patron ${canClaimPatron ? "ready" : ""} ${
            patronClaimed ? "claimed" : ""
          }`}
        >
          <div className="contractSealMark" aria-hidden="true">
            {patronClaimed ? <CheckCircle2 size={22} /> : <Gift size={22} />}
          </div>
          <div className="contractCardText">
            <span>매일 후원</span>
            <strong>상단의 보급품</strong>
            <p>연속 계약일이 높을수록 보너스가 붙습니다.</p>
          </div>
          <RewardChips items={getRewardItems(patronReward)} compact />
          <button
            className={`contractButton ${canClaimPatron ? "hasActionDot" : ""}`}
            type="button"
            onClick={() => handleContractAction("상단의 보급품", onClaimPatronGift)}
            disabled={!canClaimPatron}
          >
            {canClaimPatron ? <i className="actionDot" aria-hidden="true" /> : null}
            {patronClaimed ? "수령 완료" : "후원 수령"}
          </button>
        </article>

        <article
          className={`contractCard delivery ${canDeliver ? "ready" : ""} ${
            deliveryClaimed ? "claimed" : ""
          }`}
        >
          <div className="contractSealMark" aria-hidden="true">
            {deliveryClaimed ? <CheckCircle2 size={22} /> : <PackageCheck size={22} />}
          </div>
          <div className="contractCardText">
            <span>골드 루트</span>
            <strong>왕국 근위대 납품</strong>
            <p>검을 넘겨 큰 골드와 일부 보조 재료를 받습니다.</p>
          </div>
          <ContractProgress current={swordLevel} target={targets.deliveryTarget} />
          <RewardChips items={getRewardItems(deliveryReward)} compact />
          <button
            className={`contractButton ${canDeliver ? "hasActionDot" : ""}`}
            type="button"
            onClick={() => handleContractAction("왕국 근위대 납품", onCompleteDeliveryContract)}
            disabled={!canDeliver}
          >
            {canDeliver ? <i className="actionDot" aria-hidden="true" /> : null}
            {deliveryClaimed ? "납품 완료" : canDeliver ? "납품 완료하기" : `+${targets.deliveryTarget} 필요`}
          </button>
        </article>

        <article
          className={`contractCard recovery ${canRecover ? "ready" : ""} ${
            recoveryClaimed ? "claimed" : ""
          }`}
        >
          <div className="contractSealMark" aria-hidden="true">
            {recoveryClaimed ? <CheckCircle2 size={22} /> : <Recycle size={22} />}
          </div>
          <div className="contractCardText">
            <span>강화석 루트</span>
            <strong>파손검 회수 명령</strong>
            <p>분해보다 많은 재료를 받고 다음 도전을 준비합니다.</p>
          </div>
          <ContractProgress current={swordLevel} target={targets.recoveryTarget} />
          <RewardChips items={getRewardItems(recoveryReward)} compact />
          <button
            className={`contractButton ${canRecover ? "hasActionDot" : ""}`}
            type="button"
            onClick={() => handleContractAction("파손검 회수 명령", onCompleteRecoveryContract)}
            disabled={!canRecover}
          >
            {canRecover ? <i className="actionDot" aria-hidden="true" /> : null}
            {recoveryClaimed ? "회수 완료" : canRecover ? "회수 완료하기" : `+${targets.recoveryTarget} 필요`}
          </button>
        </article>
      </div>

      <div className="miningJob">
        <div className="miningJobIcon" aria-hidden="true">
          <Pickaxe size={28} />
        </div>
        <div className="miningJobText">
          <span>막혔을 때 누르는 작업</span>
          <strong>광맥 기습 채굴</strong>
          <p>
            +{formatNumber(rewardGold)}G · 강화석 30% 확률 ·{" "}
            {nextStoneGuaranteed ? "다음 강화석 확정" : `보정 ${miningStonePity}/3`}
          </p>
        </div>
      </div>

      <div className="miningRewardGrid" aria-label="예상 보상">
        <div>
          <Coins size={16} />
          <span>골드</span>
          <strong>+{formatNumber(rewardGold)}G</strong>
        </div>
        <div>
          <Gem size={16} />
          <span>강화석</span>
          <strong>{nextStoneGuaranteed ? "1개 확정" : "1~3개"}</strong>
        </div>
        <div>
          <Sparkles size={16} />
          <span>오늘 계약</span>
          <strong>{completedCount}/3</strong>
        </div>
      </div>

      <div className={`miningProgress ${isMining ? "active" : ""}`}>
        <div style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>

      <button
        className={`miningButton ${canMine ? "hasActionDot" : ""}`}
        type="button"
        onClick={handleMine}
        disabled={!canMine}
      >
        {canMine ? <i className="actionDot" aria-hidden="true" /> : null}
        {isMining ? (
          <>
            <Hammer size={18} />
            채굴 중 {Math.round(progress * 100)}%
          </>
        ) : cooldownMs > 0 ? (
          <>
            <Timer size={18} />
            대기 {cooldownSeconds}초
          </>
        ) : (
          <>
            <Pickaxe size={18} />
            광맥 채굴
          </>
        )}
      </button>

      {result ? (
        <div className="miningResult" role="status">
          <strong>채굴 완료</strong>
          <RewardChips
            compact
            items={[
              { kind: "gold", label: "골드", value: `${formatNumber(result.gold)}G` },
              ...(result.stones > 0
                ? [
                    {
                      kind: "stone" as const,
                      label: result.pityTriggered ? "강화석 보정" : "강화석",
                      value: `+${formatNumber(result.stones)}`,
                    },
                  ]
                : [{ kind: "crack" as const, label: "보정", value: "누적" }]),
            ]}
          />
        </div>
      ) : null}
      <div className="contractFootnote" aria-hidden="true">
        <Shield size={13} />
        <span>납품은 골드, 회수는 강화석, 수호 계약은 고단계에서 등장합니다.</span>
        <ShieldCheck size={13} />
      </div>
    </section>
  );
}
