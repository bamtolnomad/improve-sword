import { describe, expect, it } from "vitest";
import {
  getForgeRitualPhase,
  shouldApplyForgeResult,
  shouldEndForgeRitual,
} from "./forgeRitual";

describe("forge ritual timeline", () => {
  it("advances from charge to strike to resolve from elapsed time", () => {
    expect(getForgeRitualPhase(0)).toBe("charge");
    expect(getForgeRitualPhase(359)).toBe("charge");
    expect(getForgeRitualPhase(360)).toBe("strike");
    expect(getForgeRitualPhase(879)).toBe("strike");
    expect(getForgeRitualPhase(880)).toBe("resolve");
    expect(getForgeRitualPhase(5000)).toBe("resolve");
  });

  it("has separate result and cleanup gates so the ritual cannot stay stuck in charge", () => {
    expect(shouldApplyForgeResult(1119)).toBe(false);
    expect(shouldApplyForgeResult(1120)).toBe(true);
    expect(shouldEndForgeRitual(2819)).toBe(false);
    expect(shouldEndForgeRitual(2820)).toBe(true);
  });
});
