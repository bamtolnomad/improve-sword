import { runBalanceSimulation, type BalanceSimulationOptions } from "../src/core/simulator";

const scenarios: Array<{ label: string; options: BalanceSimulationOptions }> = [
  {
    label: "10만G 밀기",
    options: { runs: 1000, initialGold: 100_000, targetLevel: 20, maxAttemptsPerRun: 600 },
  },
  {
    label: "100만G 밀기",
    options: { runs: 1000, initialGold: 1_000_000, targetLevel: 25, maxAttemptsPerRun: 1600 },
  },
  {
    label: "15단계 익절",
    options: {
      runs: 1000,
      initialGold: 100_000,
      targetLevel: 25,
      cashoutLevel: 15,
      maxAttemptsPerRun: 1200,
    },
  },
  {
    label: "보호 15+",
    options: {
      runs: 1000,
      initialGold: 1_000_000,
      targetLevel: 25,
      protectionFromLevel: 15,
      maxAttemptsPerRun: 1600,
    },
  },
  {
    label: "풀도핑 23+",
    options: {
      runs: 1000,
      initialGold: 1_000_000,
      targetLevel: 30,
      protectionFromLevel: 15,
      blessingFromLevel: 23,
      maxAttemptsPerRun: 2000,
    },
  },
];

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

for (const scenario of scenarios) {
  const report = runBalanceSimulation({ ...scenario.options, seed: 20260526 });

  console.log(`\n## ${scenario.label}`);
  console.log(`avgBestLevel=${report.averageBestLevel.toFixed(2)}`);
  console.log(`avgAttempts=${report.averageAttempts.toFixed(1)}`);
  console.log(`avgEndingGold=${Math.round(report.averageEndingGold)}`);
  console.log(`avgDestroyed=${report.averageDestroyedCount.toFixed(2)}`);
  console.log(`avgProtected=${report.averageProtectedCount.toFixed(2)}`);
  console.log(`avgBlessing=${report.averageBlessingUsedCount.toFixed(2)}`);
  console.log(`targetReach=${pct(report.targetReachRate)}`);
  console.log(
    `reach +10/${pct(report.levelReachRates["10"])} +15/${pct(report.levelReachRates["15"])} +20/${pct(report.levelReachRates["20"])} +25/${pct(report.levelReachRates["25"])} +30/${pct(report.levelReachRates["30"])}`,
  );
}
