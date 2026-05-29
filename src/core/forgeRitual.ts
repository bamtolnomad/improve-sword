export type ForgeRitualPhase = "idle" | "charge" | "strike" | "resolve";

export const FORGE_RITUAL_TIMING = {
  strikeAt: 360,
  resolveAt: 880,
  applyAt: 1120,
  endAt: 2820,
} as const;

export function getForgeRitualPhase(elapsedMs: number): Exclude<ForgeRitualPhase, "idle"> {
  if (!Number.isFinite(elapsedMs) || elapsedMs < FORGE_RITUAL_TIMING.strikeAt) {
    return "charge";
  }

  if (elapsedMs < FORGE_RITUAL_TIMING.resolveAt) {
    return "strike";
  }

  return "resolve";
}

export function shouldApplyForgeResult(elapsedMs: number): boolean {
  return Number.isFinite(elapsedMs) && elapsedMs >= FORGE_RITUAL_TIMING.applyAt;
}

export function shouldEndForgeRitual(elapsedMs: number): boolean {
  return Number.isFinite(elapsedMs) && elapsedMs >= FORGE_RITUAL_TIMING.endAt;
}
