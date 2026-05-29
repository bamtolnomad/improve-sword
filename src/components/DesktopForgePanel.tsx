import {
  Coins,
  Flame,
  Gem,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  applyBlessingStone,
  applySoulBurst,
  applySuccessBonus,
} from "../core/enhancement";
import {
  SOUL_BURST_THRESHOLD,
  getEnhancementRow,
  getSellPriceForLevel,
  getSellStrategyForLevel,
} from "../core/enhancementTable";
import { getSalvageStonesForLevel } from "../core/economy";
import { formatNumber, formatPercent } from "../core/format";
import { getNextSwordGrade, getSwordGrade, getSwordGradeProgress } from "../core/swordGrade";
import type { EnhancementAttemptRecord, EnhancementOutcome } from "../core/types";

interface DesktopForgePanelProps {
  level: number;
  soulMileage: number;
  attemptRecords: EnhancementAttemptRecord[];
  bestLevel: number;
  rebirthCount: number;
  protectionStones: number;
  safeguardStones: number;
  blessingStones: number;
  useBlessingStone: boolean;
  successBonusRate: number;
}

function outcomeLabel(outcome: EnhancementOutcome): string {
  switch (outcome) {
    case "great_success":
      return "대성공";
    case "success":
      return "성공";
    case "keep":
      return "유지";
    case "down":
      return "하락";
    case "destroyed":
      return "파괴";
    case "great_failure":
      return "대실패";
    case "protected":
      return "보호";
  }
}

function swordTitle(level: number): string {
  if (level >= 25) return "불멸의 검";
  if (level >= 20) return "심연의 검";
  if (level >= 15) return "룬 각인검";
  if (level >= 10) return "달궈진 검";
  if (level >= 5) return "벼린 검";
  return "수련용 검";
}

export function DesktopForgePanel({
  level,
  soulMileage,
  attemptRecords,
  bestLevel,
  rebirthCount,
  protectionStones,
  safeguardStones,
  blessingStones,
  useBlessingStone,
  successBonusRate,
}: DesktopForgePanelProps) {
  const row = getEnhancementRow(level);
  const isSoulBurstReady = soulMileage >= SOUL_BURST_THRESHOLD;
  const rowAfterSoul = row && isSoulBurstReady ? applySoulBurst(row) : row;
  const rowAfterBlessing =
    rowAfterSoul && useBlessingStone && blessingStones > 0
      ? applyBlessingStone(rowAfterSoul)
      : rowAfterSoul;
  const displayedRow = rowAfterBlessing
    ? applySuccessBonus(rowAfterBlessing, successBonusRate)
    : rowAfterBlessing;
  const dangerRate = displayedRow ? displayedRow.downRate + displayedRow.destroyRate : 0;
  const sellPrice = getSellPriceForLevel(level);
  const sellStrategy = getSellStrategyForLevel(level);
  const salvageStones = getSalvageStonesForLevel(level);
  const recentAttempts = attemptRecords.slice(-5).reverse();
  const grade = getSwordGrade(level);
  const nextGrade = getNextSwordGrade(level);
  const gradeProgress = getSwordGradeProgress(level);

  return (
    <section className="desktopForgePanel" aria-label="대장간 현황">
      <div className="forgePanelHero">
        <div className={`gradePill grade-${grade.id}`}>
          <span>{grade.label} 등급</span>
          <small>{nextGrade ? `다음 ${nextGrade.label} +${nextGrade.minLevel}` : "최종 등급"}</small>
          <i style={{ width: `${gradeProgress}%` }} aria-hidden="true" />
        </div>
        <strong>+{level} {swordTitle(level)}</strong>
        <p>{row ? "다음 망치질에 필요한 것만 남겼습니다." : "최고 단계에 도달했습니다."}</p>
      </div>

      <div className="forgePanelStats" aria-label="강화 핵심 정보">
        <div className="statEmphasis">
          <Flame size={17} />
          <span>성공</span>
          <strong>{displayedRow ? formatPercent(displayedRow.successRate) : "완성"}</strong>
        </div>
        <div>
          <ShieldAlert size={17} />
          <span>위험</span>
          <strong>{displayedRow ? formatPercent(dangerRate) : "0%"}</strong>
        </div>
        <div>
          <Coins size={17} />
          <span>비용</span>
          <strong>{row ? `${formatNumber(row.cost)}G` : "-"}</strong>
        </div>
        <div>
          <TrendingUp size={17} />
          <span>판매</span>
          <strong>{formatNumber(sellPrice)}G</strong>
        </div>
      </div>

      <div className="forgeDecisionStrip">
        <span className={`decisionBadge grade-${grade.id}`}>
          {grade.label}
        </span>
        <span className={`decisionBadge ${sellStrategy.band}`}>
          {sellStrategy.label}
        </span>
        <span>분해 +{formatNumber(salvageStones)}</span>
        <span>최고 +{bestLevel}</span>
        <span>환생 {rebirthCount}</span>
      </div>

      <div className="forgeSockets" aria-label="보조석">
        <div>
          <ShieldAlert size={16} />
          <span>보호</span>
          <strong>{formatNumber(protectionStones)}</strong>
        </div>
        <div>
          <Gem size={16} />
          <span>수호</span>
          <strong>{formatNumber(safeguardStones)}</strong>
        </div>
        <div>
          <Sparkles size={16} />
          <span>축복</span>
          <strong>{formatNumber(blessingStones)}</strong>
        </div>
      </div>

      <div className="recentForgeAttempts">
        <div className="contextTitle">
          <span>최근 망치질</span>
          <strong>{formatNumber(attemptRecords.length)}회</strong>
        </div>
        {recentAttempts.length > 0 ? (
          <div className="attemptChips" aria-label="최근 강화 결과">
            {recentAttempts.map((record) => (
              <span key={record.attempt} className={`attemptChip ${record.outcome}`}>
                +{record.nextLevel} {outcomeLabel(record.outcome)}
              </span>
            ))}
          </div>
        ) : (
          <p className="emptyForgeHint">첫 강화가 아직 화로 위에 남아 있습니다.</p>
        )}
      </div>
    </section>
  );
}
