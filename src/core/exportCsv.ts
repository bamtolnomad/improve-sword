import type { EnhancementAttemptRecord } from "./types";

const CSV_HEADERS: Array<keyof EnhancementAttemptRecord> = [
  "attempt",
  "timestamp",
  "fromLevel",
  "targetLevel",
  "outcome",
  "nextLevel",
  "cost",
  "goldBefore",
  "goldAfter",
  "sellPriceBefore",
  "stonesAfter",
  "soulMileageBefore",
  "soulMileageAfter",
  "soulBurstUsed",
  "protectionStoneUsed",
  "safeguardStoneUsed",
  "blessingStoneUsed",
  "rebirthCount",
  "successBonusRate",
];

function escapeCsv(value: unknown): string {
  const text = String(value);

  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function attemptsToCsv(records: EnhancementAttemptRecord[]): string {
  const rows = records.map((record) =>
    CSV_HEADERS.map((header) => escapeCsv(record[header])).join(","),
  );

  return [CSV_HEADERS.join(","), ...rows].join("\n");
}
