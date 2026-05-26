import type { GameLogEntry } from "../core/types";

interface ResultLogProps {
  logs: GameLogEntry[];
}

export function ResultLog({ logs }: ResultLogProps) {
  return (
    <section className="resultLog" aria-label="결과 로그">
      <div className="panelTitle">
        <span>결과 로그</span>
      </div>
      <ol>
        {logs.map((log) => (
          <li key={log.id} className={`logItem ${log.tone}`}>
            {log.message}
          </li>
        ))}
      </ol>
    </section>
  );
}
