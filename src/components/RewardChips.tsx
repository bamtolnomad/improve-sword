import {
  Coins,
  Gem,
  Hammer,
  Shield,
  ShieldCheck,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type RewardChipKind =
  | "gold"
  | "stone"
  | "protection"
  | "safeguard"
  | "blessing"
  | "tempering"
  | "mastery"
  | "crack";

export interface RewardChipItem {
  kind: RewardChipKind;
  label: string;
  value: string;
}

const rewardIcons: Record<RewardChipKind, LucideIcon> = {
  gold: Coins,
  stone: Gem,
  protection: Shield,
  safeguard: ShieldCheck,
  blessing: Sparkles,
  tempering: Sparkles,
  mastery: Hammer,
  crack: Waves,
};

interface RewardChipsProps {
  items: RewardChipItem[];
  compact?: boolean;
}

export function RewardChips({ items, compact = false }: RewardChipsProps) {
  if (items.length === 0) return null;

  return (
    <div className={`rewardChips ${compact ? "compact" : ""}`} aria-label="보상">
      {items.map((item) => {
        const Icon = rewardIcons[item.kind];

        return (
          <span key={`${item.kind}-${item.label}-${item.value}`} className={`rewardChip ${item.kind}`}>
            <Icon size={compact ? 13 : 15} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </span>
        );
      })}
    </div>
  );
}
