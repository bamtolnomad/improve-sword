import {
  Archive,
  BookOpen,
  FlaskConical,
  Flame,
  Hammer,
  Menu,
  PlusCircle,
  RotateCcw,
  ScrollText,
  Shield,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BalanceTools } from "./components/BalanceTools";
import { CommissionPanel } from "./components/CommissionPanel";
import { ControlPanel } from "./components/ControlPanel";
import { DesktopForgePanel } from "./components/DesktopForgePanel";
import { DevPanel } from "./components/DevPanel";
import { EnhancementTableView } from "./components/EnhancementTableView";
import { Hud } from "./components/Hud";
import { ItemShop } from "./components/ItemShop";
import { MetaPanel } from "./components/MetaPanel";
import { MilestonePanel } from "./components/MilestonePanel";
import { PlaytestChecklist } from "./components/PlaytestChecklist";
import { PlaytestNotes } from "./components/PlaytestNotes";
import { RebirthPanel } from "./components/RebirthPanel";
import { ResultLog } from "./components/ResultLog";
import { SwordView } from "./components/SwordView";
import { calculateGps, calculateOfflineReward } from "./core/economy";
import { getEnhancementRow } from "./core/enhancementTable";
import { getRebirthSuccessBonus } from "./core/rebirth";
import { playForgeStrike, playOutcomeSound } from "./core/sound";
import { useGameStore } from "./store/gameStore";

type SheetKey =
  | "forge"
  | "shop"
  | "commission"
  | "vault"
  | "rebirth"
  | "codex"
  | "log"
  | "lab";

const sheetTabs: Array<{ key: SheetKey; label: string; icon: typeof ScrollText }> = [
  { key: "forge", label: "대장간", icon: Flame },
  { key: "shop", label: "상점", icon: Shield },
  { key: "commission", label: "의뢰", icon: Hammer },
  { key: "vault", label: "보관소", icon: Archive },
  { key: "rebirth", label: "환생", icon: Trophy },
  { key: "codex", label: "도감", icon: BookOpen },
  { key: "log", label: "기록", icon: ScrollText },
  { key: "lab", label: "실험실", icon: FlaskConical },
];

const mobileDrawerTabs = sheetTabs.filter(
  (tab) => tab.key !== "forge" && tab.key !== "shop" && tab.key !== "vault",
);
const mobileMenuLabels: Record<SheetKey, string> = {
  forge: "대장간",
  shop: "상점",
  commission: "의뢰",
  vault: "보관",
  rebirth: "환생",
  codex: "도감",
  log: "기록",
  lab: "실험",
};

function getInitialSheet(): SheetKey {
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches) {
    return "shop";
  }

  return "forge";
}

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
}

export default function App() {
  const [activeSheet, setActiveSheet] = useState<SheetKey>(getInitialSheet);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasEnteredForge, setHasEnteredForge] = useState(false);
  const [isEnteringForge, setIsEnteringForge] = useState(false);
  const [transitionHint, setTransitionHint] = useState<"shop" | "forge" | null>(null);
  const lastSoundAttemptRef = useRef(0);
  const hintTimerRef = useRef<number | null>(null);
  const enterTimerRef = useRef<number | null>(null);
  const shellRef = useRef<HTMLElement | null>(null);
  const forgeRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);
  const scrollLockUntilRef = useRef(0);
  const snapTargetRef = useRef<"forge" | "sheet">("forge");
  const correctionFrameRef = useRef<number | null>(null);
  const touchGestureRef = useRef({
    startX: 0,
    startY: 0,
    isInteractiveStart: false,
    hasTriggered: false,
  });
  const {
    gold,
    stones,
    swordLevel,
    soulMileage,
    totalAttempts,
    lastOutcome,
    logs,
    attemptRecords,
    storedSwords,
    lastRewardAt,
    protectionStones,
    safeguardStones,
    blessingStones,
    useProtectionStone,
    useSafeguardStone,
    useBlessingStone,
    rebirthCount,
    bestLevel,
    discoveredLevels,
    milestoneRewardsClaimed,
    playtestNotes,
    miningCooldownUntil,
    miningStonePity,
    enhance,
    sellSword,
    salvageSword,
    completeMiningJob,
    storeSword,
    claimOfflineReward,
    buyProtectionStone,
    buySafeguardStone,
    buyBlessingStone,
    setUseProtectionStone,
    setUseSafeguardStone,
    setUseBlessingStone,
    rebirth,
    addGold,
    addStones,
    setSwordLevel,
    startDecisionSession,
    addPlaytestNote,
    clearPlaytestNotes,
    resetGame,
  } = useGameStore();

  const row = getEnhancementRow(swordLevel);
  const canEnhance = row ? gold >= row.cost : false;
  const gps = calculateGps(storedSwords, rebirthCount);
  const offlineReward = calculateOfflineReward(gps, lastRewardAt);
  const successBonusRate = getRebirthSuccessBonus(rebirthCount);
  const ActiveSheetIcon = sheetTabs.find((tab) => tab.key === activeSheet)?.icon ?? ScrollText;
  const activeSheetLabel = sheetTabs.find((tab) => tab.key === activeSheet)?.label ?? "전투 기록";
  const latestLog = logs[0];

  const flashTransitionHint = (hint: "shop" | "forge") => {
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
    }

    setTransitionHint(null);
    window.requestAnimationFrame(() => {
      setTransitionHint(hint);
      hintTimerRef.current = window.setTimeout(() => {
        setTransitionHint(null);
        hintTimerRef.current = null;
      }, 780);
    });
  };

  const getSheetScrollTop = () => {
    const shell = shellRef.current;
    const sheet = sheetRef.current;
    if (!shell || !sheet) return 0;

    const shellRect = shell.getBoundingClientRect();
    const sheetRect = sheet.getBoundingClientRect();
    return shell.scrollTop + sheetRect.top - shellRect.top;
  };

  const lockScrollCorrection = (duration = 520) => {
    scrollLockUntilRef.current = Date.now() + duration;
  };

  const correctToSnapTarget = () => {
    const shell = shellRef.current;
    if (!shell || !isMobileViewport()) return;

    const targetTop = snapTargetRef.current === "sheet" ? getSheetScrollTop() : 0;
    if (Math.abs(shell.scrollTop - targetTop) <= 1) return;

    shell.scrollTo({ top: targetTop, behavior: "auto" });
  };

  const scheduleSnapCorrection = () => {
    if (correctionFrameRef.current !== null) return;

    correctionFrameRef.current = window.requestAnimationFrame(() => {
      correctionFrameRef.current = null;
      correctToSnapTarget();
    });
  };

  const snapToForge = (behavior: ScrollBehavior = "auto", showHint = false) => {
    if (showHint) {
      flashTransitionHint("forge");
    }

    snapTargetRef.current = "forge";
    setIsSheetOpen(false);
    setIsMobileMenuOpen(false);
    lockScrollCorrection(360);

    requestAnimationFrame(() => {
      shellRef.current?.scrollTo({ top: 0, behavior });
      scheduleSnapCorrection();
    });
  };

  const snapToSheet = (
    key: SheetKey,
    behavior: ScrollBehavior = "auto",
    showHint = false,
  ) => {
    if (showHint && key === "shop") {
      flashTransitionHint("shop");
    }

    snapTargetRef.current = "sheet";
    setActiveSheet(key);
    setIsSheetOpen(true);
    setIsMobileMenuOpen(false);
    lockScrollCorrection(360);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        shellRef.current?.scrollTo({ top: getSheetScrollTop(), behavior });
        scheduleSnapCorrection();
      });
    });
  };

  useEffect(() => {
    if (totalAttempts === lastSoundAttemptRef.current) return;
    lastSoundAttemptRef.current = totalAttempts;
    if (lastOutcome) {
      playOutcomeSound(lastOutcome);
    }
  }, [lastOutcome, totalAttempts]);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current !== null) {
        window.clearTimeout(hintTimerRef.current);
      }
      if (enterTimerRef.current !== null) {
        window.clearTimeout(enterTimerRef.current);
      }
      if (correctionFrameRef.current !== null) {
        window.cancelAnimationFrame(correctionFrameRef.current);
      }
    };
  }, []);

  const handleEnhance = () => {
    playForgeStrike();
    enhance();
  };

  const handleMobileQaGold = () => {
    addGold(100000);
    setIsMobileMenuOpen(false);
  };

  const handleMobileQaReset = () => {
    resetGame();
    setIsMobileMenuOpen(false);
    snapToForge("auto");
  };

  const enterForge = () => {
    if (hasEnteredForge || isEnteringForge) return;

    playForgeStrike();
    setIsEnteringForge(true);
    enterTimerRef.current = window.setTimeout(() => {
      setHasEnteredForge(true);
      enterTimerRef.current = null;
    }, 920);
  };

  const selectSheet = (key: SheetKey, scrollToSheet = false) => {
    if (scrollToSheet && isMobileViewport()) {
      snapToSheet(key);
      return;
    }

    setActiveSheet(key);
    setIsSheetOpen(scrollToSheet);
  };

  const returnToForge = () => {
    setIsMobileMenuOpen(false);

    if (isMobileViewport()) {
      snapToForge("auto", activeSheet === "shop");
      return;
    }

    setIsSheetOpen(false);
  };

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const gestureThreshold = 22;
    const isLocked = () => Date.now() < scrollLockUntilRef.current;
    const shouldUseMobileSnap = () => isMobileViewport();
    const keepCurrentSheetInView = () => {
      lockScrollCorrection(180);
      shell.scrollTo({ top: getSheetScrollTop(), behavior: "auto" });
    };
    const openShopFromForge = () => {
      snapToSheet("shop", "auto", true);
    };
    const closeShopToForge = () => {
      snapToForge("auto", true);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!shouldUseMobileSnap()) return;
      if (Math.abs(event.deltaY) < 8) return;

      if (isLocked()) {
        event.preventDefault();
        if (snapTargetRef.current === "sheet" && activeSheet === "shop" && event.deltaY < 0) {
          closeShopToForge();
          return;
        }
        if (snapTargetRef.current === "forge" && !isSheetOpen && event.deltaY > 0) {
          openShopFromForge();
          return;
        }
        scheduleSnapCorrection();
        return;
      }

      if (!isSheetOpen && event.deltaY > 0) {
        event.preventDefault();
        openShopFromForge();
        return;
      }

      if (isSheetOpen && activeSheet === "shop" && event.deltaY < 0) {
        event.preventDefault();
        closeShopToForge();
        return;
      }

      if (isSheetOpen && activeSheet !== "shop" && event.deltaY < 0) {
        const sheetTop = getSheetScrollTop();
        if (shell.scrollTop <= sheetTop + 24) {
          event.preventDefault();
          keepCurrentSheetInView();
        }
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!shouldUseMobileSnap()) return;
      const touch = event.touches[0];
      const target = event.target instanceof Element ? event.target : null;
      touchGestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        isInteractiveStart: Boolean(
          target?.closest("button, input, select, textarea, a, label"),
        ),
        hasTriggered: false,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!shouldUseMobileSnap()) return;
      if (touchGestureRef.current.hasTriggered) return;
      if (isSheetOpen && activeSheet !== "shop" && touchGestureRef.current.isInteractiveStart) {
        return;
      }

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchGestureRef.current.startX;
      const deltaY = touch.clientY - touchGestureRef.current.startY;
      const isVerticalIntent = Math.abs(deltaY) > gestureThreshold && Math.abs(deltaY) > Math.abs(deltaX) * 1.2;
      if (!isVerticalIntent) return;

      const isSwipeUp = deltaY < 0;
      const isSwipeDown = deltaY > 0;

      if (isLocked()) {
        event.preventDefault();
        if (snapTargetRef.current === "sheet" && activeSheet === "shop" && isSwipeDown) {
          touchGestureRef.current.hasTriggered = true;
          closeShopToForge();
          return;
        }
        if (snapTargetRef.current === "forge" && !isSheetOpen && isSwipeUp) {
          touchGestureRef.current.hasTriggered = true;
          openShopFromForge();
          return;
        }
        scheduleSnapCorrection();
        return;
      }

      if (!isSheetOpen && isSwipeUp) {
        event.preventDefault();
        touchGestureRef.current.hasTriggered = true;
        openShopFromForge();
        return;
      }

      if (isSheetOpen && activeSheet === "shop" && isSwipeDown) {
        event.preventDefault();
        touchGestureRef.current.hasTriggered = true;
        closeShopToForge();
        return;
      }

      if (isSheetOpen && activeSheet !== "shop" && isSwipeDown) {
        const sheetTop = getSheetScrollTop();
        if (shell.scrollTop <= sheetTop + 24) {
          event.preventDefault();
          touchGestureRef.current.hasTriggered = true;
          keepCurrentSheetInView();
        }
      }
    };

    const handleScroll = () => {
      if (!shouldUseMobileSnap()) return;
      if (isLocked()) {
        scheduleSnapCorrection();
        return;
      }

      const sheetTop = getSheetScrollTop();
      if (!isSheetOpen && shell.scrollTop > 20) {
        openShopFromForge();
        return;
      }

      if (isSheetOpen && activeSheet !== "shop" && shell.scrollTop < sheetTop - 4) {
        keepCurrentSheetInView();
      }
    };

    shell.addEventListener("wheel", handleWheel, { passive: false });
    shell.addEventListener("touchstart", handleTouchStart, { passive: true });
    shell.addEventListener("touchmove", handleTouchMove, { passive: false });
    shell.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      shell.removeEventListener("wheel", handleWheel);
      shell.removeEventListener("touchstart", handleTouchStart);
      shell.removeEventListener("touchmove", handleTouchMove);
      shell.removeEventListener("scroll", handleScroll);
    };
  }, [activeSheet, isSheetOpen]);

  const renderSheet = () => {
    switch (activeSheet) {
      case "shop":
        return (
          <ItemShop
            stones={stones}
            protectionStones={protectionStones}
            safeguardStones={safeguardStones}
            blessingStones={blessingStones}
            onBuyProtectionStone={buyProtectionStone}
            onBuySafeguardStone={buySafeguardStone}
            onBuyBlessingStone={buyBlessingStone}
          />
        );
      case "forge":
        return (
          <DesktopForgePanel
            level={swordLevel}
            soulMileage={soulMileage}
            attemptRecords={attemptRecords}
            bestLevel={bestLevel}
            rebirthCount={rebirthCount}
            protectionStones={protectionStones}
            safeguardStones={safeguardStones}
            blessingStones={blessingStones}
            useBlessingStone={useBlessingStone}
            successBonusRate={successBonusRate}
          />
        );
      case "vault":
        return (
          <MetaPanel
            gps={gps}
            storedSwords={storedSwords}
            offlineGold={offlineReward.gold}
            offlineSeconds={offlineReward.cappedSeconds}
            onClaimOfflineReward={claimOfflineReward}
          />
        );
      case "commission":
        return (
          <CommissionPanel
            gold={gold}
            stones={stones}
            currentEnhancementCost={row?.cost ?? 0}
            miningCooldownUntil={miningCooldownUntil}
            miningStonePity={miningStonePity}
            onMine={completeMiningJob}
          />
        );
      case "rebirth":
        return (
          <RebirthPanel
            rebirthCount={rebirthCount}
            bestLevel={bestLevel}
            discoveredLevels={discoveredLevels}
            onRebirth={rebirth}
          />
        );
      case "codex":
        return <EnhancementTableView currentLevel={swordLevel} />;
      case "lab":
        return (
          <div className="labStack">
            <PlaytestChecklist />
            <PlaytestNotes
              notes={playtestNotes}
              onAddNote={addPlaytestNote}
              onClearNotes={clearPlaytestNotes}
            />
            <DevPanel
              level={swordLevel}
              onAddGold={addGold}
              onAddStones={addStones}
              onSetLevel={setSwordLevel}
              onStartDecisionSession={startDecisionSession}
              onReset={resetGame}
            />
            <BalanceTools records={attemptRecords} />
          </div>
        );
      case "log":
      default:
        return (
          <div className="sheetStack">
            <MilestonePanel
              bestLevel={bestLevel}
              claimedIds={milestoneRewardsClaimed ?? []}
            />
            <ResultLog logs={logs} />
          </div>
        );
    }
  };

  return (
    <main
      ref={shellRef}
      className={`gameShell ${isSheetOpen ? "sheet-open" : ""} ${
        lastOutcome ? `screen-${lastOutcome}` : ""
      }`}
    >
      <div className="forgeBackdrop" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <header className="gameHeader">
        <Hud
          gold={gold}
          stones={stones}
          gps={gps}
          soulMileage={soulMileage}
          totalAttempts={totalAttempts}
        />
      </header>

      <div className="gameBoard">
        <nav className="desktopSceneRail" aria-label="데스크탑 씬 메뉴">
          {sheetTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={activeSheet === tab.key ? "active" : ""}
                type="button"
                onClick={() => selectSheet(tab.key, false)}
                aria-label={tab.label}
                title={tab.label}
              >
                <Icon size={22} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <section ref={forgeRef} className="forgePlayfield" aria-label="대장간">
          <div className="runStats" aria-label="진행 상태">
            <div>
              <span>최고</span>
              <strong>+{bestLevel}</strong>
            </div>
            <div>
              <span>환생</span>
              <strong>{rebirthCount}</strong>
            </div>
            <div>
              <span>보관</span>
              <strong>{storedSwords.length}</strong>
            </div>
          </div>

          <SwordView level={swordLevel} lastOutcome={lastOutcome} resultKey={totalAttempts} />

          {row ? (
            <div
              key={`mobile-actions-${totalAttempts}`}
              className="mobileForgeActions"
              aria-label="빠른 강화 조작"
            >
              <div className="mobileQuickRail" aria-label="강화 퀵슬롯">
                <div className="mobileStoneSlots" aria-label="강화 보조석">
                  <button
                    className={`mobileStoneSlot protectionSlot ${
                      useProtectionStone && protectionStones > 0 ? "active" : ""
                    } ${protectionStones <= 0 ? "empty" : ""}`}
                    type="button"
                    onClick={() => setUseProtectionStone(!useProtectionStone)}
                    disabled={protectionStones <= 0}
                    aria-pressed={useProtectionStone && protectionStones > 0}
                    aria-label={`보호석 ${protectionStones}개`}
                  >
                    <Shield size={22} />
                    <span>보호</span>
                    <strong>{protectionStones}</strong>
                  </button>
                  <button
                    className={`mobileStoneSlot safeguardSlot ${
                      useSafeguardStone && safeguardStones > 0 ? "active" : ""
                    } ${safeguardStones <= 0 ? "empty" : ""}`}
                    type="button"
                    onClick={() => setUseSafeguardStone(!useSafeguardStone)}
                    disabled={safeguardStones <= 0}
                    aria-pressed={useSafeguardStone && safeguardStones > 0}
                    aria-label={`수호석 ${safeguardStones}개`}
                  >
                    <ShieldCheck size={22} />
                    <span>수호</span>
                    <strong>{safeguardStones}</strong>
                  </button>
                  <button
                    className={`mobileStoneSlot blessingSlot ${
                      useBlessingStone && blessingStones > 0 ? "active" : ""
                    } ${blessingStones <= 0 ? "empty" : ""}`}
                    type="button"
                    onClick={() => setUseBlessingStone(!useBlessingStone)}
                    disabled={blessingStones <= 0}
                    aria-pressed={useBlessingStone && blessingStones > 0}
                    aria-label={`축복석 ${blessingStones}개`}
                  >
                    <Sparkles size={22} />
                    <span>축복</span>
                    <strong>{blessingStones}</strong>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {latestLog ? (
            <div className={`battleToast ${latestLog.tone}`} role="status">
              {latestLog.message}
            </div>
          ) : null}

          <ControlPanel
            level={swordLevel}
            stones={stones}
            soulMileage={soulMileage}
            canEnhance={canEnhance}
            onEnhance={handleEnhance}
            onSell={sellSword}
            onSalvage={salvageSword}
            onStore={storeSword}
            protectionStones={protectionStones}
            safeguardStones={safeguardStones}
            blessingStones={blessingStones}
            useProtectionStone={useProtectionStone}
            useSafeguardStone={useSafeguardStone}
            useBlessingStone={useBlessingStone}
            onUseProtectionStoneChange={setUseProtectionStone}
            onUseSafeguardStoneChange={setUseSafeguardStone}
            onUseBlessingStoneChange={setUseBlessingStone}
            successBonusRate={successBonusRate}
          />
          <div className="scrollCue" aria-hidden="true">
            아래로 밀어 상점
          </div>
        </section>

        <aside
          ref={sheetRef}
          className={`gameSheet ${isSheetOpen ? "mobile-open" : ""}`}
          aria-label={activeSheetLabel}
        >
          <div className="sheetHeader">
            <span>
              <ActiveSheetIcon size={18} />
              {activeSheetLabel}
            </span>
            {activeSheet !== "shop" ? (
              <button
                className="sheetClose"
                type="button"
                onClick={returnToForge}
                aria-label="패널 닫기"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
          {activeSheet === "shop" ? (
            <div className="sheetReturnCue" aria-hidden="true">
              위로 밀면 강화 화면
            </div>
          ) : null}
          <nav className="sheetTabs" aria-label="보조 메뉴">
            {sheetTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  data-tab={tab.key}
                  className={activeSheet === tab.key ? "active" : ""}
                  type="button"
                  onClick={() => selectSheet(tab.key, false)}
                  aria-label={tab.label}
                  title={tab.label}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="sheetBody">{renderSheet()}</div>
        </aside>
      </div>

      <button
        className={`mobileMenuToggle ${isMobileMenuOpen ? "active" : ""}`}
        type="button"
        aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu-drawer"
        onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div
        id="mobile-menu-drawer"
        className={`mobileMenu ${isMobileMenuOpen ? "open" : ""}`}
        aria-label="빠른 메뉴"
      >
        {mobileDrawerTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={activeSheet === tab.key ? "active" : ""}
              type="button"
              onClick={() => {
                selectSheet(tab.key, true);
                setIsMobileMenuOpen(false);
              }}
              aria-label={tab.label}
            >
              <Icon size={19} />
              <span>{mobileMenuLabels[tab.key]}</span>
            </button>
          );
        })}
        <div className="mobileMenuSectionLabel">QA</div>
        <button className="mobileQaAction" type="button" onClick={handleMobileQaGold}>
          <PlusCircle size={19} />
          <span>10만G</span>
        </button>
        <button className="mobileQaAction danger" type="button" onClick={handleMobileQaReset}>
          <RotateCcw size={19} />
          <span>리셋</span>
        </button>
      </div>
      {transitionHint ? (
        <div className={`routeTransitionHint ${transitionHint}`} aria-hidden="true">
          <span>{transitionHint === "shop" ? "상점" : "강화"}</span>
        </div>
      ) : null}
      {!hasEnteredForge ? (
        <div
          className={`startScreen ${isEnteringForge ? "entering" : ""}`}
          role="dialog"
          aria-label="게임 시작"
        >
          <button className="startScreenButton" type="button" onClick={enterForge}>
            <span>검키우기</span>
            <strong>불멸의 대장간</strong>
            <small>화로 입장</small>
            <em>PRESS TO ENTER</em>
          </button>
          <div className="startGateGlow" aria-hidden="true" />
        </div>
      ) : null}
    </main>
  );
}
