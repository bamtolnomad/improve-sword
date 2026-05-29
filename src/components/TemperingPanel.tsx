import { Flame, Hammer, ShieldAlert, Sparkles, Waves } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPublicAssetPath } from "../core/assets";
import {
  TEMPERING_DAILY_FREE_ATTEMPTS,
  getTemperingExpToNext,
  getTemperingGradeLabel,
  getTodayKey,
  type TemperingAttemptResult,
} from "../core/tempering";
import type { TemperingBuff, TemperingRecord, TemperingScores } from "../core/types";
import { RewardChips } from "./RewardChips";

type TemperingPhaseKey = "heat" | "hammer" | "quench" | "polish";

interface TemperingPhase {
  key: TemperingPhaseKey;
  label: string;
  verb: string;
  hint: string;
  sprite: string;
  target: number;
  period: number;
  hits: number;
}

interface TemperingPanelProps {
  masteryLevel: number;
  masteryExp: number;
  dailyAttemptsUsed: number;
  dailyAttemptsDate: string;
  crackResearch: number;
  shards: number;
  buffs: TemperingBuff[];
  history: TemperingRecord[];
  onCompleteTempering: (scores: TemperingScores) => TemperingAttemptResult | null;
}

const phases: TemperingPhase[] = [
  {
    key: "heat",
    label: "가열",
    verb: "불 올리기",
    hint: "붉은 열이 노란 구간에 닿을 때 누르세요.",
    sprite: getPublicAssetPath("assets/tempering/furnace.svg"),
    target: 0.72,
    period: 1850,
    hits: 1,
  },
  {
    key: "hammer",
    label: "망치질",
    verb: "내리치기",
    hint: "세 번의 타격을 중앙 박자에 맞추세요.",
    sprite: getPublicAssetPath("assets/tempering/hammer.svg"),
    target: 0.5,
    period: 1280,
    hits: 3,
  },
  {
    key: "quench",
    label: "담금질",
    verb: "담그기",
    hint: "과열되기 직전 물에 넣으면 등급이 크게 오릅니다.",
    sprite: getPublicAssetPath("assets/tempering/quench-tub.svg"),
    target: 0.38,
    period: 1540,
    hits: 1,
  },
  {
    key: "polish",
    label: "연마",
    verb: "연마하기",
    hint: "칼날선이 빛나는 지점에 맞춰 마무리하세요.",
    sprite: getPublicAssetPath("assets/tempering/whetstone.svg"),
    target: 0.62,
    period: 1700,
    hits: 1,
  },
];

function getCursorScore(cursor: number, target: number): number {
  const distance = Math.abs(cursor - target);
  return Math.max(0, Math.round(100 - distance * 260));
}

function getScoreLabel(score: number): string {
  if (score >= 92) return "완벽";
  if (score >= 78) return "정확";
  if (score >= 58) return "보통";
  if (score >= 38) return "불안";
  return "균열";
}

function getGradeClass(grade: string): string {
  return grade === "master" ? "master" : grade.toLowerCase();
}

export function TemperingPanel({
  masteryLevel,
  masteryExp,
  dailyAttemptsUsed,
  dailyAttemptsDate,
  crackResearch,
  shards,
  buffs,
  history,
  onCompleteTempering,
}: TemperingPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [scores, setScores] = useState<Partial<TemperingScores>>({});
  const [phaseHits, setPhaseHits] = useState<number[]>([]);
  const [result, setResult] = useState<TemperingAttemptResult | null>(null);
  const frameRef = useRef<number | null>(null);
  const phaseStartRef = useRef(0);
  const phase = phases[phaseIndex];
  const todayAttemptsUsed = dailyAttemptsDate === getTodayKey() ? dailyAttemptsUsed : 0;
  const remainingAttempts = Math.max(0, TEMPERING_DAILY_FREE_ATTEMPTS - todayAttemptsUsed);
  const expToNext = getTemperingExpToNext(masteryLevel);
  const expProgress = masteryLevel >= 30 ? 1 : Math.min(1, masteryExp / expToNext);
  const phaseProgress = (phaseIndex + (phaseHits.length / phase.hits)) / phases.length;
  const previewScore = getCursorScore(cursor, phase.target);
  const canStart = remainingAttempts > 0 && !isPlaying;
  const scoreList = useMemo(
    () =>
      [
        { label: "가열", value: scores.heatScore },
        { label: "망치", value: scores.hammerScore },
        { label: "담금", value: scores.quenchScore },
        { label: "연마", value: scores.polishScore },
      ],
    [scores],
  );

  useEffect(() => {
    if (!isPlaying) return;

    const tick = (time: number) => {
      if (phaseStartRef.current <= 0) {
        phaseStartRef.current = time;
      }

      const elapsed = time - phaseStartRef.current;
      const angle = (elapsed / phase.period) * Math.PI * 2 - Math.PI / 2;
      setCursor((Math.sin(angle) + 1) / 2);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isPlaying, phase.period]);

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "Enter") return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("button, input, textarea, select")) return;

      event.preventDefault();
      handlePhaseAction();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const startRun = () => {
    if (!canStart) return;

    setIsPlaying(true);
    setPhaseIndex(0);
    setCursor(0);
    setScores({});
    setPhaseHits([]);
    setResult(null);
    phaseStartRef.current = 0;
  };

  const stopRun = () => {
    setIsPlaying(false);
    setPhaseHits([]);
    phaseStartRef.current = 0;
  };

  const finishRun = (nextScores: TemperingScores) => {
    stopRun();
    setScores(nextScores);
    const nextResult = onCompleteTempering(nextScores);
    setResult(nextResult);
  };

  const advancePhase = (nextScores: Partial<TemperingScores>) => {
    if (phaseIndex >= phases.length - 1) {
      finishRun(nextScores as TemperingScores);
      return;
    }

    setScores(nextScores);
    setPhaseIndex((index) => index + 1);
    setPhaseHits([]);
    phaseStartRef.current = 0;
  };

  function handlePhaseAction() {
    if (!isPlaying) return;

    const score = getCursorScore(cursor, phase.target);
    if (phase.key === "hammer") {
      const nextHits = [...phaseHits, score];
      if (nextHits.length < phase.hits) {
        setPhaseHits(nextHits);
        phaseStartRef.current = 0;
        return;
      }

      const hammerScore = Math.round(
        nextHits.reduce((sum, value) => sum + value, 0) / nextHits.length,
      );
      advancePhase({ ...scores, hammerScore });
      return;
    }

    const scoreKey = `${phase.key}Score` as keyof TemperingScores;
    advancePhase({ ...scores, [scoreKey]: score });
  }

  return (
    <section className="temperingPanel" aria-label="담금질 숙련">
      <div className="temperingHero">
        <div>
          <span className="temperingEyebrow">담금질 숙련</span>
          <strong>대장장이의 감각을 벼린다</strong>
          <p>짧은 담금질 작업으로 다음 강화에 적용되는 기운과 영구 숙련을 얻습니다.</p>
        </div>
        <div className="temperingAttemptBadge">
          <Flame size={16} />
          <span>{remainingAttempts}/{TEMPERING_DAILY_FREE_ATTEMPTS}</span>
        </div>
      </div>

      <div className="temperingMastery">
        <div>
          <span>숙련 Lv.{masteryLevel}</span>
          <strong>{masteryLevel >= 30 ? "명장" : `${masteryExp} / ${expToNext}`}</strong>
        </div>
        <div className="temperingExpTrack">
          <div style={{ width: `${Math.round(expProgress * 100)}%` }} />
        </div>
      </div>

      <div className={`temperingStage ${isPlaying ? "playing" : ""}`}>
        <div className="temperingWorkbench" aria-hidden="true">
          <img
            src={isPlaying ? phase.sprite : getPublicAssetPath("assets/tempering/tempered-blade.svg")}
            alt=""
            draggable={false}
          />
          <span className="temperingHeatGlow" />
          <span className="temperingSpark sparkA" />
          <span className="temperingSpark sparkB" />
          <span className="temperingSpark sparkC" />
        </div>

        <div className="temperingReadout">
          <span>{isPlaying ? phase.label : "작업대"}</span>
          <strong>
            {isPlaying
              ? `${phase.verb} · ${getScoreLabel(previewScore)}`
              : result
                ? `${getTemperingGradeLabel(result.record.grade)} 담금질`
                : "오늘의 담금질 준비"}
          </strong>
          <p>{isPlaying ? phase.hint : "가열, 망치질, 담금질, 연마를 순서대로 맞춥니다."}</p>
        </div>

        <div className="temperingMeter" aria-label="담금질 타이밍">
          <span
            className="temperingTarget"
            style={{ left: `${Math.round(phase.target * 100)}%` }}
          />
          <span className="temperingCursor" style={{ left: `${Math.round(cursor * 100)}%` }} />
        </div>

        <div className="temperingPhaseTrack" aria-hidden="true">
          <div style={{ width: `${Math.round(phaseProgress * 100)}%` }} />
        </div>

        <button
          className={`temperingActionButton ${!isPlaying && canStart ? "hasActionDot" : ""}`}
          type="button"
          onClick={isPlaying ? handlePhaseAction : startRun}
          disabled={!isPlaying && !canStart}
        >
          {!isPlaying && canStart ? <i className="actionDot" aria-hidden="true" /> : null}
          {isPlaying ? (
            <>
              <Hammer size={18} />
              {phase.verb}
            </>
          ) : remainingAttempts <= 0 ? (
            <>
              <ShieldAlert size={18} />
              오늘 작업 완료
            </>
          ) : (
            <>
              <Flame size={18} />
              담금질 시작
            </>
          )}
        </button>
      </div>

      <div className="temperingScoreGrid" aria-label="담금질 점수">
        {scoreList.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value === undefined ? "-" : item.value}</strong>
          </div>
        ))}
      </div>

      {result ? (
        <div className={`temperingResult grade-${getGradeClass(result.record.grade)}`} role="status">
          <div>
            <span>결과</span>
            <strong>{getTemperingGradeLabel(result.record.grade)}</strong>
          </div>
          <RewardChips
            compact
            items={[
              {
                kind: "mastery",
                label: "숙련",
                value: `+${result.record.masteryExpGained}`,
              },
              {
                kind: "tempering",
                label: "조각",
                value: `+${result.record.shardsGained}`,
              },
              result.record.buff
                ? {
                    kind: "blessing",
                    label: "기운",
                    value: result.record.buff.label,
                  }
                : {
                    kind: "crack",
                    label: "균열",
                    value: "연구 누적",
                  },
            ]}
          />
        </div>
      ) : null}

      <div className="temperingBuffShelf" aria-label="담금질 상태">
        <div>
          <Sparkles size={16} />
          <span>담금질 조각</span>
          <strong>{shards}</strong>
        </div>
        <div>
          <Waves size={16} />
          <span>균열 연구</span>
          <strong>{crackResearch}/8</strong>
        </div>
      </div>

      <div className="temperingBuffList" aria-label="활성 담금질 버프">
        <span>활성 기운</span>
        {buffs.length > 0 ? (
          buffs.map((buff) => (
            <div key={buff.id}>
              <strong>{buff.label}</strong>
              <small>
                성공 +{buff.successBonusRate}%p · 하락 -{buff.downRateReduction}%p · 파괴 -
                {buff.destroyRateReduction}%p · {buff.remainingEnhanceAttempts}회
              </small>
            </div>
          ))
        ) : (
          <p>담금질을 완료하면 다음 강화에 적용되는 기운이 생깁니다.</p>
        )}
      </div>

      <div className="temperingHistory" aria-label="최근 담금질">
        <span>최근 작업</span>
        {history.length > 0 ? (
          history.slice(0, 4).map((record) => (
            <div key={record.id}>
              <strong>{getTemperingGradeLabel(record.grade)}</strong>
              <small>점수 {record.totalScore} · 숙련 +{record.masteryExpGained}</small>
            </div>
          ))
        ) : (
          <p>아직 담금질 기록이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
