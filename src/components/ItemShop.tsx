import { Gem, Shield, Sparkles } from "lucide-react";
import { BLESSING_STONE_COST, PROTECTION_STONE_COST } from "../core/economy";
import { formatNumber } from "../core/format";

interface ItemShopProps {
  stones: number;
  protectionStones: number;
  blessingStones: number;
  onBuyProtectionStone: () => void;
  onBuyBlessingStone: () => void;
}

export function ItemShop({
  stones,
  protectionStones,
  blessingStones,
  onBuyProtectionStone,
  onBuyBlessingStone,
}: ItemShopProps) {
  return (
    <section className="itemShop" aria-label="강화석 상점">
      <div className="panelTitle">
        <span>
          <Gem size={17} />
          강화석 상점
        </span>
        <strong>{formatNumber(stones)}</strong>
      </div>
      <div className="shopItems">
        <button
          type="button"
          onClick={onBuyProtectionStone}
          disabled={stones < PROTECTION_STONE_COST}
        >
          <Shield size={18} />
          <span>보호석</span>
          <strong>
            {protectionStones}개 · {PROTECTION_STONE_COST}
          </strong>
        </button>
        <button
          type="button"
          onClick={onBuyBlessingStone}
          disabled={stones < BLESSING_STONE_COST}
        >
          <Sparkles size={18} />
          <span>축복석</span>
          <strong>
            {blessingStones}개 · {BLESSING_STONE_COST}
          </strong>
        </button>
      </div>
    </section>
  );
}
