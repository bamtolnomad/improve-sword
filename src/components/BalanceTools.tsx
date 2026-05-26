import { Download, FlaskConical, TrendingUp } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { attemptsToCsv } from "../core/exportCsv";
import { formatNumber } from "../core/format";
import {
  runBalanceSimulation,
  type BalanceSimulationOptions,
  type BalanceSimulationReport,
} from "../core/simulator";
import type { EnhancementAttemptRecord } from "../core/types";

interface BalanceToolsProps {
  records: EnhancementAttemptRecord[];
}

const presets = [
  {
    label: "10만G 밀기",
    options: { runs: 300, initialGold: 100_000, targetLevel: 20, maxAttemptsPerRun: 600 },
  },
  {
    label: "100만G 밀기",
    options: { runs: 300, initialGold: 1_000_000, targetLevel: 25, maxAttemptsPerRun: 1600 },
  },
  {
    label: "15단계 익절",
    options: {
      runs: 300,
      initialGold: 100_000,
      targetLevel: 25,
      cashoutLevel: 15,
      maxAttemptsPerRun: 1200,
    },
  },
  {
    label: "보호 15+",
    options: {
      runs: 300,
      initialGold: 1_000_000,
      targetLevel: 25,
      protectionFromLevel: 15,
      maxAttemptsPerRun: 1600,
    },
  },
  {
    label: "수호 16+",
    options: {
      runs: 300,
      initialGold: 1_000_000,
      targetLevel: 25,
      protectionFromLevel: 15,
      safeguardFromLevel: 16,
      maxAttemptsPerRun: 1600,
    },
  },
  {
    label: "풀도핑 23+",
    options: {
      runs: 300,
      initialGold: 1_000_000,
      targetLevel: 30,
      protectionFromLevel: 15,
      safeguardFromLevel: 16,
      blessingFromLevel: 23,
      maxAttemptsPerRun: 2000,
    },
  },
];

interface SimulatorFormState {
  runs: number;
  initialGold: number;
  targetLevel: number;
  maxAttemptsPerRun: number;
  cashoutLevel: number;
  protectionFromLevel: number;
  safeguardFromLevel: number;
  blessingFromLevel: number;
}

function toPercent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function BalanceTools({ records }: BalanceToolsProps) {
  const [report, setReport] = useState<BalanceSimulationReport>(() =>
    runBalanceSimulation({ ...presets[0].options, seed: 20260526 }),
  );
  const [activePreset, setActivePreset] = useState(presets[0].label);
  const [formState, setFormState] = useState<SimulatorFormState>({
    runs: 300,
    initialGold: 100_000,
    targetLevel: 20,
    maxAttemptsPerRun: 600,
    cashoutLevel: 0,
    protectionFromLevel: 15,
    safeguardFromLevel: 16,
    blessingFromLevel: 23,
  });
  const latestRuns = useMemo(() => report.runs.slice(0, 5), [report]);

  const handleExport = () => {
    const csv = attemptsToCsv(records);
    downloadTextFile(`enhancement-attempts-${new Date().toISOString()}.csv`, csv);
  };

  const runPreset = (preset: (typeof presets)[number]) => {
    setActivePreset(preset.label);
    setFormState({
      runs: preset.options.runs,
      initialGold: preset.options.initialGold,
      targetLevel: preset.options.targetLevel,
      maxAttemptsPerRun: preset.options.maxAttemptsPerRun,
      cashoutLevel: preset.options.cashoutLevel ?? 0,
      protectionFromLevel: preset.options.protectionFromLevel ?? 0,
      safeguardFromLevel: preset.options.safeguardFromLevel ?? 0,
      blessingFromLevel: preset.options.blessingFromLevel ?? 0,
    });
    setReport(
      runBalanceSimulation({
        ...preset.options,
        seed: Date.now() % 1_000_000_000,
      }),
    );
  };

  const updateFormValue = (key: keyof SimulatorFormState, value: number) => {
    setFormState((current) => ({
      ...current,
      [key]: Number.isFinite(value) ? value : 0,
    }));
  };

  const runCustomSimulation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const options: BalanceSimulationOptions = {
      runs: formState.runs,
      initialGold: formState.initialGold,
      targetLevel: formState.targetLevel,
      maxAttemptsPerRun: formState.maxAttemptsPerRun,
      cashoutLevel: formState.cashoutLevel > 0 ? formState.cashoutLevel : undefined,
      protectionFromLevel:
        formState.protectionFromLevel > 0 ? formState.protectionFromLevel : undefined,
      safeguardFromLevel:
        formState.safeguardFromLevel > 0 ? formState.safeguardFromLevel : undefined,
      blessingFromLevel: formState.blessingFromLevel > 0 ? formState.blessingFromLevel : undefined,
      seed: Date.now() % 1_000_000_000,
    };

    setActivePreset("커스텀");
    setReport(runBalanceSimulation(options));
  };

  return (
    <section className="balanceTools" aria-label="밸런스 도구">
      <div className="panelTitle">
        <span>
          <FlaskConical size={17} />
          밸런스 도구
        </span>
        <button className="exportButton" type="button" onClick={handleExport}>
          <Download size={16} />
          CSV {records.length}
        </button>
      </div>

      <div className="presetRow" role="group" aria-label="시뮬레이션 프리셋">
        {presets.map((preset) => (
          <button
            key={preset.label}
            className={preset.label === activePreset ? "active" : ""}
            type="button"
            onClick={() => runPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form className="customSimForm" onSubmit={runCustomSimulation}>
        <label>
          <span>실행</span>
          <input
            type="number"
            min="1"
            max="5000"
            value={formState.runs}
            onChange={(event) => updateFormValue("runs", event.target.valueAsNumber)}
          />
        </label>
        <label>
          <span>초기 골드</span>
          <input
            type="number"
            min="0"
            step="1000"
            value={formState.initialGold}
            onChange={(event) => updateFormValue("initialGold", event.target.valueAsNumber)}
          />
        </label>
        <label>
          <span>목표</span>
          <input
            type="number"
            min="2"
            max="30"
            value={formState.targetLevel}
            onChange={(event) => updateFormValue("targetLevel", event.target.valueAsNumber)}
          />
        </label>
        <label>
          <span>최대 시도</span>
          <input
            type="number"
            min="1"
            max="10000"
            value={formState.maxAttemptsPerRun}
            onChange={(event) => updateFormValue("maxAttemptsPerRun", event.target.valueAsNumber)}
          />
        </label>
        <label>
          <span>익절</span>
          <input
            type="number"
            min="0"
            max="30"
            value={formState.cashoutLevel}
            onChange={(event) => updateFormValue("cashoutLevel", event.target.valueAsNumber)}
          />
        </label>
        <label>
          <span>보호</span>
          <input
            type="number"
            min="0"
            max="30"
            value={formState.protectionFromLevel}
            onChange={(event) => updateFormValue("protectionFromLevel", event.target.valueAsNumber)}
          />
        </label>
        <label>
          <span>수호</span>
          <input
            type="number"
            min="0"
            max="30"
            value={formState.safeguardFromLevel}
            onChange={(event) => updateFormValue("safeguardFromLevel", event.target.valueAsNumber)}
          />
        </label>
        <label>
          <span>축복</span>
          <input
            type="number"
            min="0"
            max="30"
            value={formState.blessingFromLevel}
            onChange={(event) => updateFormValue("blessingFromLevel", event.target.valueAsNumber)}
          />
        </label>
        <button type="submit">실행</button>
      </form>

      <div className="simSummary">
        <div>
          <span>평균 최고</span>
          <strong>+{report.averageBestLevel.toFixed(1)}</strong>
        </div>
        <div>
          <span>평균 시도</span>
          <strong>{formatNumber(report.averageAttempts)}회</strong>
        </div>
        <div>
          <span>평균 잔액</span>
          <strong>{formatNumber(report.averageEndingGold)}G</strong>
        </div>
        <div>
          <span>평균 파괴</span>
          <strong>{report.averageDestroyedCount.toFixed(1)}회</strong>
        </div>
        <div>
          <span>평균 보호</span>
          <strong>{report.averageProtectedCount.toFixed(1)}회</strong>
        </div>
        <div>
          <span>수호 사용</span>
          <strong>{report.averageSafeguardUsedCount.toFixed(1)}회</strong>
        </div>
        <div>
          <span>축복 사용</span>
          <strong>{report.averageBlessingUsedCount.toFixed(1)}회</strong>
        </div>
        <div>
          <span>목표 도달</span>
          <strong>{toPercent(report.targetReachRate)}</strong>
        </div>
      </div>

      <div className="reachRates">
        {Object.entries(report.levelReachRates).map(([level, rate]) => (
          <div key={level}>
            <span>+{level}</span>
            <div className="miniTrack" aria-hidden="true">
              <div style={{ width: `${rate * 100}%` }} />
            </div>
            <strong>{toPercent(rate)}</strong>
          </div>
        ))}
      </div>

      <div className="runStrip">
        <span>
          <TrendingUp size={15} />
          최근 샘플
        </span>
        <p>
          {latestRuns
            .map((run) => `#${run.run} +${run.bestLevel}/${run.attempts}회`)
            .join("  ")}
        </p>
      </div>
    </section>
  );
}
