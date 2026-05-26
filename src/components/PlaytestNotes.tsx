import { Download, NotebookPen, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { formatNumber } from "../core/format";
import type { PlaytestNote, PlaytestNoteCategory } from "../core/types";

interface PlaytestNotesProps {
  notes: PlaytestNote[];
  onAddNote: (text: string, category: PlaytestNoteCategory) => void;
  onClearNotes: () => void;
}

const categoryLabels: Record<PlaytestNoteCategory, string> = {
  friction: "막힘",
  choice: "선택",
  economy: "경제",
  emotion: "감정",
  bug: "버그",
  idea: "아이디어",
};

const categoryOptions: PlaytestNoteCategory[] = [
  "friction",
  "choice",
  "economy",
  "emotion",
  "bug",
  "idea",
];

function formatTime(timestamp: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function notesToMarkdown(notes: PlaytestNote[]): string {
  const lines = ["# Playtest Notes", "", `Exported: ${new Date().toISOString()}`, ""];

  for (const note of notes) {
    lines.push(`## ${note.timestamp} - ${categoryLabels[note.category]}`);
    lines.push("");
    lines.push(note.text);
    lines.push("");
    lines.push(
      `Snapshot: +${note.snapshot.swordLevel}, ${note.snapshot.gold}G, stones ${note.snapshot.stones}, attempts ${note.snapshot.totalAttempts}, best +${note.snapshot.bestLevel}, gold/sec ${note.snapshot.gps.toFixed(1)}, rebirth ${note.snapshot.rebirthCount}`,
    );
    lines.push("");
  }

  return lines.join("\n");
}

function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function PlaytestNotes({ notes, onAddNote, onClearNotes }: PlaytestNotesProps) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<PlaytestNoteCategory>("friction");

  const submitNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddNote(text, category);
    setText("");
  };

  const exportNotes = () => {
    downloadMarkdown(`playtest-notes-${new Date().toISOString()}.md`, notesToMarkdown(notes));
  };

  return (
    <section className="playtestNotes" aria-label="플레이 노트">
      <div className="panelTitle">
        <span>
          <NotebookPen size={17} />
          플레이 노트
        </span>
        <strong>{notes.length}</strong>
      </div>

      <form className="noteForm" onSubmit={submitNote}>
        <div className="noteControls">
          <select
            aria-label="노트 카테고리"
            value={category}
            onChange={(event) => setCategory(event.target.value as PlaytestNoteCategory)}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {categoryLabels[option]}
              </option>
            ))}
          </select>
          <button type="submit" disabled={!text.trim()}>
            저장
          </button>
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="예: +13에서 팔지 말지 고민이 생겼지만 분해 보상이 아직 약하게 느껴짐"
          rows={4}
        />
      </form>

      <div className="noteActions">
        <button type="button" onClick={exportNotes} disabled={notes.length === 0}>
          <Download size={16} />
          내보내기
        </button>
        <button type="button" onClick={onClearNotes} disabled={notes.length === 0}>
          <Trash2 size={16} />
          비우기
        </button>
      </div>

      <div className="noteList">
        {notes.length > 0 ? (
          notes.slice(0, 6).map((note) => (
            <article key={note.id}>
              <div>
                <span>{categoryLabels[note.category]}</span>
                <time>{formatTime(note.timestamp)}</time>
              </div>
              <p>{note.text}</p>
              <small>
                +{note.snapshot.swordLevel} · {formatNumber(note.snapshot.gold)}G · 시도{" "}
                {formatNumber(note.snapshot.totalAttempts)} · 초당 골드{" "}
                {note.snapshot.gps.toFixed(1)}
              </small>
            </article>
          ))
        ) : (
          <p className="emptyNotes">플레이 중 막힘, 선택, 감정을 짧게 적어두면 됩니다.</p>
        )}
      </div>
    </section>
  );
}
