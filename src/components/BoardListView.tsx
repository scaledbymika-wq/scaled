import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Board } from "../lib/storage";
import { getColumnsForBoard, getCardsForBoard, createBoard, deleteBoard } from "../lib/storage";
import { IconPlus, IconTrash } from "./Icons";

interface BoardListViewProps {
  boards: Board[];
  onSelectBoard: (id: string) => void;
  onRefresh: () => void;
}

export default function BoardListView({ boards, onSelectBoard, onRefresh }: BoardListViewProps) {
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    const name = inputRef.current?.value.trim();
    if (name) {
      const board = createBoard(name);
      onRefresh();
      onSelectBoard(board.id);
    }
    setCreating(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this board and all its cards?")) {
      deleteBoard(id);
      onRefresh();
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

      <div className="max-w-[800px] mx-auto px-8 pb-20">
        <div className="mb-8">
          <h1 className="font-serif italic text-[2rem] font-light" style={{ color: "var(--text-primary)" }}>
            Boards
          </h1>
          <p className="text-[12px] font-light mt-1" style={{ color: "var(--text-muted)" }}>
            Your kanban workspaces
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {boards.map((board) => {
              const cols = getColumnsForBoard(board.id);
              const cards = getCardsForBoard(board.id);
              return (
                <motion.button
                  key={board.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onSelectBoard(board.id)}
                  className="text-left rounded-2xl p-5 cursor-default transition-all duration-150 group relative overflow-hidden"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  {/* Color accent stripe */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ backgroundColor: board.color }} />

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{board.icon || "📋"}</span>
                    <h3 className="text-[15px] font-light" style={{ color: "var(--text-primary)" }}>
                      {board.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {cols.length} {cols.length === 1 ? "column" : "columns"}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {cards.length} {cards.length === 1 ? "card" : "cards"}
                    </span>
                  </div>

                  {/* Column preview dots */}
                  <div className="flex gap-1.5 mt-3">
                    {cols.map((col) => (
                      <div key={col.id} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{col.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, board.id)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-default"
                    style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-tertiary)" }}
                  >
                    <IconTrash size={11} />
                  </button>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {/* New Board Card */}
          {creating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-5 flex flex-col justify-center"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <input
                ref={inputRef}
                autoFocus
                placeholder="Board name..."
                className="bg-transparent outline-none text-[15px] font-light mb-2"
                style={{ color: "var(--text-primary)" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setCreating(false);
                }}
                onBlur={handleCreate}
              />
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Press Enter to create
              </span>
            </motion.div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-default transition-all duration-150 min-h-[120px]"
              style={{
                border: "1px dashed var(--border-color)",
                color: "var(--text-muted)",
              }}
            >
              <IconPlus size={20} />
              <span className="text-[12px] font-light">New Board</span>
            </button>
          )}
        </div>

        {boards.length === 0 && !creating && (
          <p className="text-center text-[13px] font-light italic mt-8" style={{ color: "var(--text-muted)" }}>
            Create your first board to get started
          </p>
        )}
      </div>
    </div>
  );
}
