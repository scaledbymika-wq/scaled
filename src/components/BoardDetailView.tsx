import { useState, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import type { Board, BoardColumn, BoardCard, Tag } from "../lib/storage";
import {
  getColumnsForBoard, getCardsForColumn, getCardsForBoard, getTags,
  createColumn, updateColumn, deleteColumn,
  createCard, moveCard, updateBoard,
} from "../lib/storage";
import { IconPlus, IconChevron, IconX } from "./Icons";
import CardModal from "./CardModal";

interface BoardDetailViewProps {
  board: Board;
  onBack: () => void;
  onRefresh: () => void;
}

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

function CardItem({
  card,
  tags,
  onOpen,
  onDragStart,
}: {
  card: BoardCard;
  tags: Tag[];
  onOpen: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const cardTags = tags.filter((t) => card.tags.includes(t.id));

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className="rounded-xl p-3 cursor-default transition-all duration-100 group"
      style={{
        backgroundColor: "var(--bg-primary)",
        border: `1px solid ${card.color ? card.color + "40" : "var(--border-color)"}`,
        borderLeft: card.color ? `3px solid ${card.color}` : undefined,
      }}
    >
      <p className="text-[12px] font-light leading-snug" style={{ color: "var(--text-primary)" }}>
        {card.title || "Untitled"}
      </p>
      {card.description && (
        <p className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
          {card.description}
        </p>
      )}
      {(cardTags.length > 0 || card.scheduledAt) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {cardTags.map((t) => <TagPill key={t.id} tag={t} />)}
          {card.scheduledAt && (
            <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
              {new Date(card.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ColumnView({
  column,
  cards,
  tags,
  onRefresh,
  onOpenCard,
  dragOverColumnId,
  dropIndex,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropOnColumn,
  onCardDragStart,
}: {
  column: BoardColumn;
  cards: BoardCard[];
  tags: Tag[];
  onRefresh: () => void;
  onOpenCard: (card: BoardCard) => void;
  dragOverColumnId: string | null;
  dropIndex: number;
  onDragOverColumn: (colId: string, e: React.DragEvent) => void;
  onDragLeaveColumn: () => void;
  onDropOnColumn: (colId: string) => void;
  onCardDragStart: (cardId: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const addRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragOver = dragOverColumnId === column.id;

  const handleAddCard = () => {
    const title = addRef.current?.value.trim();
    if (title) {
      createCard(column.boardId, column.id, title);
      onRefresh();
      if (addRef.current) addRef.current.value = "";
      // Keep input open for rapid entry
      addRef.current?.focus();
    } else {
      setAdding(false);
    }
  };

  const handleRename = () => {
    const name = nameRef.current?.value.trim();
    if (name) updateColumn(column.id, { name });
    setEditingName(false);
    onRefresh();
  };

  const handleDelete = () => {
    if (confirm(`Delete "${column.name}" and all its cards?`)) {
      deleteColumn(column.id);
      onRefresh();
    }
  };

  return (
    <div
      className="min-w-[280px] max-w-[300px] flex-shrink-0 flex flex-col rounded-2xl transition-colors duration-150"
      style={{
        backgroundColor: isDragOver ? "var(--bg-tertiary)" : "var(--bg-secondary)",
        border: `1px solid ${isDragOver ? column.color + "40" : "var(--border-color)"}`,
      }}
      onDragOver={(e) => { e.preventDefault(); onDragOverColumn(column.id, e); }}
      onDragLeave={onDragLeaveColumn}
      onDrop={(e) => { e.preventDefault(); onDropOnColumn(column.id); }}
    >
      {/* Column Header */}
      <div className="px-3 py-2.5 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: column.color }} />
        {editingName ? (
          <input
            ref={nameRef}
            autoFocus
            defaultValue={column.name}
            className="flex-1 bg-transparent outline-none text-[12px] font-medium"
            style={{ color: "var(--text-primary)" }}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditingName(false); }}
            onBlur={handleRename}
          />
        ) : (
          <span
            onClick={() => setEditingName(true)}
            className="flex-1 text-[12px] font-medium cursor-default"
            style={{ color: "var(--text-primary)" }}
          >
            {column.name}
          </span>
        )}
        <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
          {cards.length}
        </span>
        <button
          onClick={handleDelete}
          className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity cursor-default"
          style={{ color: "var(--text-muted)" }}
        >
          <IconX size={10} />
        </button>
      </div>

      {/* Cards */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[60px]" data-column-id={column.id}>
        <AnimatePresence mode="popLayout">
          {cards.map((card, i) => (
            <div key={card.id}>
              {/* Drop indicator line */}
              {isDragOver && dropIndex === i && (
                <div className="h-[2px] rounded-full mx-1 mb-1" style={{ backgroundColor: column.color }} />
              )}
              <CardItem
                card={card}
                tags={tags}
                onOpen={() => onOpenCard(card)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", card.id);
                  onCardDragStart(card.id);
                }}
              />
            </div>
          ))}
          {/* Drop indicator at end */}
          {isDragOver && dropIndex >= cards.length && (
            <div className="h-[2px] rounded-full mx-1" style={{ backgroundColor: column.color }} />
          )}
        </AnimatePresence>
      </div>

      {/* Add Card */}
      <div className="px-2 pb-2">
        {adding ? (
          <input
            ref={addRef}
            autoFocus
            placeholder="Card title..."
            className="w-full px-3 py-2 rounded-xl text-[12px] font-light bg-transparent outline-none"
            style={{ color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCard();
              if (e.key === "Escape") setAdding(false);
            }}
            onBlur={handleAddCard}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full px-3 py-1.5 rounded-xl text-[11px] font-light flex items-center gap-1.5 cursor-default transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <IconPlus size={10} />
            Add card
          </button>
        )}
      </div>
    </div>
  );
}

export default function BoardDetailView({ board, onBack, onRefresh }: BoardDetailViewProps) {
  const [editingName, setEditingName] = useState(false);
  const [openCard, setOpenCard] = useState<BoardCard | null>(null);
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [dropIdx, setDropIdx] = useState(0);
  const nameRef = useRef<HTMLInputElement>(null);

  const columns = getColumnsForBoard(board.id);
  const tags = getTags();

  const handleRename = () => {
    const name = nameRef.current?.value.trim();
    if (name) updateBoard(board.id, { name });
    setEditingName(false);
    onRefresh();
  };

  const handleAddColumn = () => {
    createColumn(board.id, "New Column");
    onRefresh();
  };

  const handleDragOverColumn = useCallback((colId: string, e: React.DragEvent) => {
    setDragOverCol(colId);
    // Calculate drop index from mouse position
    const container = (e.currentTarget as HTMLElement).querySelector(`[data-column-id="${colId}"]`);
    if (!container) return;
    const cardEls = Array.from(container.children).filter((el) => !(el as HTMLElement).style.backgroundColor) as HTMLElement[];
    let idx = cardEls.length;
    for (let i = 0; i < cardEls.length; i++) {
      const rect = cardEls[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        idx = i;
        break;
      }
    }
    setDropIdx(idx);
  }, []);

  const handleDrop = useCallback((colId: string) => {
    if (dragCardId) {
      moveCard(dragCardId, colId, dropIdx);
      onRefresh();
    }
    setDragCardId(null);
    setDragOverCol(null);
  }, [dragCardId, dropIdx, onRefresh]);

  return (
    <div className="h-full flex flex-col">
      <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

      {/* Header */}
      <div className="px-8 pb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-default transition-colors"
          style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-tertiary)" }}
        >
          <IconChevron size={12} className="rotate-180" />
        </button>

        <span className="text-xl">{board.icon || "📋"}</span>

        {editingName ? (
          <input
            ref={nameRef}
            autoFocus
            defaultValue={board.name}
            className="bg-transparent outline-none font-serif italic text-[1.5rem] font-light"
            style={{ color: "var(--text-primary)" }}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditingName(false); }}
            onBlur={handleRename}
          />
        ) : (
          <h1
            onClick={() => setEditingName(true)}
            className="font-serif italic text-[1.5rem] font-light cursor-default"
            style={{ color: "var(--text-primary)" }}
          >
            {board.name}
          </h1>
        )}

        <button
          onClick={handleAddColumn}
          className="ml-auto px-3 py-1.5 rounded-xl text-[11px] font-light flex items-center gap-1.5 cursor-default transition-colors"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border-color)" }}
        >
          <IconPlus size={10} />
          Add Column
        </button>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto px-8 pb-8">
        <div className="flex gap-4 h-full">
          {columns.map((col) => (
            <ColumnView
              key={col.id}
              column={col}
              cards={getCardsForColumn(col.id)}
              tags={tags}
              onRefresh={onRefresh}
              onOpenCard={setOpenCard}
              dragOverColumnId={dragOverCol}
              dropIndex={dropIdx}
              onDragOverColumn={handleDragOverColumn}
              onDragLeaveColumn={() => setDragOverCol(null)}
              onDropOnColumn={handleDrop}
              onCardDragStart={setDragCardId}
            />
          ))}

          {columns.length === 0 && (
            <div className="flex items-center justify-center w-full">
              <button
                onClick={handleAddColumn}
                className="px-6 py-3 rounded-2xl text-[13px] font-light cursor-default"
                style={{ border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}
              >
                <IconPlus size={14} />
                <span className="ml-2">Add your first column</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Modal */}
      <AnimatePresence>
        {openCard && (
          <CardModal
            card={openCard}
            columns={columns}
            onClose={() => { setOpenCard(null); onRefresh(); }}
            onRefresh={() => {
              // Re-fetch the card
              const updated = getCardsForBoard(board.id).find((c) => c.id === openCard.id);
              if (updated) setOpenCard(updated);
              onRefresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
