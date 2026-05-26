import { FlaskConical, PlusCircle, RotateCcw, StepForward } from "lucide-react";

interface DevPanelProps {
  level: number;
  onAddGold: (amount: number) => void;
  onAddStones: (amount: number) => void;
  onSetLevel: (level: number) => void;
  onStartDecisionSession: () => void;
  onReset: () => void;
}

export function DevPanel({
  level,
  onAddGold,
  onAddStones,
  onSetLevel,
  onStartDecisionSession,
  onReset,
}: DevPanelProps) {
  return (
    <section className="devPanel" aria-label="QA 도구">
      <div className="panelTitle">
        <span>QA</span>
      </div>
      <div className="devActions">
        <button className="wideAction" type="button" onClick={onStartDecisionSession}>
          <FlaskConical size={17} />
          2차 세션
        </button>
        <button type="button" onClick={() => onAddGold(100000)}>
          <PlusCircle size={17} />
          10만G
        </button>
        <button type="button" onClick={() => onAddStones(100)}>
          <PlusCircle size={17} />
          석 100
        </button>
        <button type="button" onClick={() => onSetLevel(level + 1)}>
          <StepForward size={17} />
          단계 +1
        </button>
        <button type="button" onClick={onReset}>
          <RotateCcw size={17} />
          리셋
        </button>
      </div>
    </section>
  );
}
