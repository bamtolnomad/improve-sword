import { Gem, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  BLESSING_STONE_COST,
  PROTECTION_STONE_COST,
  SAFEGUARD_STONE_COST,
} from "../core/economy";
import { formatNumber } from "../core/format";
import { playShopPurchase } from "../core/sound";

interface ItemShopProps {
  stones: number;
  protectionStones: number;
  safeguardStones: number;
  blessingStones: number;
  onBuyProtectionStone: () => void;
  onBuySafeguardStone: () => void;
  onBuyBlessingStone: () => void;
}

export function ItemShop({
  stones,
  protectionStones,
  safeguardStones,
  blessingStones,
  onBuyProtectionStone,
  onBuySafeguardStone,
  onBuyBlessingStone,
}: ItemShopProps) {
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const shopItems = [
    {
      key: "protection",
      Icon: Shield,
      name: "보호석",
      headline: "파괴 방지",
      description: "파괴 위험이 있는 강화에서 검 소실을 1회 막습니다.",
      count: protectionStones,
      cost: PROTECTION_STONE_COST,
      onBuy: onBuyProtectionStone,
      tag: "안전",
    },
    {
      key: "safeguard",
      Icon: ShieldCheck,
      name: "수호석",
      headline: "하락 방지",
      description: "실패로 단계가 내려가는 상황을 1회 막습니다.",
      count: safeguardStones,
      cost: SAFEGUARD_STONE_COST,
      onBuy: onBuySafeguardStone,
      tag: "고단계",
    },
    {
      key: "blessing",
      Icon: Sparkles,
      name: "축복석",
      headline: "성공 기원",
      description: "다음 강화의 대성공 확률을 올리고 대실패를 억제합니다.",
      count: blessingStones,
      cost: BLESSING_STONE_COST,
      onBuy: onBuyBlessingStone,
      tag: "공격",
    },
  ];

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleBuy = (item: (typeof shopItems)[number]) => {
    if (stones < item.cost) return;

    item.onBuy();
    playShopPurchase();
    setPurchaseToast(`+1 ${item.name}`);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setPurchaseToast(null);
      toastTimerRef.current = null;
    }, 900);
  };

  return (
    <section className="itemShop" aria-label="강화석 상점">
      <div className="shopHeader">
        <div>
          <span>
            <Gem size={18} />
            강화 비급
          </span>
          <strong>{formatNumber(stones)} 강화석</strong>
        </div>
        <p>다음 고비 전에 필요한 보조석을 확보하세요.</p>
      </div>
      <div className="shopItems">
        {shopItems.map((item) => {
          const canBuy = stones >= item.cost;
          const shortage = Math.max(item.cost - stones, 0);
          const Icon = item.Icon;

          return (
            <button
              key={item.key}
              className={`shopItem ${item.key}`}
              type="button"
              onClick={() => handleBuy(item)}
              disabled={!canBuy}
            >
              <div className="shopItemIcon">
                <Icon size={26} />
              </div>
              <div className="shopItemText">
                <span>
                  {item.name}
                  <em>{item.tag}</em>
                </span>
                <strong>{item.headline}</strong>
                <p>{item.description}</p>
              </div>
              <div className="shopItemMeta">
                <strong>{formatNumber(item.count)}개</strong>
                <em>강화석 {formatNumber(item.cost)}</em>
                <small className={canBuy ? "canBuy" : "shortage"}>
                  {canBuy ? "교환" : `${formatNumber(shortage)} 부족`}
                </small>
              </div>
            </button>
          );
        })}
      </div>
      {purchaseToast ? (
        <div className="shopPurchaseToast" role="status">
          {purchaseToast}
        </div>
      ) : null}
    </section>
  );
}
