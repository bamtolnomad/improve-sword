import { CheckSquare } from "lucide-react";
import { useState } from "react";

const checklistItems = [
  "10단계까지 30초 안에 도달하는가",
  "12~15단계에서 판매 고민이 생기는가",
  "첫 하락이 짜증보다 긴장감으로 느껴지는가",
  "15단계 이후 보호석 가격이 납득되는가",
  "분해가 판매보다 선택될 순간이 있는가",
  "보관 후 GPS 증가가 바로 이해되는가",
  "파괴 후 원혼/강화석 때문에 재도전하고 싶은가",
  "30단계 목표가 멀지만 불가능해 보이지 않는가",
];

export function PlaytestChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section className="playtestChecklist" aria-label="플레이테스트 체크리스트">
      <div className="panelTitle">
        <span>
          <CheckSquare size={17} />
          플레이테스트 체크
        </span>
        <strong>
          {checkedItems.size} / {checklistItems.length}
        </strong>
      </div>
      <div className="checklistGrid">
        {checklistItems.map((item, index) => (
          <label key={item} className={checkedItems.has(index) ? "checked" : ""}>
            <input
              type="checkbox"
              checked={checkedItems.has(index)}
              onChange={() => toggleItem(index)}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
