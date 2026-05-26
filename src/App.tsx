import { BalanceTools } from "./components/BalanceTools";
import { ControlPanel } from "./components/ControlPanel";
import { DevPanel } from "./components/DevPanel";
import { EnhancementTableView } from "./components/EnhancementTableView";
import { Hud } from "./components/Hud";
import { ItemShop } from "./components/ItemShop";
import { MetaPanel } from "./components/MetaPanel";
import { PlaytestChecklist } from "./components/PlaytestChecklist";
import { PlaytestNotes } from "./components/PlaytestNotes";
import { RebirthPanel } from "./components/RebirthPanel";
import { ResultLog } from "./components/ResultLog";
import { SwordView } from "./components/SwordView";
import { calculateGps, calculateOfflineReward } from "./core/economy";
import { getEnhancementRow } from "./core/enhancementTable";
import { getRebirthSuccessBonus } from "./core/rebirth";
import { useGameStore } from "./store/gameStore";

export default function App() {
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
    blessingStones,
    useProtectionStone,
    useBlessingStone,
    rebirthCount,
    bestLevel,
    discoveredLevels,
    playtestNotes,
    enhance,
    sellSword,
    salvageSword,
    storeSword,
    claimOfflineReward,
    buyProtectionStone,
    buyBlessingStone,
    setUseProtectionStone,
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

  return (
    <main className="appShell">
      <header className="topBar">
        <div>
          <p>검키우기 MVP</p>
          <h1>강화 루프 테스트</h1>
        </div>
        <div className="buildTag">48h Prototype</div>
      </header>

      <Hud
        gold={gold}
        stones={stones}
        gps={gps}
        soulMileage={soulMileage}
        totalAttempts={totalAttempts}
      />

      <div className="workspace">
        <SwordView level={swordLevel} lastOutcome={lastOutcome} />
        <aside className="sideRail">
          <ControlPanel
            level={swordLevel}
            canEnhance={canEnhance}
            onEnhance={enhance}
            onSell={sellSword}
            onSalvage={salvageSword}
            onStore={storeSword}
            protectionStones={protectionStones}
            blessingStones={blessingStones}
            useProtectionStone={useProtectionStone}
            useBlessingStone={useBlessingStone}
            onUseProtectionStoneChange={setUseProtectionStone}
            onUseBlessingStoneChange={setUseBlessingStone}
            successBonusRate={successBonusRate}
          />
          <ItemShop
            stones={stones}
            protectionStones={protectionStones}
            blessingStones={blessingStones}
            onBuyProtectionStone={buyProtectionStone}
            onBuyBlessingStone={buyBlessingStone}
          />
          <MetaPanel
            gps={gps}
            storedSwords={storedSwords}
            offlineGold={offlineReward.gold}
            offlineSeconds={offlineReward.cappedSeconds}
            onClaimOfflineReward={claimOfflineReward}
          />
          <RebirthPanel
            rebirthCount={rebirthCount}
            bestLevel={bestLevel}
            discoveredLevels={discoveredLevels}
            onRebirth={rebirth}
          />
          <DevPanel
            level={swordLevel}
            onAddGold={addGold}
            onAddStones={addStones}
            onSetLevel={setSwordLevel}
            onStartDecisionSession={startDecisionSession}
            onReset={resetGame}
          />
        </aside>
      </div>

      <ResultLog logs={logs} />
      <div className="qaGrid">
        <div className="qaSideStack">
          <PlaytestChecklist />
          <PlaytestNotes
            notes={playtestNotes}
            onAddNote={addPlaytestNote}
            onClearNotes={clearPlaytestNotes}
          />
        </div>
        <EnhancementTableView currentLevel={swordLevel} />
      </div>
      <BalanceTools records={attemptRecords} />
    </main>
  );
}
