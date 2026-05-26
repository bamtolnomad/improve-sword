import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SOUL_BURST_THRESHOLD,
  getEnhancementRow,
  getSellPriceForLevel,
} from "../core/enhancementTable";
import { calculateEnhancementResult } from "../core/enhancement";
import {
  BLESSING_STONE_COST,
  MINING_COOLDOWN_MS,
  PROTECTION_STONE_COST,
  SAFEGUARD_STONE_COST,
  calculateGps,
  calculateOfflineReward,
  calculateMiningReward,
  getSalvageStonesForLevel,
  getStoredSwordGpsBonus,
  type MiningReward,
} from "../core/economy";
import { formatNumber } from "../core/format";
import {
  getUnclaimedMilestoneRewards,
  sumMilestoneRewards,
  type MilestoneReward,
} from "../core/milestones";
import {
  addDiscoveredLevel,
  canRebirth,
  getRebirthGpsMultiplier,
  getRebirthSuccessBonus,
} from "../core/rebirth";
import type {
  EnhancementAttemptRecord,
  EnhancementOutcome,
  GameLogEntry,
  PlaytestNote,
  PlaytestNoteCategory,
  StoredSword,
} from "../core/types";

const INITIAL_GOLD = 18000;
const LOG_LIMIT = 36;
const PLAYTEST_NOTE_LIMIT = 80;

interface GameStoreState {
  gold: number;
  stones: number;
  swordLevel: number;
  soulMileage: number;
  totalAttempts: number;
  lastOutcome?: EnhancementOutcome;
  logs: GameLogEntry[];
  attemptRecords: EnhancementAttemptRecord[];
  storedSwords: StoredSword[];
  lastRewardAt: string;
  protectionStones: number;
  safeguardStones: number;
  blessingStones: number;
  useProtectionStone: boolean;
  useSafeguardStone: boolean;
  useBlessingStone: boolean;
  rebirthCount: number;
  bestLevel: number;
  discoveredLevels: number[];
  milestoneRewardsClaimed: string[];
  playtestNotes: PlaytestNote[];
  miningCooldownUntil: string | null;
  miningStonePity: number;
  enhance: () => void;
  sellSword: () => void;
  salvageSword: () => void;
  completeMiningJob: () => MiningReward | null;
  storeSword: () => void;
  claimOfflineReward: () => void;
  buyProtectionStone: () => void;
  buySafeguardStone: () => void;
  buyBlessingStone: () => void;
  setUseProtectionStone: (enabled: boolean) => void;
  setUseSafeguardStone: (enabled: boolean) => void;
  setUseBlessingStone: (enabled: boolean) => void;
  rebirth: () => void;
  addGold: (amount: number) => void;
  addStones: (amount: number) => void;
  setSwordLevel: (level: number) => void;
  startDecisionSession: () => void;
  addPlaytestNote: (text: string, category: PlaytestNoteCategory) => void;
  clearPlaytestNotes: () => void;
  resetGame: () => void;
}

function createLog(message: string, tone: GameLogEntry["tone"]): GameLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    tone,
  };
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

function outcomeTone(outcome: EnhancementOutcome): GameLogEntry["tone"] {
  switch (outcome) {
    case "great_success":
    case "success":
      return "success";
    case "great_failure":
    case "destroyed":
      return "danger";
    case "down":
      return "warning";
    case "keep":
      return "neutral";
    case "protected":
      return "success";
  }
}

function trimLogs(logs: GameLogEntry[]): GameLogEntry[] {
  return logs.slice(0, LOG_LIMIT);
}

function createInitialState() {
  return {
    gold: INITIAL_GOLD,
    stones: 0,
    swordLevel: 1,
    soulMileage: 0,
    totalAttempts: 0,
    lastOutcome: undefined,
    logs: [createLog("검 한 자루와 18,000G로 시작합니다.", "system")],
    attemptRecords: [],
    storedSwords: [],
    lastRewardAt: new Date().toISOString(),
    protectionStones: 0,
    safeguardStones: 0,
    blessingStones: 0,
    useProtectionStone: false,
    useSafeguardStone: false,
    useBlessingStone: false,
    rebirthCount: 0,
    bestLevel: 1,
    discoveredLevels: [1],
    milestoneRewardsClaimed: [],
    playtestNotes: [],
    miningCooldownUntil: null,
    miningStonePity: 0,
  };
}

function formatRewardSummary(reward: MilestoneReward): string {
  return [
    reward.gold ? `${formatNumber(reward.gold)}G` : "",
    reward.stones ? `강화석 +${formatNumber(reward.stones)}` : "",
    reward.protectionStones ? `보호석 +${formatNumber(reward.protectionStones)}` : "",
    reward.safeguardStones ? `수호석 +${formatNumber(reward.safeguardStones)}` : "",
    reward.blessingStones ? `축복석 +${formatNumber(reward.blessingStones)}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      enhance: () => {
        const state = get();
        const protectionStones = state.protectionStones ?? 0;
        const safeguardStones = state.safeguardStones ?? 0;
        const blessingStones = state.blessingStones ?? 0;
        const shouldUseProtection = state.useProtectionStone && protectionStones > 0;
        const shouldUseSafeguard = state.useSafeguardStone && safeguardStones > 0;
        const shouldUseBlessing = state.useBlessingStone && blessingStones > 0;
        const rebirthCount = state.rebirthCount ?? 0;
        const discoveredLevels = state.discoveredLevels ?? [1];
        const bestLevel = state.bestLevel ?? state.swordLevel;
        const successBonusRate = getRebirthSuccessBonus(rebirthCount);
        const result = calculateEnhancementResult(
          state.swordLevel,
          state.soulMileage,
          Math.random(),
          {
            useProtectionStone: shouldUseProtection,
            useSafeguardStone: shouldUseSafeguard,
            useBlessingStone: shouldUseBlessing,
            successBonusRate,
          },
        );

        if (!result) {
          set({
            logs: trimLogs([
              createLog("30단계 검입니다. 판매하거나 다음 시스템을 기다려야 합니다.", "system"),
              ...state.logs,
            ]),
          });
          return;
        }

        if (state.gold < result.spentGold) {
          set({
            logs: trimLogs([
              createLog(
                `골드가 부족합니다. 필요 ${formatNumber(result.spentGold)}G`,
                "warning",
              ),
              ...state.logs,
            ]),
          });
          return;
        }

        const beforeLevel = state.swordLevel;
        const nextSoulMileage = result.soulBurstUsed
          ? Math.max(0, state.soulMileage - SOUL_BURST_THRESHOLD) + result.gainedSoulMileage
          : state.soulMileage + result.gainedSoulMileage;
        const goldAfter = state.gold - result.spentGold;
        const stonesAfter = state.stones + result.gainedStones;
        const nextAttempt = state.totalAttempts + 1;
        const nextBestLevel = Math.max(bestLevel, result.nextLevel);
        const nextDiscoveredLevels = addDiscoveredLevel(
          addDiscoveredLevel(discoveredLevels, beforeLevel),
          result.nextLevel,
        );
        const claimedMilestones = state.milestoneRewardsClaimed ?? [];
        const newMilestones = getUnclaimedMilestoneRewards(
          nextBestLevel,
          claimedMilestones,
        );
        const milestoneReward = sumMilestoneRewards(newMilestones);
        const milestoneLogs = newMilestones.map((milestone) =>
          createLog(
            `돌파 의뢰 완료: +${milestone.level} ${milestone.title}. ${formatRewardSummary(milestone.reward)} 획득.`,
            "success",
          ),
        );
        const attemptRecord: EnhancementAttemptRecord = {
          attempt: nextAttempt,
          timestamp: new Date().toISOString(),
          fromLevel: beforeLevel,
          targetLevel: result.row.toLevel,
          outcome: result.outcome,
          nextLevel: result.nextLevel,
          cost: result.spentGold,
          goldBefore: state.gold,
          goldAfter: goldAfter + milestoneReward.gold,
          sellPriceBefore: getSellPriceForLevel(beforeLevel),
          stonesAfter: stonesAfter + milestoneReward.stones,
          soulMileageBefore: state.soulMileage,
          soulMileageAfter: nextSoulMileage,
          soulBurstUsed: result.soulBurstUsed,
          protectionStoneUsed: result.protectionStoneUsed,
          safeguardStoneUsed: result.safeguardStoneUsed,
          blessingStoneUsed: result.blessingStoneUsed,
          rebirthCount,
          successBonusRate: result.successBonusRate,
        };
        const burstText = result.soulBurstUsed ? " 원혼 폭주 발동." : "";
        const itemText = [
          result.blessingStoneUsed ? "축복석 -1" : "",
          result.protectionStoneUsed ? "보호석 -1" : "",
          result.safeguardStoneUsed ? "수호석 -1" : "",
        ]
          .filter(Boolean)
          .join(", ");
        const targetLevelText =
          result.outcome === "great_success" || result.outcome === "great_failure"
            ? result.nextLevel
            : result.row.toLevel;
        const rewardText =
          result.gainedStones > 0 || result.gainedSoulMileage > 0
            ? ` 강화석 +${result.gainedStones}, 원혼 +${result.gainedSoulMileage}.`
            : "";

        console.info("[enhance]", {
          from: beforeLevel,
          to: result.nextLevel,
          outcome: result.outcome,
          spentGold: result.spentGold,
          remainingGold: goldAfter,
          soulBurstUsed: result.soulBurstUsed,
          protectionStoneUsed: result.protectionStoneUsed,
          safeguardStoneUsed: result.safeguardStoneUsed,
          blessingStoneUsed: result.blessingStoneUsed,
          successBonusRate,
        });

        set({
          gold: goldAfter + milestoneReward.gold,
          stones: stonesAfter + milestoneReward.stones,
          protectionStones:
            protectionStones -
            (result.protectionStoneUsed ? 1 : 0) +
            milestoneReward.protectionStones,
          safeguardStones:
            safeguardStones -
            (result.safeguardStoneUsed ? 1 : 0) +
            milestoneReward.safeguardStones,
          blessingStones:
            blessingStones -
            (result.blessingStoneUsed ? 1 : 0) +
            milestoneReward.blessingStones,
          swordLevel: result.nextLevel,
          soulMileage: nextSoulMileage,
          totalAttempts: nextAttempt,
          bestLevel: nextBestLevel,
          discoveredLevels: nextDiscoveredLevels,
          milestoneRewardsClaimed: [
            ...claimedMilestones,
            ...newMilestones.map((milestone) => milestone.id),
          ],
          lastOutcome: result.outcome,
          attemptRecords: [...state.attemptRecords, attemptRecord],
          logs: trimLogs([
            ...milestoneLogs,
            createLog(
              `${beforeLevel}->${targetLevelText} ${outcomeLabel(result.outcome)}.${burstText}${itemText ? ` ${itemText}.` : ""}${rewardText}`,
              outcomeTone(result.outcome),
            ),
            ...state.logs,
          ]),
        });
      },
      sellSword: () => {
        const state = get();
        if (state.swordLevel <= 1) {
          set({
            logs: trimLogs([
              createLog("2단계 이상부터 판매할 수 있습니다.", "warning"),
              ...state.logs,
            ]),
          });
          return;
        }

        const sellPrice = getSellPriceForLevel(state.swordLevel);

        console.info("[sell]", {
          level: state.swordLevel,
          sellPrice,
          goldAfterSell: state.gold + sellPrice,
        });

        set({
          gold: state.gold + sellPrice,
          swordLevel: 1,
          lastOutcome: undefined,
          logs: trimLogs([
            createLog(
              `${state.swordLevel}단계 검을 ${formatNumber(sellPrice)}G에 판매했습니다.`,
              "success",
            ),
            ...state.logs,
          ]),
        });
      },
      salvageSword: () => {
        const state = get();
        if (state.swordLevel <= 1) {
          set({
            logs: trimLogs([
              createLog("2단계 이상부터 분해할 수 있습니다.", "warning"),
              ...state.logs,
            ]),
          });
          return;
        }

        const salvageStones = getSalvageStonesForLevel(state.swordLevel);

        console.info("[salvage]", {
          level: state.swordLevel,
          salvageStones,
          stonesAfter: state.stones + salvageStones,
        });

        set({
          stones: state.stones + salvageStones,
          swordLevel: 1,
          lastOutcome: undefined,
          logs: trimLogs([
            createLog(
              `${state.swordLevel}단계 검을 분해해 강화석 ${formatNumber(salvageStones)}개를 얻었습니다.`,
              salvageStones > 0 ? "success" : "neutral",
            ),
            ...state.logs,
          ]),
        });
      },
      completeMiningJob: () => {
        const state = get();
        const cooldownTime = state.miningCooldownUntil
          ? new Date(state.miningCooldownUntil).getTime()
          : 0;

        if (Number.isFinite(cooldownTime) && cooldownTime > Date.now()) {
          const remainingSeconds = Math.ceil((cooldownTime - Date.now()) / 1000);
          set({
            logs: trimLogs([
              createLog(`광맥 채굴 준비 중입니다. ${remainingSeconds}초 후 가능.`, "warning"),
              ...state.logs,
            ]),
          });
          return null;
        }

        const row = getEnhancementRow(state.swordLevel);
        const reward = calculateMiningReward(row?.cost ?? 0, state.miningStonePity ?? 0);
        const cooldownUntil = new Date(Date.now() + MINING_COOLDOWN_MS).toISOString();
        const stoneText =
          reward.stones > 0
            ? `, 강화석 +${formatNumber(reward.stones)}${
                reward.pityTriggered ? " 보정" : ""
              }`
            : "";

        set({
          gold: state.gold + reward.gold,
          stones: state.stones + reward.stones,
          miningStonePity: reward.nextPity,
          miningCooldownUntil: cooldownUntil,
          logs: trimLogs([
            createLog(
              `광맥 채굴 완료: ${formatNumber(reward.gold)}G${stoneText}.`,
              reward.stones > 0 ? "success" : "system",
            ),
            ...state.logs,
          ]),
        });

        return reward;
      },
      storeSword: () => {
        const state = get();
        if (state.swordLevel <= 1) {
          set({
            logs: trimLogs([
              createLog("2단계 이상부터 보관할 수 있습니다.", "warning"),
              ...state.logs,
            ]),
          });
          return;
        }

        const rebirthCount = state.rebirthCount ?? 0;
        const discoveredLevels = state.discoveredLevels ?? [1];
        const bestLevel = state.bestLevel ?? state.swordLevel;
        const gpsBefore = calculateGps(state.storedSwords, rebirthCount);
        const pendingReward = calculateOfflineReward(gpsBefore, state.lastRewardAt);
        const storedSword: StoredSword = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          level: state.swordLevel,
          storedAt: new Date().toISOString(),
          gpsBonus: getStoredSwordGpsBonus(state.swordLevel),
        };
        const nextStoredSwords = [...state.storedSwords, storedSword];

        console.info("[store]", {
          level: state.swordLevel,
          gpsBonus: storedSword.gpsBonus,
          pendingReward: pendingReward.gold,
          nextGps: calculateGps(nextStoredSwords, rebirthCount),
        });

        set({
          gold: state.gold + pendingReward.gold,
          swordLevel: 1,
          storedSwords: nextStoredSwords,
          discoveredLevels: addDiscoveredLevel(discoveredLevels, state.swordLevel),
          bestLevel: Math.max(bestLevel, state.swordLevel),
          lastRewardAt: new Date().toISOString(),
          lastOutcome: undefined,
          logs: trimLogs([
            createLog(
              `${state.swordLevel}단계 검을 보관했습니다. 초당 골드 +${storedSword.gpsBonus.toFixed(1)}G/초.`,
              "success",
            ),
            ...(pendingReward.gold > 0
              ? [
                  createLog(
                    `보관 전 누적 보상 ${formatNumber(pendingReward.gold)}G를 정산했습니다.`,
                    "system",
                  ),
                ]
              : []),
            ...state.logs,
          ]),
        });
      },
      claimOfflineReward: () => {
        const state = get();
        const gps = calculateGps(state.storedSwords, state.rebirthCount ?? 0);
        const reward = calculateOfflineReward(gps, state.lastRewardAt);

        set({
          gold: state.gold + reward.gold,
          lastRewardAt: new Date().toISOString(),
          logs: trimLogs([
            createLog(
              `방치 보상 ${formatNumber(reward.gold)}G 수령 (${formatNumber(reward.cappedSeconds)}초).`,
              reward.gold > 0 ? "success" : "neutral",
            ),
            ...state.logs,
          ]),
        });
      },
      buyProtectionStone: () => {
        const state = get();
        if (state.stones < PROTECTION_STONE_COST) {
          set({
            logs: trimLogs([
              createLog(
                `보호석 구매에는 강화석 ${formatNumber(PROTECTION_STONE_COST)}개가 필요합니다.`,
                "warning",
              ),
              ...state.logs,
            ]),
          });
          return;
        }

        set({
          stones: state.stones - PROTECTION_STONE_COST,
          protectionStones: state.protectionStones + 1,
          logs: trimLogs([
            createLog("보호석 1개를 구매했습니다.", "success"),
            ...state.logs,
          ]),
        });
      },
      buySafeguardStone: () => {
        const state = get();
        if (state.stones < SAFEGUARD_STONE_COST) {
          set({
            logs: trimLogs([
              createLog(
                `수호석 구매에는 강화석 ${formatNumber(SAFEGUARD_STONE_COST)}개가 필요합니다.`,
                "warning",
              ),
              ...state.logs,
            ]),
          });
          return;
        }

        set({
          stones: state.stones - SAFEGUARD_STONE_COST,
          safeguardStones: (state.safeguardStones ?? 0) + 1,
          logs: trimLogs([
            createLog("수호석 1개를 구매했습니다.", "success"),
            ...state.logs,
          ]),
        });
      },
      buyBlessingStone: () => {
        const state = get();
        if (state.stones < BLESSING_STONE_COST) {
          set({
            logs: trimLogs([
              createLog(
                `축복석 구매에는 강화석 ${formatNumber(BLESSING_STONE_COST)}개가 필요합니다.`,
                "warning",
              ),
              ...state.logs,
            ]),
          });
          return;
        }

        set({
          stones: state.stones - BLESSING_STONE_COST,
          blessingStones: state.blessingStones + 1,
          logs: trimLogs([
            createLog("축복석 1개를 구매했습니다.", "success"),
            ...state.logs,
          ]),
        });
      },
      setUseProtectionStone: (enabled: boolean) => {
        set({ useProtectionStone: enabled });
      },
      setUseSafeguardStone: (enabled: boolean) => {
        set({ useSafeguardStone: enabled });
      },
      setUseBlessingStone: (enabled: boolean) => {
        set({ useBlessingStone: enabled });
      },
      rebirth: () => {
        const state = get();
        const rebirthCount = state.rebirthCount ?? 0;
        const bestLevel = state.bestLevel ?? state.swordLevel;
        if (!canRebirth(bestLevel)) {
          set({
            logs: trimLogs([
              createLog("30단계를 한 번이라도 달성해야 환생할 수 있습니다.", "warning"),
              ...state.logs,
            ]),
          });
          return;
        }

        const gpsBefore = calculateGps(state.storedSwords, rebirthCount);
        const pendingReward = calculateOfflineReward(gpsBefore, state.lastRewardAt);
        const nextRebirthCount = rebirthCount + 1;

        set({
          gold: INITIAL_GOLD + pendingReward.gold,
          stones: 0,
          swordLevel: 1,
          soulMileage: 0,
          protectionStones: 0,
          safeguardStones: 0,
          blessingStones: 0,
          useProtectionStone: false,
          useSafeguardStone: false,
          useBlessingStone: false,
          storedSwords: [],
          lastRewardAt: new Date().toISOString(),
          rebirthCount: nextRebirthCount,
          milestoneRewardsClaimed: [],
          lastOutcome: undefined,
          logs: trimLogs([
            createLog(
              `환생 ${nextRebirthCount}회차 시작. 성공률 +${getRebirthSuccessBonus(nextRebirthCount).toFixed(1)}%p, 초당 골드 x${getRebirthGpsMultiplier(nextRebirthCount).toFixed(1)}.`,
              "success",
            ),
            ...(pendingReward.gold > 0
              ? [
                  createLog(
                    `환생 전 누적 보상 ${formatNumber(pendingReward.gold)}G를 정산했습니다.`,
                    "system",
                  ),
                ]
              : []),
            ...state.logs,
          ]),
        });
      },
      addGold: (amount: number) => {
        const state = get();
        set({
          gold: state.gold + amount,
          logs: trimLogs([
            createLog(`QA 골드 +${formatNumber(amount)}G`, "system"),
            ...state.logs,
          ]),
        });
      },
      addStones: (amount: number) => {
        const state = get();
        set({
          stones: state.stones + amount,
          logs: trimLogs([
            createLog(`QA 강화석 +${formatNumber(amount)}`, "system"),
            ...state.logs,
          ]),
        });
      },
      setSwordLevel: (level: number) => {
        const state = get();
        const nextLevel = Math.min(Math.max(Math.trunc(level), 1), 30);
        const discoveredLevels = state.discoveredLevels ?? [1];
        const bestLevel = state.bestLevel ?? state.swordLevel;
        set({
          swordLevel: nextLevel,
          bestLevel: Math.max(bestLevel, nextLevel),
          discoveredLevels: addDiscoveredLevel(discoveredLevels, nextLevel),
          lastOutcome: undefined,
          logs: trimLogs([
            createLog(`QA 단계 조정: ${nextLevel}단계`, "system"),
            ...state.logs,
          ]),
        });
      },
      startDecisionSession: () => {
        const state = get();
        set({
          ...createInitialState(),
          gold: 100000,
          playtestNotes: state.playtestNotes,
          logs: [
            createLog(
              "QA 2차 세션: 100,000G로 +12~15 판매/분해/보관 선택을 검증합니다.",
              "system",
            ),
          ],
        });
      },
      addPlaytestNote: (text: string, category: PlaytestNoteCategory) => {
        const state = get();
        const trimmedText = text.trim();
        if (!trimmedText) return;

        const rebirthCount = state.rebirthCount ?? 0;
        const note: PlaytestNote = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: new Date().toISOString(),
          category,
          text: trimmedText,
          snapshot: {
            gold: state.gold,
            stones: state.stones,
            swordLevel: state.swordLevel,
            soulMileage: state.soulMileage,
            totalAttempts: state.totalAttempts,
            bestLevel: state.bestLevel ?? state.swordLevel,
            rebirthCount,
            gps: calculateGps(state.storedSwords, rebirthCount),
            storedSwordCount: state.storedSwords.length,
            protectionStones: state.protectionStones,
            safeguardStones: state.safeguardStones ?? 0,
            blessingStones: state.blessingStones,
          },
        };

        set({
          playtestNotes: [note, ...state.playtestNotes].slice(0, PLAYTEST_NOTE_LIMIT),
          logs: trimLogs([
            createLog("플레이 노트를 저장했습니다.", "system"),
            ...state.logs,
          ]),
        });
      },
      clearPlaytestNotes: () => {
        const state = get();
        set({
          playtestNotes: [],
          logs: trimLogs([
            createLog("플레이 노트를 비웠습니다.", "system"),
            ...state.logs,
          ]),
        });
      },
      resetGame: () => {
        const state = get();
        set({
          ...createInitialState(),
          playtestNotes: state.playtestNotes,
        });
      },
    }),
    {
      name: "improve-sword-mvp",
      partialize: (state) => ({
        gold: state.gold,
        stones: state.stones,
        swordLevel: state.swordLevel,
        soulMileage: state.soulMileage,
        totalAttempts: state.totalAttempts,
        lastOutcome: state.lastOutcome,
        logs: state.logs,
        attemptRecords: state.attemptRecords,
        storedSwords: state.storedSwords,
        lastRewardAt: state.lastRewardAt,
        protectionStones: state.protectionStones,
        safeguardStones: state.safeguardStones ?? 0,
        blessingStones: state.blessingStones,
        useProtectionStone: state.useProtectionStone,
        useSafeguardStone: state.useSafeguardStone,
        useBlessingStone: state.useBlessingStone,
        rebirthCount: state.rebirthCount,
        bestLevel: state.bestLevel,
        discoveredLevels: state.discoveredLevels,
        milestoneRewardsClaimed: state.milestoneRewardsClaimed,
        playtestNotes: state.playtestNotes,
        miningCooldownUntil: state.miningCooldownUntil,
        miningStonePity: state.miningStonePity,
      }),
    },
  ),
);
