import { Coins, Gem, Gauge, Skull, Target } from "lucide-react";
import { SOUL_BURST_THRESHOLD } from "../core/enhancementTable";
import { formatNumber } from "../core/format";

interface HudProps {
  gold: number;
  stones: number;
  gps: number;
  soulMileage: number;
  totalAttempts: number;
}

export function Hud({ gold, stones, gps, soulMileage, totalAttempts }: HudProps) {
  const soulPercent = Math.min((soulMileage / SOUL_BURST_THRESHOLD) * 100, 100);

  return (
    <section className="hud" aria-label="플레이어 상태">
      <div className="hudItem">
        <Coins size={18} />
        <span>골드</span>
        <strong>{formatNumber(gold)}G</strong>
      </div>
      <div className="hudItem">
        <Gem size={18} />
        <span>강화석</span>
        <strong>{formatNumber(stones)}</strong>
      </div>
      <div className="hudItem">
        <Gauge size={18} />
        <span>GPS</span>
        <strong>{gps.toFixed(1)}</strong>
      </div>
      <div className="hudItem">
        <Target size={18} />
        <span>시도</span>
        <strong>{formatNumber(totalAttempts)}회</strong>
      </div>
      <div className="soulMeter">
        <div className="soulMeterHeader">
          <span>
            <Skull size={17} />
            원혼
          </span>
          <strong>
            {formatNumber(soulMileage)} / {SOUL_BURST_THRESHOLD}
          </strong>
        </div>
        <div className="meterTrack" aria-hidden="true">
          <div className="meterFill" style={{ width: `${soulPercent}%` }} />
        </div>
      </div>
    </section>
  );
}
