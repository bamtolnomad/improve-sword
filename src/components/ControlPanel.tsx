import {
  Archive,
  Coins,
  Flame,
  Gem,
  Hammer,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  applyBlessingStone,
  applySoulBurst,
  applySuccessBonus,
  getGreatFailureRate,
  getGreatSuccessRate,
} from "../core/enhancement";
import {
  SOUL_BURST_THRESHOLD,
  getEnhancementRow,
  getSellPriceForLevel,
  getSellStrategyForLevel,
} from "../core/enhancementTable";
import {
  PROTECTION_STONE_COST,
  getSalvageStonesForLevel,
  getStoredSwordGpsBonus,
} from "../core/economy";
import { formatNumber, formatPercent } from "../core/format";

interface ControlPanelProps {
  level: number;
  stones: number;
  soulMileage: number;
  canEnhance: boolean;
  onEnhance: () => void;
  onSell: () => void;
  onSalvage: () => void;
  onStore: () => void;
  protectionStones: number;
  safeguardStones: number;
  blessingStones: number;
  useProtectionStone: boolean;
  useSafeguardStone: boolean;
  useBlessingStone: boolean;
  onUseProtectionStoneChange: (enabled: boolean) => void;
  onUseSafeguardStoneChange: (enabled: boolean) => void;
  onUseBlessingStoneChange: (enabled: boolean) => void;
  successBonusRate: number;
}

export function ControlPanel({
  level,
  stones,
  soulMileage,
  canEnhance,
  onEnhance,
  onSell,
  onSalvage,
  onStore,
  protectionStones,
  safeguardStones,
  blessingStones,
  useProtectionStone,
  useSafeguardStone,
  useBlessingStone,
  onUseProtectionStoneChange,
  onUseSafeguardStoneChange,
  onUseBlessingStoneChange,
  successBonusRate,
}: ControlPanelProps) {
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
  const greatSuccessRate = displayedRow ? getGreatSuccessRate(displayedRow) : 0;
  const greatFailureRate = displayedRow ? getGreatFailureRate(displayedRow) : 0;
  const sellPrice = getSellPriceForLevel(level);
  const sellStrategy = getSellStrategyForLevel(level);
  const salvageStones = getSalvageStonesForLevel(level);
  const gpsBonus = getStoredSwordGpsBonus(level);
  const canSettleSword = level > 1;
  const dangerRate = displayedRow ? displayedRow.downRate + displayedRow.destroyRate : 0;
  const protectionProgressAfterSalvage = Math.min(
    PROTECTION_STONE_COST,
    stones + salvageStones,
  );
  const salvageHint =
    protectionProgressAfterSalvage >= PROTECTION_STONE_COST
      ? "보호석 가능"
      : `보호 ${protectionProgressAfterSalvage}/${PROTECTION_STONE_COST}`;
  const settlementHint =
    sellStrategy.band === "profit"
      ? "판매 대박"
      : sellStrategy.band === "recover"
        ? "판매 회수"
        : sellStrategy.band === "loss"
          ? "분해 우선"
          : "강화 우선";
  const getToggleClassName = (type: string, isDisabled: boolean, isActive: boolean) =>
    ["itemToggle", `${type}Toggle`, isDisabled ? "disabled" : "", isActive ? "active" : ""]
      .filter(Boolean)
      .join(" ");

  return (
    <section className="controlPanel" aria-label="강화 조작">
      <div className="panelTitle">
        <Flame size={17} />
        <span>대장간</span>
      </div>

      {row ? (
        <>
          <div className="forgeOdds">
            <div className="oddsPrimary">
              <span>성공률</span>
              <strong>{formatPercent(displayedRow!.successRate)}</strong>
            </div>
            <div>
              <span>위험</span>
              <strong>{formatPercent(dangerRate)}</strong>
            </div>
            <div>
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
              {` · ${settlementHint}`}
              {isSoulBurstReady ? " · 파괴 없음" : ""}
              {successBonusRate > 0 ? ` · 환생 +${successBonusRate.toFixed(1)}%p` : ""}
            </span>
          </div>

          <div className="fortuneLine">
            <Sparkles size={16} />
            <span>
              흥망성쇠 대성공 {formatPercent(greatSuccessRate)} · 대실패{" "}
              {formatPercent(greatFailureRate)}
            </span>
          </div>

          <div className="itemToggles">
            <label
              className={getToggleClassName(
                "protection",
                protectionStones <= 0,
                useProtectionStone && protectionStones > 0,
              )}
              title="파괴 방지 보호석"
            >
              <input
                type="checkbox"
                checked={useProtectionStone && protectionStones > 0}
                disabled={protectionStones <= 0}
                onChange={(event) => onUseProtectionStoneChange(event.target.checked)}
              />
              <span>
                <Shield size={14} />
                보호석
              </span>
              <strong>{protectionStones}</strong>
            </label>
            <label
              className={getToggleClassName(
                "safeguard",
                safeguardStones <= 0,
                useSafeguardStone && safeguardStones > 0,
              )}
              title="파괴와 하락 방지 수호석"
            >
              <input
                type="checkbox"
                checked={useSafeguardStone && safeguardStones > 0}
                disabled={safeguardStones <= 0}
                onChange={(event) => onUseSafeguardStoneChange(event.target.checked)}
              />
              <span>
                <ShieldCheck size={14} />
                수호석
              </span>
              <strong>{safeguardStones}</strong>
            </label>
            <label
              className={getToggleClassName(
                "blessing",
                blessingStones <= 0,
                useBlessingStone && blessingStones > 0,
              )}
              title="성공률 상승 축복석"
            >
              <input
                type="checkbox"
                checked={useBlessingStone && blessingStones > 0}
                disabled={blessingStones <= 0}
                onChange={(event) => onUseBlessingStoneChange(event.target.checked)}
              />
              <span>
                <Sparkles size={14} />
                축복석
              </span>
              <strong>{blessingStones}</strong>
            </label>
          </div>
        </>
      ) : (
        <div className="maxNotice">30단계 도달</div>
      )}

      <div className="actionStack">
        <button
          className="primaryButton enhanceAction"
          type="button"
          onClick={onEnhance}
          disabled={!row || !canEnhance}
        >
          <Hammer size={20} />
          <span>강화하기</span>
          {row ? <small>{formatNumber(row.cost)}G</small> : null}
        </button>
        <button
          className="secondaryButton sellAction"
          type="button"
          onClick={onSell}
          disabled={!canSettleSword}
        >
          <Coins size={19} />
          <span>판매</span>
          <small>
            {formatNumber(sellPrice)}G · {sellStrategy.label}
          </small>
        </button>
        <button
          className="secondaryButton salvageAction"
          type="button"
          onClick={onSalvage}
          disabled={!canSettleSword}
        >
          <Gem size={18} />
          <span>분해 +{formatNumber(salvageStones)}</span>
          <small>{salvageHint}</small>
        </button>
        <button
          className="secondaryButton storeAction"
          type="button"
          onClick={onStore}
          disabled={!canSettleSword}
        >
          <Archive size={18} />
          <span>보관</span>
          <small>+{gpsBonus.toFixed(1)}G/초</small>
        </button>
      </div>
    </section>
  );
}
