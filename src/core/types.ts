export const ENHANCEMENT_OUTCOMES = [
  "great_success",
  "success",
  "keep",
  "down",
  "destroyed",
  "great_failure",
  "protected",
] as const;

export type EnhancementOutcome = (typeof ENHANCEMENT_OUTCOMES)[number];

export interface EnhancementRow {
  fromLevel: number;
  toLevel: number;
  successRate: number;
  keepRate: number;
  downRate: number;
  destroyRate: number;
  cost: number;
  sellPrice: number;
  salvageStones: number;
  destroyMileage: number;
  recommendedItem: string;
}

export interface EnhancementResult {
  outcome: EnhancementOutcome;
  nextLevel: number;
  spentGold: number;
  gainedStones: number;
  gainedSoulMileage: number;
  soulBurstUsed: boolean;
  protectionStoneUsed: boolean;
  safeguardStoneUsed: boolean;
  blessingStoneUsed: boolean;
  successBonusRate: number;
  row: EnhancementRow;
}

export interface GameLogEntry {
  id: string;
  message: string;
  tone: "success" | "neutral" | "warning" | "danger" | "system";
}

export interface StoredSword {
  id: string;
  level: number;
  storedAt: string;
  gpsBonus: number;
}

export interface EnhancementAttemptRecord {
  attempt: number;
  timestamp: string;
  fromLevel: number;
  targetLevel: number;
  outcome: EnhancementOutcome;
  nextLevel: number;
  cost: number;
  goldBefore: number;
  goldAfter: number;
  sellPriceBefore: number;
  stonesAfter: number;
  soulMileageBefore: number;
  soulMileageAfter: number;
  soulBurstUsed: boolean;
  protectionStoneUsed: boolean;
  safeguardStoneUsed: boolean;
  blessingStoneUsed: boolean;
  rebirthCount: number;
  successBonusRate: number;
}

export interface GameStateSnapshot {
  gold: number;
  stones: number;
  swordLevel: number;
  soulMileage: number;
  totalAttempts: number;
  storedSwords: StoredSword[];
  lastRewardAt: string;
  rebirthCount: number;
  bestLevel: number;
  discoveredLevels: number[];
}

export type PlaytestNoteCategory =
  | "friction"
  | "choice"
  | "economy"
  | "emotion"
  | "bug"
  | "idea";

export interface PlaytestNoteSnapshot {
  gold: number;
  stones: number;
  swordLevel: number;
  soulMileage: number;
  totalAttempts: number;
  bestLevel: number;
  rebirthCount: number;
  gps: number;
  storedSwordCount: number;
  protectionStones: number;
  safeguardStones: number;
  blessingStones: number;
}

export interface PlaytestNote {
  id: string;
  timestamp: string;
  category: PlaytestNoteCategory;
  text: string;
  snapshot: PlaytestNoteSnapshot;
}
