import { Archive, Clock, Coins } from "lucide-react";
import { formatNumber } from "../core/format";
import type { StoredSword } from "../core/types";

interface MetaPanelProps {
  gps: number;
  storedSwords: StoredSword[];
  offlineGold: number;
  offlineSeconds: number;
  onClaimOfflineReward: () => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}시간 ${minutes}분`;
  if (minutes > 0) return `${minutes}분 ${secs}초`;
  return `${secs}초`;
}

export function MetaPanel({
  gps,
  storedSwords,
  offlineGold,
  offlineSeconds,
  onClaimOfflineReward,
}: MetaPanelProps) {
  const highestStoredLevel = storedSwords.reduce(
    (highest, sword) => Math.max(highest, sword.level),
    0,
  );
  const latestStoredSwords = storedSwords.slice(-5).reverse();

  return (
    <section className="metaPanel" aria-label="보관과 방치 보상">
      <div className="panelTitle">
        <span>
          <Archive size={17} />
          보관
        </span>
        <strong>{storedSwords.length}자루</strong>
      </div>

      <div className="metaStats">
        <div>
          <span>초당 골드</span>
          <strong>{gps.toFixed(1)}G/초</strong>
        </div>
        <div>
          <span>최고 보관</span>
          <strong>{highestStoredLevel > 0 ? `+${highestStoredLevel}` : "-"}</strong>
        </div>
      </div>

      <div className="offlineBox">
        <div>
          <span>
            <Clock size={15} />
            누적 {formatDuration(offlineSeconds)}
          </span>
          <strong>{formatNumber(offlineGold)}G</strong>
        </div>
        <button type="button" onClick={onClaimOfflineReward}>
          <Coins size={17} />
          수령
        </button>
      </div>

      <div className="storedList" aria-label="최근 보관 검">
        {latestStoredSwords.length > 0 ? (
          latestStoredSwords.map((sword) => (
            <div key={sword.id}>
              <span>+{sword.level}</span>
              <strong>+{sword.gpsBonus.toFixed(1)}G/초</strong>
            </div>
          ))
        ) : (
          <p>아직 보관한 검이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
