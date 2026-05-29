import { MAX_SWORD_LEVEL } from "./enhancementTable";

export type SwordGradeId =
  | "common"
  | "uncommon"
  | "rare"
  | "heroic"
  | "legendary"
  | "mythic"
  | "unique";

export interface SwordGrade {
  id: SwordGradeId;
  label: string;
  minLevel: number;
  maxLevel: number;
  description: string;
}

export const SWORD_GRADES: SwordGrade[] = [
  {
    id: "common",
    label: "일반",
    minLevel: 1,
    maxLevel: 4,
    description: "기본 대장간 검",
  },
  {
    id: "uncommon",
    label: "고급",
    minLevel: 5,
    maxLevel: 9,
    description: "기초 제련 완료",
  },
  {
    id: "rare",
    label: "희귀",
    minLevel: 10,
    maxLevel: 14,
    description: "회수 가치 발생",
  },
  {
    id: "heroic",
    label: "영웅",
    minLevel: 15,
    maxLevel: 19,
    description: "보호석이 의미 있는 구간",
  },
  {
    id: "legendary",
    label: "전설",
    minLevel: 20,
    maxLevel: 24,
    description: "수호석과 축복석이 중요한 구간",
  },
  {
    id: "mythic",
    label: "신화",
    minLevel: 25,
    maxLevel: 29,
    description: "파괴 리스크가 핵심이 되는 구간",
  },
  {
    id: "unique",
    label: "유일",
    minLevel: 30,
    maxLevel: 30,
    description: "현재 최종 등급",
  },
];

export function getSwordGrade(level: number): SwordGrade {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);

  return (
    SWORD_GRADES.find(
      (grade) => safeLevel >= grade.minLevel && safeLevel <= grade.maxLevel,
    ) ?? SWORD_GRADES[0]
  );
}

export function getNextSwordGrade(level: number): SwordGrade | undefined {
  const currentGrade = getSwordGrade(level);
  const currentIndex = SWORD_GRADES.findIndex((grade) => grade.id === currentGrade.id);

  return SWORD_GRADES[currentIndex + 1];
}

export function getSwordGradeProgress(level: number): number {
  const safeLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_SWORD_LEVEL);
  const grade = getSwordGrade(safeLevel);
  const range = Math.max(1, grade.maxLevel - grade.minLevel + 1);

  return Math.min(100, Math.max(0, ((safeLevel - grade.minLevel + 1) / range) * 100));
}
