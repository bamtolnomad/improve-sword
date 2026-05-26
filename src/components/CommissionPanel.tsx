import { Coins, Gem, Hammer, Sparkles, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MINING_DURATION_MS,
  MINING_STONE_PITY_THRESHOLD,
  getMiningGoldReward,
  type MiningReward,
} from "../core/economy";
import { formatNumber } from "../core/format";

interface CommissionPanelProps {
  gold: number;
  stones: number;
  currentEnhancementCost: number;
  miningCooldownUntil: string | null;
  miningStonePity: number;
  onMine: () => MiningReward | null;
}

function getRemainingMs(cooldownUntil: string | null, now: number): number {
  if (!cooldownUntil) return 0;

  const cooldownTime = new Date(cooldownUntil).getTime();
  if (!Number.isFinite(cooldownTime)) return 0;

  return Math.max(0, cooldownTime - now);
}

export function CommissionPanel({
  gold,
  stones,
  currentEnhancementCost,
  miningCooldownUntil,
  miningStonePity,
  onMine,
}: CommissionPanelProps) {
  const [now, setNow] = useState(Date.now());
  const [isMining, setIsMining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MiningReward | null>(null);
  const frameRef = useRef<number | null>(null);
  const cooldownMs = getRemainingMs(miningCooldownUntil, now);
  const cooldownSeconds = Math.ceil(cooldownMs / 1000);
  const rewardGold = getMiningGoldReward(currentEnhancementCost);
  const nextStoneGuaranteed = miningStonePity >= MINING_STONE_PITY_THRESHOLD;
  const canMine = !isMining && cooldownMs <= 0;

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
    <section className="commissionPanel" aria-label="대장간 의뢰">
      <div className="commissionHero">
        <div>
          <span className="commissionEyebrow">대장간 의뢰</span>
          <strong>광맥 채굴</strong>
          <p>강화가 막혔을 때 3초 작업으로 최소 자금을 확보합니다.</p>
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

      <div className="miningJob">
        <div className="miningJobIcon" aria-hidden="true">
          <Hammer size={28} />
        </div>
        <div className="miningJobText">
          <span>긴급 자금 루트</span>
          <strong>채굴 보상</strong>
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
          <span>보정</span>
          <strong>{nextStoneGuaranteed ? "발동 대기" : `${miningStonePity}/3`}</strong>
        </div>
      </div>

      <div className={`miningProgress ${isMining ? "active" : ""}`}>
        <div style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>

      <button
        className="miningButton"
        type="button"
        onClick={handleMine}
        disabled={!canMine}
      >
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
            <Hammer size={18} />
            채굴 시작
          </>
        )}
      </button>

      {result ? (
        <div className="miningResult" role="status">
          <strong>{formatNumber(result.gold)}G 획득</strong>
          <span>
            {result.stones > 0
              ? `강화석 +${formatNumber(result.stones)}${
                  result.pityTriggered ? " 보정 발동" : ""
                }`
              : "강화석 없음 · 보정 누적"}
          </span>
        </div>
      ) : null}
    </section>
  );
}
