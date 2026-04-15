import { useState, useMemo, useCallback } from "react";
import type { Board, BoardCard, Note, Tag } from "../lib/storage";
import { getAllCards, getNotes, getBoards, getColumnsForBoard, getTags } from "../lib/storage";
import { IconChevron } from "./Icons";

interface CalendarViewProps {
  onOpenBoard: (id: string) => void;
  onSelectNote: (id: string) => void;
}

// ── Helpers ──────────────────────────────────────────────

type ScheduledItem =
  | { kind: "card"; data: BoardCard; board?: Board; columnName?: string }
  | { kind: "note"; data: Note };

function toDateKey(iso: string): string {
  // Handles both "2026-04-15" and "2026-04-15T10:00" formats
  return iso.slice(0, 10);
}

function getTimeFromISO(iso: string): string {
  if (iso.length <= 10) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function startWeekday(year: number, month: number): number {
  // 0 = Sunday … 6 = Saturday – we treat Monday as start, so shift
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday-based: 0=Mon … 6=Sun
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Component ────────────────────────────────────────────

export default function CalendarView({ onOpenBoard, onSelectNote }: CalendarViewProps) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // ── Data ──

  const boards = getBoards();
  const tags = getTags();
  const allCards = getAllCards();
  const allNotes = getNotes();

  const tagMap = useMemo(() => {
    const m = new Map<string, Tag>();
    tags.forEach((t) => m.set(t.id, t));
    return m;
  }, [tags]);

  const boardMap = useMemo(() => {
    const m = new Map<string, Board>();
    boards.forEach((b) => m.set(b.id, b));
    return m;
  }, [boards]);

  // Build a date -> items map
  const dateItems = useMemo(() => {
    const map = new Map<string, ScheduledItem[]>();

    const push = (key: string, item: ScheduledItem) => {
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    };

    for (const card of allCards) {
      if (!card.scheduledAt) continue;
      const key = toDateKey(card.scheduledAt);
      const board = boardMap.get(card.boardId);
      const cols = board ? getColumnsForBoard(board.id) : [];
      const col = cols.find((c) => c.id === card.columnId);
      push(key, { kind: "card", data: card, board, columnName: col?.name });
    }

    for (const note of allNotes) {
      if (!note.scheduledAt) continue;
      const key = toDateKey(note.scheduledAt);
      push(key, { kind: "note", data: note });
    }

    return map;
  }, [allCards, allNotes, boardMap]);

  // ── Navigation ──

  const goPrev = useCallback(() => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const goNext = useCallback(() => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }, [month]);

  const goToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(todayKey);
  }, [todayKey]);

  // ── Grid cells ──

  const numDays = daysInMonth(year, month);
  const offset = startWeekday(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= numDays; d++) cells.push(d);
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  // ── Selected day items ──

  const selectedItems = selectedDay ? (dateItems.get(selectedDay) ?? []) : [];

  // ── Colors for card/note dots ──

  function dotColor(item: ScheduledItem): string {
    if (item.kind === "card") return item.board?.color || "#10b981";
    return "#3b82f6";
  }

  // ── Render ──

  return (
    <div className="h-full overflow-y-auto">
      <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

      <div className="max-w-[960px] mx-auto px-8 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif italic text-[2rem] font-light" style={{ color: "var(--text-primary)" }}>
            Calendar
          </h1>
          <p className="text-[12px] font-light mt-1" style={{ color: "var(--text-muted)" }}>
            Your scheduled notes and board cards
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2
              className="font-serif italic text-[1.35rem] font-light"
              style={{ color: "var(--text-primary)" }}
            >
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              onClick={goToday}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium cursor-default transition-colors"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="p-1.5 rounded-xl cursor-default transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <IconChevron size={16} className="rotate-180" />
            </button>
            <button
              onClick={goNext}
              className="p-1.5 rounded-xl cursor-default transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <IconChevron size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border-color)" }}
        >
          {/* Day-of-week headers */}
          <div
            className="grid grid-cols-7"
            style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}
          >
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-2.5 text-center text-[10px] uppercase tracking-[0.1em] font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7" style={{ backgroundColor: "var(--bg-secondary)" }}>
            {cells.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[90px]"
                    style={{
                      borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--border-color)" : undefined,
                      borderBottom: idx < cells.length - 7 ? "1px solid var(--border-color)" : undefined,
                      backgroundColor: "var(--bg-primary)",
                      opacity: 0.5,
                    }}
                  />
                );
              }

              const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const items = dateItems.get(dateKey) ?? [];
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDay;

              return (
                <div
                  key={dateKey}
                  onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                  className="min-h-[90px] p-2 cursor-default transition-colors relative"
                  style={{
                    borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--border-color)" : undefined,
                    borderBottom: idx < cells.length - 7 ? "1px solid var(--border-color)" : undefined,
                    backgroundColor: isSelected
                      ? "var(--bg-hover)"
                      : "var(--bg-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[12px] font-light"
                      style={{
                        color: isToday ? "#10b981" : "var(--text-secondary)",
                        fontWeight: isToday ? 500 : 300,
                      }}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "#10b981" }}
                      />
                    )}
                  </div>

                  {/* Item dots / pills */}
                  <div className="flex flex-col gap-0.5">
                    {items.slice(0, 3).map((item, i) => {
                      const label = item.kind === "card" ? item.data.title : item.data.title;
                      const color = dotColor(item);
                      return (
                        <div
                          key={`${item.kind}-${item.data.id}-${i}`}
                          className="flex items-center gap-1 rounded-md px-1 py-[1px]"
                          style={{ backgroundColor: color + "12" }}
                        >
                          <span
                            className="w-1 h-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span
                            className="text-[9px] font-light truncate"
                            style={{ color: color }}
                          >
                            {label || "Untitled"}
                          </span>
                        </div>
                      );
                    })}
                    {items.length > 3 && (
                      <span className="text-[8px] font-light pl-1" style={{ color: "var(--text-muted)" }}>
                        +{items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail Panel */}
        {selectedDay && (
          <div
            className="mt-5 rounded-2xl p-5"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-serif italic text-[1.1rem] font-light"
                style={{ color: "var(--text-primary)" }}
              >
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-[10px] font-light cursor-default px-2 py-1 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                Close
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <p
                className="text-[12px] font-light italic py-6 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                Nothing scheduled for this day
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedItems.map((item) => {
                  if (item.kind === "card") {
                    const { data: card, board, columnName } = item;
                    const cardTags = card.tags.map((id) => tagMap.get(id)).filter(Boolean) as Tag[];
                    const time = getTimeFromISO(card.scheduledAt);
                    return (
                      <div
                        key={`card-${card.id}`}
                        onClick={() => board && onOpenBoard(board.id)}
                        className="flex items-start gap-3 p-3 rounded-xl cursor-default transition-colors"
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          border: "1px solid var(--border-color)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                      >
                        {/* Color bar */}
                        <div
                          className="w-0.5 h-8 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: board?.color || "#10b981" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[12px] font-light truncate"
                              style={{ color: card.color || "var(--text-primary)" }}
                            >
                              {card.title || "Untitled"}
                            </span>
                            {time && (
                              <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                {time}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {board && (
                              <span
                                className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: board.color + "15", color: board.color }}
                              >
                                {board.name}
                              </span>
                            )}
                            {columnName && (
                              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                                {columnName}
                              </span>
                            )}
                            {cardTags.map((tag) => (
                              <span
                                key={tag.id}
                                className="px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                                style={{ backgroundColor: tag.color + "20", color: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                          {card.description && (
                            <p
                              className="text-[10px] font-light mt-1 line-clamp-2"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {card.description.replace(/<[^>]*>/g, "")}
                            </p>
                          )}
                        </div>
                        <span
                          className="text-[9px] uppercase tracking-[0.08em] flex-shrink-0 mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Card
                        </span>
                      </div>
                    );
                  }

                  // Note
                  const { data: note } = item;
                  const noteTags = note.tags.map((id) => tagMap.get(id)).filter(Boolean) as Tag[];
                  const time = getTimeFromISO(note.scheduledAt);
                  return (
                    <div
                      key={`note-${note.id}`}
                      onClick={() => onSelectNote(note.id)}
                      className="flex items-start gap-3 p-3 rounded-xl cursor-default transition-colors"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                    >
                      {/* Color bar */}
                      <div
                        className="w-0.5 h-8 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: "#3b82f6" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-light truncate" style={{ color: "var(--text-primary)" }}>
                            {note.icon && <span className="mr-1">{note.icon}</span>}
                            {note.title || "Untitled"}
                          </span>
                          {time && (
                            <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                              {time}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {note.status && (
                            <span
                              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor:
                                  note.status === "done" ? "#10b98120" :
                                  note.status === "doing" ? "#f59e0b20" :
                                  "#3b82f620",
                                color:
                                  note.status === "done" ? "#10b981" :
                                  note.status === "doing" ? "#f59e0b" :
                                  "#3b82f6",
                              }}
                            >
                              {note.status}
                            </span>
                          )}
                          {noteTags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                              style={{ backgroundColor: tag.color + "20", color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className="text-[9px] uppercase tracking-[0.08em] flex-shrink-0 mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Note
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
