import { Coins, Gem, Skull, Target, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SOUL_BURST_THRESHOLD } from "../core/enhancementTable";
import { formatNumber } from "../core/format";

interface HudProps {
  gold: number;
  stones: number;
  gps: number;
  soulMileage: number;
  totalAttempts: number;
}

type HudDetailKey = "gold" | "stones" | "gps" | "attempts" | "soul";

export function Hud({ gold, stones, gps, soulMileage, totalAttempts }: HudProps) {
  const [activeDetail, setActiveDetail] = useState<HudDetailKey | null>(null);
  const soulPercent = Math.min((soulMileage / SOUL_BURST_THRESHOLD) * 100, 100);
  const isSoulBurstReady = soulMileage >= SOUL_BURST_THRESHOLD;
  const details = useMemo(
    () => ({
      gold: {
        Icon: Coins,
        title: "골드",
        value: `${formatNumber(gold)}G`,
        description: "강화 비용과 일부 성장 행동에 쓰는 기본 재화입니다.",
        rows: [
          ["주 사용처", "강화 비용"],
          ["획득처", "판매, 대장간 의뢰, 방치 보상"],
          ["현재 초당 획득", `${gps.toFixed(1)}G/초`],
        ],
      },
      stones: {
        Icon: Gem,
        title: "강화석",
        value: formatNumber(stones),
        description: "보호석, 수호석, 축복석으로 바꿔 고단계 강화 리스크를 줄입니다.",
        rows: [
          ["주 사용처", "상점 보조석 구매"],
          ["획득처", "분해, 광맥 채굴, 돌파 보상"],
          ["현재 보유", `${formatNumber(stones)}개`],
        ],
      },
      gps: {
        Icon: TrendingUp,
        title: "초당 골드",
        value: `${gps.toFixed(1)}G/초`,
        description: "보관한 검, 수집 진척도, 환생 보너스가 합쳐진 방치 수익입니다.",
        rows: [
          ["정산 방식", "오프라인 보상 수령 시 누적"],
          ["최대 누적", "12시간"],
          ["현재 속도", `${gps.toFixed(1)}G/초`],
        ],
      },
      attempts: {
        Icon: Target,
        title: "시도",
        value: `${formatNumber(totalAttempts)}회`,
        description: "강화 버튼을 누른 총 횟수입니다. 최근 결과와 밸런스 판단의 기준이 됩니다.",
        rows: [
          ["기록 대상", "성공, 유지, 하락, 파괴, 보호"],
          ["활용", "최근 망치질과 실험실 통계"],
          ["현재 누적", `${formatNumber(totalAttempts)}회`],
        ],
      },
      soul: {
        Icon: Skull,
        title: "원혼",
        value: isSoulBurstReady
          ? "폭주 준비"
          : `${formatNumber(soulMileage)} / ${SOUL_BURST_THRESHOLD}`,
        description: "실패의 잔열이 쌓이는 게이지입니다. 가득 차면 다음 강화에 폭주 보정이 걸립니다.",
        rows: [
          ["폭주 조건", `${SOUL_BURST_THRESHOLD} 원혼`],
          ["현재 진행", `${Math.floor(soulPercent)}%`],
          ["폭주 효과", "파괴 위험 억제와 성공 보정"],
        ],
      },
    }),
    [gold, gps, isSoulBurstReady, soulMileage, soulPercent, stones, totalAttempts],
  );

  useEffect(() => {
    if (!activeDetail) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDetail(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDetail]);

  const detail = activeDetail ? details[activeDetail] : null;
  const DetailIcon = detail?.Icon;

  return (
    <>
      <section className="hud" aria-label="플레이어 상태">
        <button
          className="hudItem resourceGold"
          type="button"
          onClick={() => setActiveDetail("gold")}
          aria-label="골드 설명 열기"
        >
          <Coins size={18} />
          <span>골드</span>
          <strong>{formatNumber(gold)}G</strong>
        </button>
        <button
          className="hudItem resourceStone"
          type="button"
          onClick={() => setActiveDetail("stones")}
          aria-label="강화석 설명 열기"
        >
          <Gem size={18} />
          <span>강화석</span>
          <strong>{formatNumber(stones)}</strong>
        </button>
        <button
          className="hudItem resourceIncome"
          type="button"
          onClick={() => setActiveDetail("gps")}
          aria-label="초당 골드 설명 열기"
        >
          <TrendingUp size={18} />
          <span>초당 골드</span>
          <strong>
            <span className="desktopValue">{gps.toFixed(1)}G/초</span>
            <span className="mobileValue">{gps.toFixed(1)}G</span>
          </strong>
        </button>
        <button
          className="hudItem resourceAttempt"
          type="button"
          onClick={() => setActiveDetail("attempts")}
          aria-label="시도 설명 열기"
        >
          <Target size={18} />
          <span>시도</span>
          <strong>{formatNumber(totalAttempts)}회</strong>
        </button>
        <button
          className={`soulMeter ${isSoulBurstReady ? "ready" : ""}`}
          type="button"
          onClick={() => setActiveDetail("soul")}
          aria-label="원혼 설명 열기"
        >
          <div className="soulMeterHeader">
            <span>
              <Skull size={17} />
              원혼
            </span>
            <strong>
              {isSoulBurstReady
                ? "폭주 준비"
                : `${formatNumber(soulMileage)} / ${SOUL_BURST_THRESHOLD}`}
            </strong>
          </div>
          <div className="meterTrack" aria-hidden="true">
            <div className="meterFill" style={{ width: `${soulPercent}%` }} />
          </div>
        </button>
      </section>

      {detail && DetailIcon ? (
        <div
          className="hudDetailScrim"
          role="presentation"
          onClick={() => setActiveDetail(null)}
        >
          <section
            className={`hudDetailPanel detail-${activeDetail}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hud-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="hudDetailClose"
              type="button"
              onClick={() => setActiveDetail(null)}
              aria-label="도움말 닫기"
            >
              <X size={18} />
            </button>
            <div className="hudDetailHead">
              <div className="hudDetailIcon" aria-hidden="true">
                <DetailIcon size={24} />
              </div>
              <div>
                <span>상태 도움말</span>
                <h2 id="hud-detail-title">{detail.title}</h2>
              </div>
            </div>
            <strong className="hudDetailValue">{detail.value}</strong>
            <p>{detail.description}</p>
            <dl>
              {detail.rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      ) : null}
    </>
  );
}
