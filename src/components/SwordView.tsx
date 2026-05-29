import { Hammer } from "lucide-react";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { getSwordImagePath } from "../core/enhancementTable";
import { getNextSwordGrade, getSwordGrade, getSwordGradeProgress } from "../core/swordGrade";
import type { EnhancementOutcome } from "../core/types";

interface SwordViewProps {
  level: number;
  lastOutcome?: EnhancementOutcome;
  resultKey: number;
  ritualPhase?: "idle" | "charge" | "strike" | "resolve";
  ritualKey?: number;
}

function outcomeClass(outcome?: EnhancementOutcome): string {
  return outcome ? `outcome-${outcome}` : "";
}

function outcomeLabel(outcome?: EnhancementOutcome): string {
  switch (outcome) {
    case "great_success":
      return "대성공";
    case "success":
      return "강화 성공";
    case "keep":
      return "균열 유지";
    case "down":
      return "단계 하락";
    case "destroyed":
      return "강화 실패";
    case "great_failure":
      return "대실패";
    case "protected":
      return "보호 발동";
    default:
      return "화로 대기";
  }
}

function outcomeSubtitle(outcome: EnhancementOutcome): string {
  switch (outcome) {
    case "great_success":
      return "흥망성쇠의 기운이 두 단계를 끌어올렸습니다";
    case "success":
      return "금빛 기운이 검에 깃들었습니다";
    case "keep":
      return "검은 버텼지만 불꽃은 잠잠합니다";
    case "down":
      return "불안정한 기운이 단계를 깎았습니다";
    case "destroyed":
      return "화로의 기운을 견디지 못했습니다";
    case "great_failure":
      return "불길한 균열이 두 단계를 집어삼켰습니다";
    case "protected":
      return "보호석이 파괴를 막아냈습니다";
  }
}

function outcomeMark(outcome: EnhancementOutcome): string {
  switch (outcome) {
    case "great_success":
      return "盛";
    case "success":
      return "昇";
    case "keep":
      return "維";
    case "down":
      return "落";
    case "destroyed":
      return "破";
    case "great_failure":
      return "衰";
    case "protected":
      return "守";
  }
}

function cashoutGateLabel(level: number): string | null {
  if (level >= 11) return "판매 대박 구간";
  if (level === 10) return "다음 +11 판매 대박";
  if (level >= 6) return "+10 회수 목표";
  return null;
}

type SwordAuraTier = "dormant" | "ember" | "gold" | "storm" | "void" | "immortal";
type SwordElement = "none" | "fire" | "solar" | "storm" | "void";
type SwordSparkTier = "none" | "glint" | "radiant" | "mythic";

function swordAuraTier(level: number): SwordAuraTier {
  if (level >= 25) return "immortal";
  if (level >= 20) return "void";
  if (level >= 15) return "storm";
  if (level >= 10) return "gold";
  if (level >= 5) return "ember";
  return "dormant";
}

function swordElement(level: number): SwordElement {
  if (level >= 25) return "fire";
  if (level >= 20) return "void";
  if (level >= 15) return "storm";
  if (level >= 10) return "solar";
  if (level >= 5) return "fire";
  return "none";
}

function swordSparkTier(level: number): SwordSparkTier {
  if (level >= 25) return "mythic";
  if (level >= 18) return "radiant";
  if (level >= 10) return "glint";
  return "none";
}

export function SwordView({
  level,
  lastOutcome,
  resultKey,
  ritualPhase = "idle",
  ritualKey = 0,
}: SwordViewProps) {
  const gateLabel = cashoutGateLabel(level);
  const auraTier = swordAuraTier(level);
  const element = swordElement(level);
  const sparkTier = swordSparkTier(level);
  const grade = getSwordGrade(level);
  const nextGrade = getNextSwordGrade(level);
  const gradeProgress = getSwordGradeProgress(level);
  const stageRef = useRef<HTMLElement | null>(null);
  const [outcomeStyle, setOutcomeStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!lastOutcome) return;

    const syncOutcomePosition = () => {
      const stage = stageRef.current;
      const ring = stage?.querySelector<HTMLElement>(".forgeRing");
      if (!stage || !ring) return;

      const ringRect = ring.getBoundingClientRect();
      const ringSize = Math.max(ringRect.width, ringRect.height);
      setOutcomeStyle({
        "--outcome-center-x": `${ringRect.left + ringRect.width / 2}px`,
        "--outcome-center-y": `${ringRect.top + ringRect.height / 2}px`,
        "--outcome-ring-size": `${ringSize}px`,
        "--outcome-result-y": `${ringRect.top + ringRect.height * 0.72}px`,
      } as CSSProperties);
    };

    syncOutcomePosition();
    window.addEventListener("resize", syncOutcomePosition);
    window.addEventListener("scroll", syncOutcomePosition, true);

    return () => {
      window.removeEventListener("resize", syncOutcomePosition);
      window.removeEventListener("scroll", syncOutcomePosition, true);
    };
  }, [lastOutcome, resultKey]);

  const outcomeScene = lastOutcome ? (
    <div
      key={`${lastOutcome}-${resultKey}`}
      className={`outcomeScene outcomeSceneOverlay scene-${lastOutcome}`}
      style={outcomeStyle}
      aria-live="polite"
    >
      <div className="sceneWash" aria-hidden="true" />
      <div className="sealBurst" aria-hidden="true">
        <span>{outcomeMark(lastOutcome)}</span>
      </div>
      <div className="impactSlashes" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="outcomeParticles" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="brushResult">
        <strong>{outcomeLabel(lastOutcome)}</strong>
        <span>{outcomeSubtitle(lastOutcome)}</span>
      </div>
    </div>
  ) : null;

  return (
    <>
      <section
        ref={stageRef}
        className={`swordStage ${outcomeClass(lastOutcome)} ritual-${ritualPhase}`}
        aria-label="현재 검"
      >
        <div className="forgeRing" aria-hidden="true" />
        <div className="stageHeader">
          <span>{outcomeLabel(lastOutcome)}</span>
          <strong>+{level}</strong>
          <div className={`swordGradeBadge grade-${grade.id}`}>
            <span>{grade.label}</span>
            <small>
              {nextGrade ? `다음 ${nextGrade.label} +${nextGrade.minLevel}` : "최종 등급"}
            </small>
            <i style={{ width: `${gradeProgress}%` }} aria-hidden="true" />
          </div>
          {gateLabel ? (
            <em className={`cashoutGate ${level >= 11 ? "cashoutGateProfit" : ""}`}>
              {gateLabel}
            </em>
          ) : null}
        </div>
        <div
          className={`swordImageWrap auraWrap-${auraTier} element-${element} sparkWrap-${sparkTier}`}
        >
          <div className={`swordAura aura-${auraTier}`} aria-hidden="true" />
          <div className={`swordSparkles spark-${sparkTier}`} aria-hidden="true">
            {Array.from({ length: 24 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
          <img
            className="swordImage"
            src={getSwordImagePath(level)}
            alt={`${level}단계 검`}
            draggable={false}
          />
        </div>
        {ritualPhase !== "idle" ? (
          <div
            key={`sword-ritual-${ritualKey}`}
            className={`forgeRitualOverlay ritual-${ritualPhase}`}
            aria-hidden="true"
          >
            <div className="ritualHeat" />
            <div className="ritualHammerMark">
              <Hammer size={36} />
            </div>
            <div className="ritualSparkField">
              {Array.from({ length: 18 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <div className="ritualPulseText">
              {ritualPhase === "charge"
                ? "기운 응축"
                : ritualPhase === "strike"
                  ? "타격"
                  : "판정"}
            </div>
          </div>
        ) : null}
        <div className="emberLine" aria-hidden="true" />
      </section>
      {outcomeScene && typeof document !== "undefined"
        ? createPortal(outcomeScene, document.body)
        : outcomeScene}
    </>
  );
}
