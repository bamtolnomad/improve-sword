import { Archive, Coins, Gem, Hammer, Info, ShieldAlert } from "lucide-react";
import { applyBlessingStone, applySuccessBonus } from "../core/enhancement";
import { getEnhancementRow, getSellPriceForLevel } from "../core/enhancementTable";
import { getSalvageStonesForLevel, getStoredSwordGpsBonus } from "../core/economy";
import { formatNumber, formatPercent } from "../core/format";

interface ControlPanelProps {
  level: number;
  canEnhance: boolean;
  onEnhance: () => void;
  onSell: () => void;
  onSalvage: () => void;
  onStore: () => void;
  protectionStones: number;
  blessingStones: number;
  useProtectionStone: boolean;
  useBlessingStone: boolean;
  onUseProtectionStoneChange: (enabled: boolean) => void;
  onUseBlessingStoneChange: (enabled: boolean) => void;
  successBonusRate: number;
}

export function ControlPanel({
  level,
  canEnhance,
  onEnhance,
  onSell,
  onSalvage,
  onStore,
  protectionStones,
  blessingStones,
  useProtectionStone,
  useBlessingStone,
  onUseProtectionStoneChange,
  onUseBlessingStoneChange,
  successBonusRate,
}: ControlPanelProps) {
  const row = getEnhancementRow(level);
  const rowAfterBlessing = row && useBlessingStone && blessingStones > 0 ? applyBlessingStone(row) : row;
  const displayedRow = rowAfterBlessing ? applySuccessBonus(rowAfterBlessing, successBonusRate) : rowAfterBlessing;
  const sellPrice = getSellPriceForLevel(level);
  const salvageStones = getSalvageStonesForLevel(level);
  const gpsBonus = getStoredSwordGpsBonus(level);
  const canSettleSword = level > 1;

  return (
    <section className="controlPanel" aria-label="강화 조작">
      <div className="panelTitle">
        <Info size={17} />
        <span>강화 정보</span>
      </div>

      {row ? (
        <>
          <div className="rateGrid">
            <div className="rate success">
              <span>성공</span>
              <strong>{formatPercent(displayedRow!.successRate)}</strong>
            </div>
            <div className="rate neutral">
              <span>유지</span>
              <strong>{formatPercent(displayedRow!.keepRate)}</strong>
            </div>
            <div className="rate warning">
              <span>하락</span>
              <strong>{formatPercent(displayedRow!.downRate)}</strong>
            </div>
            <div className="rate danger">
              <span>파괴</span>
              <strong>{formatPercent(displayedRow!.destroyRate)}</strong>
            </div>
          </div>

          <div className="costLine">
            <span>강화 비용</span>
            <strong>{formatNumber(row.cost)}G</strong>
          </div>

          <div className="recommendLine">
            <ShieldAlert size={16} />
            <span>
              {displayedRow!.recommendedItem}
              {successBonusRate > 0 ? ` · 환생 +${successBonusRate.toFixed(1)}%p` : ""}
            </span>
          </div>

          <div className="itemToggles">
            <label className={protectionStones <= 0 ? "disabled" : ""}>
              <input
                type="checkbox"
                checked={useProtectionStone && protectionStones > 0}
                disabled={protectionStones <= 0}
                onChange={(event) => onUseProtectionStoneChange(event.target.checked)}
              />
              <span>보호석</span>
              <strong>{protectionStones}</strong>
            </label>
            <label className={blessingStones <= 0 ? "disabled" : ""}>
              <input
                type="checkbox"
                checked={useBlessingStone && blessingStones > 0}
                disabled={blessingStones <= 0}
                onChange={(event) => onUseBlessingStoneChange(event.target.checked)}
              />
              <span>축복석</span>
              <strong>{blessingStones}</strong>
            </label>
          </div>
        </>
      ) : (
        <div className="maxNotice">30단계 도달</div>
      )}

      <div className="actionStack">
        <button className="primaryButton" type="button" onClick={onEnhance} disabled={!row || !canEnhance}>
          <Hammer size={20} />
          강화
        </button>
        <button
          className="secondaryButton"
          type="button"
          onClick={onSell}
          disabled={!canSettleSword}
        >
          <Coins size={19} />
          판매 {formatNumber(sellPrice)}G
        </button>
        <button
          className="secondaryButton"
          type="button"
          onClick={onSalvage}
          disabled={!canSettleSword}
        >
          <Gem size={18} />
          분해 {formatNumber(salvageStones)}
        </button>
        <button
          className="secondaryButton"
          type="button"
          onClick={onStore}
          disabled={!canSettleSword}
        >
          <Archive size={18} />
          보관 GPS +{gpsBonus.toFixed(1)}
        </button>
      </div>
    </section>
  );
}
