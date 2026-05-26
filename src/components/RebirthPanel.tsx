import { RotateCcw, Trophy } from "lucide-react";
import { MAX_SWORD_LEVEL } from "../core/enhancementTable";
import {
  canRebirth,
  getCollectionProgress,
  getRebirthGpsMultiplier,
  getRebirthSuccessBonus,
} from "../core/rebirth";

interface RebirthPanelProps {
  rebirthCount: number;
  bestLevel: number;
  discoveredLevels: number[];
  onRebirth: () => void;
}

export function RebirthPanel({
  rebirthCount,
  bestLevel,
  discoveredLevels,
  onRebirth,
}: RebirthPanelProps) {
  const unlocked = canRebirth(bestLevel);
  const progress = getCollectionProgress(discoveredLevels);
  const discoveredSet = new Set(discoveredLevels);
  const successBonus = getRebirthSuccessBonus(rebirthCount);
  const gpsMultiplier = getRebirthGpsMultiplier(rebirthCount);

  return (
    <section className="rebirthPanel" aria-label="환생과 도감">
      <div className="panelTitle">
        <span>
          <Trophy size={17} />
          환생
        </span>
        <strong>{rebirthCount}회</strong>
      </div>

      <div className="rebirthStats">
        <div>
          <span>최고 도달</span>
          <strong>+{bestLevel}</strong>
        </div>
        <div>
          <span>도감</span>
          <strong>
            {progress} / {MAX_SWORD_LEVEL}
          </strong>
        </div>
        <div>
          <span>성공률</span>
          <strong>+{successBonus.toFixed(1)}%p</strong>
        </div>
        <div>
          <span>초당 골드</span>
          <strong>x{gpsMultiplier.toFixed(1)}</strong>
        </div>
      </div>

      <div className="collectionGrid" aria-label="도감 단계">
        {Array.from({ length: MAX_SWORD_LEVEL }, (_, index) => index + 1).map((level) => (
          <span key={level} className={discoveredSet.has(level) ? "found" : ""}>
            {level}
          </span>
        ))}
      </div>

      <button className="rebirthButton" type="button" onClick={onRebirth} disabled={!unlocked}>
        <RotateCcw size={18} />
        {unlocked ? "환생하기" : "30단계 필요"}
      </button>
    </section>
  );
}
