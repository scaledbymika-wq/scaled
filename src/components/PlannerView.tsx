import { useState, useMemo } from "react";
import type { Board, BoardCard, BoardColumn, Tag } from "../lib/storage";
import { getBoards, getColumnsForBoard, getAllCards, getTags, updateCard, moveCard } from "../lib/storage";
import { IconChevron } from "./Icons";

function TagPill({ tag }: { tag: Tag }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded-full text-[9px] font-medium"
      style={{ backgroundColor: tag.color + "20", color: tag.color }}
    >
      {tag.name}
    </span>
  );
}

type SortKey = "title" | "board" | "column" | "scheduledAt" | "updatedAt";

export default function PlannerView({ onOpenBoard }: { onOpenBoard: (id: string) => void }) {
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterBoard, setFilterBoard] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const boards = getBoards();
  const tags = getTags();
  const allCards = getAllCards();

  // Build lookup maps
  const boardMap = useMemo(() => {
    const m = new Map<string, Board>();
    boards.forEach((b) => m.set(b.id, b));
    return m;
  }, [boards]);

  const columnMap = useMemo(() => {
    const m = new Map<string, BoardColumn>();
    boards.forEach((b) => {
      getColumnsForBoard(b.id).forEach((c) => m.set(c.id, c));
    });
    return m;
  }, [boards]);

  const filtered = useMemo(() => {
    let list = allCards;
    if (filterBoard) list = list.filter((c) => c.boardId === filterBoard);
    if (filterTag) list = list.filter((c) => c.tags.includes(filterTag));
    return list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "title") cmp = (a.title || "").localeCompare(b.title || "");
      else if (sortBy === "board") cmp = (boardMap.get(a.boardId)?.name || "").localeCompare(boardMap.get(b.boardId)?.name || "");
      else if (sortBy === "column") cmp = (columnMap.get(a.columnId)?.name || "").localeCompare(columnMap.get(b.columnId)?.name || "");
      else if (sortBy === "scheduledAt") cmp = (a.scheduledAt || "").localeCompare(b.scheduledAt || "");
      else cmp = a.updatedAt - b.updatedAt;
      return sortAsc ? cmp : -cmp;
    });
  }, [allCards, sortBy, sortAsc, filterBoard, filterTag, boardMap, columnMap]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(true); }
  };

  const handleScheduleChange = (cardId: string, value: string) => {
    updateCard(cardId, { scheduledAt: value });
  };

  const handleColumnChange = (card: BoardCard, newColId: string) => {
    moveCard(card.id, newColId, 999);
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKey)}
      className="flex items-center gap-1 cursor-default text-[10px] uppercase tracking-[0.1em] font-medium"
      style={{ color: sortBy === sortKey ? "var(--text-primary)" : "var(--text-muted)" }}
    >
      {label}
      {sortBy === sortKey && (
        <IconChevron size={8} className={sortAsc ? "-rotate-90" : "rotate-90"} />
      )}
    </button>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

      <div className="max-w-[960px] mx-auto px-8 pb-20">
        <div className="mb-6">
          <h1 className="font-serif italic text-[2rem] font-light" style={{ color: "var(--text-primary)" }}>
            Planner
          </h1>
          <p className="text-[12px] font-light mt-1" style={{ color: "var(--text-muted)" }}>
            All your board cards in one table
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Board Filter */}
          {boards.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Board:</span>
              <button
                onClick={() => setFilterBoard(null)}
                className="px-2 py-0.5 rounded-full text-[10px] cursor-default transition-colors"
                style={{
                  backgroundColor: !filterBoard ? "var(--bg-hover)" : "transparent",
                  color: !filterBoard ? "var(--text-primary)" : "var(--text-muted)",
                  border: "1px solid var(--border-color)",
                }}
              >
                All
              </button>
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => setFilterBoard(filterBoard === board.id ? null : board.id)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium cursor-default transition-colors"
                  style={{
                    backgroundColor: filterBoard === board.id ? board.color + "20" : "transparent",
                    color: filterBoard === board.id ? board.color : "var(--text-muted)",
                    border: `1px solid ${filterBoard === board.id ? board.color + "40" : "var(--border-color)"}`,
                  }}
                >
                  {board.name}
                </button>
              ))}
            </div>
          )}

          {/* Tag Filter */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Tag:</span>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium cursor-default transition-colors"
                  style={{
                    backgroundColor: filterTag === tag.id ? tag.color + "20" : "transparent",
                    color: filterTag === tag.id ? tag.color : "var(--text-muted)",
                    border: `1px solid ${filterTag === tag.id ? tag.color + "40" : "var(--border-color)"}`,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        {filtered.length > 0 || boards.length > 0 ? (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
            {/* Header */}
            <div
              className="grid gap-3 px-4 py-2.5"
              style={{
                gridTemplateColumns: "1fr 120px 120px 100px 150px",
                backgroundColor: "var(--bg-tertiary)",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <SortHeader label="Title" sortKey="title" />
              <SortHeader label="Board" sortKey="board" />
              <SortHeader label="Column" sortKey="column" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-medium" style={{ color: "var(--text-muted)" }}>Tags</span>
              <SortHeader label="Scheduled" sortKey="scheduledAt" />
            </div>

            {/* Rows */}
            {filtered.map((card, i) => {
              const board = boardMap.get(card.boardId);
              const column = columnMap.get(card.columnId);
              const cardTags = tags.filter((t) => card.tags.includes(t.id));
              const boardColumns = board ? getColumnsForBoard(board.id) : [];

              return (
                <div
                  key={card.id}
                  className="grid gap-3 px-4 py-2.5 items-center transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 120px 120px 100px 150px",
                    backgroundColor: "var(--bg-secondary)",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-color)" : "none",
                  }}
                >
                  {/* Title */}
                  <span
                    className="text-[12px] font-light truncate cursor-default"
                    style={{ color: card.color || "var(--text-primary)", borderLeft: card.color ? `2px solid ${card.color}` : undefined, paddingLeft: card.color ? "8px" : undefined }}
                    onClick={() => board && onOpenBoard(board.id)}
                  >
                    {card.title || "Untitled"}
                  </span>

                  {/* Board */}
                  {board && (
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full truncate cursor-default"
                      style={{ backgroundColor: board.color + "15", color: board.color }}
                      onClick={() => onOpenBoard(board.id)}
                    >
                      {board.name}
                    </span>
                  )}

                  {/* Column — dropdown */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={card.columnId}
                      onChange={(e) => handleColumnChange(card, e.target.value)}
                      className="bg-transparent outline-none text-[10px] rounded-lg px-1 py-0.5 cursor-default w-full"
                      style={{
                        color: column?.color || "var(--text-muted)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      {boardColumns.map((col) => (
                        <option key={col.id} value={col.id}>{col.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {cardTags.map((tag) => <TagPill key={tag.id} tag={tag} />)}
                  </div>

                  {/* Schedule */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <input
                      type="datetime-local"
                      value={card.scheduledAt}
                      onChange={(e) => handleScheduleChange(card.id, e.target.value)}
                      className="bg-transparent outline-none text-[10px] tabular-nums w-full cursor-default"
                      style={{ color: card.scheduledAt ? "var(--text-primary)" : "var(--text-muted)" }}
                    />
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center">
                <p className="text-[12px] font-light italic" style={{ color: "var(--text-muted)" }}>
                  {filterBoard || filterTag ? "No cards match your filters" : "No cards yet — create some on your boards"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[13px] font-light italic" style={{ color: "var(--text-muted)" }}>
              Create a board first to see cards here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
