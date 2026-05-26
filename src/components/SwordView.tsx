import { getSwordImagePath } from "../core/enhancementTable";
import type { EnhancementOutcome } from "../core/types";

interface SwordViewProps {
  level: number;
  lastOutcome?: EnhancementOutcome;
}

function outcomeClass(outcome?: EnhancementOutcome): string {
  return outcome ? `outcome-${outcome}` : "";
}

export function SwordView({ level, lastOutcome }: SwordViewProps) {
  return (
    <section className={`swordStage ${outcomeClass(lastOutcome)}`} aria-label="현재 검">
      <div className="stageHeader">
        <span>현재 검</span>
        <strong>+{level}</strong>
      </div>
      <div className="swordImageWrap">
        <img
          className="swordImage"
          src={getSwordImagePath(level)}
          alt={`${level}단계 검`}
          draggable={false}
        />
      </div>
    </section>
  );
}
