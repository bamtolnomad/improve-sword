import { Table2 } from "lucide-react";
import { getSalvageStonesForLevel } from "../core/economy";
import { enhancementTable, getSellPriceForLevel } from "../core/enhancementTable";
import { formatNumber, formatPercent } from "../core/format";
import { getSwordGrade } from "../core/swordGrade";

interface EnhancementTableViewProps {
  currentLevel: number;
}

export function EnhancementTableView({ currentLevel }: EnhancementTableViewProps) {
  return (
    <section className="enhancementTablePanel" aria-label="강화 테이블">
      <div className="panelTitle">
        <span>
          <Table2 size={17} />
          강화 테이블
        </span>
        <strong>1~30</strong>
      </div>
      <div className="tableScroller">
        <table>
          <thead>
            <tr>
              <th>구간</th>
              <th>등급</th>
              <th>성공</th>
              <th>유지</th>
              <th>하락</th>
              <th>파괴</th>
              <th>비용</th>
              <th>판매</th>
              <th>분해</th>
              <th>추천</th>
            </tr>
          </thead>
          <tbody>
            {enhancementTable.map((row) => (
              <tr key={row.fromLevel} className={row.fromLevel === currentLevel ? "active" : ""}>
                <td>
                  +{row.fromLevel}→+{row.toLevel}
                </td>
                <td>
                  <span className={`tableGrade grade-${getSwordGrade(row.fromLevel).id}`}>
                    {getSwordGrade(row.fromLevel).label}
                  </span>
                </td>
                <td>{formatPercent(row.successRate)}</td>
                <td>{formatPercent(row.keepRate)}</td>
                <td>{formatPercent(row.downRate)}</td>
                <td>{formatPercent(row.destroyRate)}</td>
                <td>{formatNumber(row.cost)}G</td>
                <td>{formatNumber(getSellPriceForLevel(row.fromLevel))}G</td>
                <td>{formatNumber(getSalvageStonesForLevel(row.fromLevel))}</td>
                <td>{row.recommendedItem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
