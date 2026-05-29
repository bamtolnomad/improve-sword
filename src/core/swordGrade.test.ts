import { describe, expect, it } from "vitest";
import { getNextSwordGrade, getSwordGrade, getSwordGradeProgress } from "./swordGrade";

describe("sword grade", () => {
  it("maps enhancement levels to readable item grades", () => {
    expect(getSwordGrade(1).label).toBe("일반");
    expect(getSwordGrade(5).label).toBe("고급");
    expect(getSwordGrade(10).label).toBe("희귀");
    expect(getSwordGrade(15).label).toBe("영웅");
    expect(getSwordGrade(20).label).toBe("전설");
    expect(getSwordGrade(25).label).toBe("신화");
    expect(getSwordGrade(30).label).toBe("유일");
  });

  it("returns the next grade target until the final grade", () => {
    expect(getNextSwordGrade(14)?.label).toBe("영웅");
    expect(getNextSwordGrade(29)?.label).toBe("유일");
    expect(getNextSwordGrade(30)).toBeUndefined();
  });

  it("reports progress within the current grade band", () => {
    expect(getSwordGradeProgress(10)).toBe(20);
    expect(getSwordGradeProgress(14)).toBe(100);
    expect(getSwordGradeProgress(30)).toBe(100);
  });
});
