import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Note } from "../lib/storage";
import { useTheme } from "../lib/theme";

type SidebarView = "pages" | "trash";

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_WORKSPACES: Workspace[] = [
  { id: "all", name: "All Pages", icon: "\ud83d\udcc4", color: "#a1a1aa" },
  { id: "projects", name: "Projects", icon: "\ud83d\ude80", color: "#10b981" },
  { id: "finance", name: "Finance", icon: "\ud83d\udcb0", color: "#f59e0b" },
  { id: "journal", name: "Journal", icon: "\ud83d\udcdd", color: "#8b5cf6" },
  { id: "ideas", name: "Ideas", icon: "\ud83d\udca1", color: "#3b82f6" },
];

interface SidebarProps {
  notes: Note[];
  favorites: Note[];
  trashedNotes: Note[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSettings: () => void;
  activeWorkspace: string;
  onWorkspaceChange: (id: string) => void;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  count,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 cursor-default group"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          {"\u25b6"}
        </motion.span>
        <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          {title}
        </span>
        {count !== undefined && (
          <span className="text-[10px] ml-auto" style={{ color: "var(--text-muted)" }}>
            {count}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoteItem({
  note,
  isActive,
  onSelect,
  onDelete,
  onToggleFavorite,
}: {
  note: Note;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.12 }}
    >
      <button
        onClick={onSelect}
        className="w-full text-left px-3 py-2 rounded-lg mb-px cursor-default transition-all duration-150 group flex items-center gap-2.5"
        style={{
          backgroundColor: isActive ? "var(--bg-hover)" : "transparent",
          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        }}
      >
        {note.icon ? (
          <span className="text-sm flex-shrink-0">{note.icon}</span>
        ) : (
          <span
            className="w-4 h-4 rounded flex-shrink-0"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-light truncate">{note.title || "Untitled"}</div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {formatDate(note.updatedAt)}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 flex-shrink-0">
          <span
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="text-[11px] px-1 rounded cursor-default"
            style={{ color: note.favorite ? "#10b981" : "var(--text-muted)" }}
          >
            {note.favorite ? "\u2605" : "\u2606"}
          </span>
          <span
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-[11px] px-1 rounded cursor-default hover:text-red-400"
            style={{ color: "var(--text-muted)" }}
          >
            \u00d7
          </span>
        </div>
      </button>
    </motion.div>
  );
}

export default function Sidebar({
  notes,
  favorites,
  trashedNotes,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onToggleFavorite,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  activeWorkspace,
  onWorkspaceChange,
}: SidebarProps) {
  const [view, setView] = useState<SidebarView>("pages");
  const { theme, setTheme } = useTheme();

  return (
    <aside
      className="w-[260px] min-w-[260px] h-full flex flex-col border-r backdrop-blur-xl"
      style={{
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Drag region for macOS title bar */}
      <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

      {/* Brand + Theme Toggle */}
      <div className="px-5 pb-3 flex items-center justify-between">
        <h1 className="font-serif italic text-[22px] font-light tracking-tight" style={{ color: "var(--text-primary)" }}>
          Scaled.
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-default text-sm"
            style={{ color: "var(--text-muted)" }}
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? "\u2600\ufe0f" : "\ud83c\udf19"}
          </button>
          <button
            onClick={onOpenSettings}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-default text-sm"
            style={{ color: "var(--text-muted)" }}
            title="Settings"
          >
            {"\u2699\ufe0f"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full py-2 px-3 text-[13px] font-light rounded-lg outline-none transition-colors"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* New Page */}
      <div className="px-3 mb-2">
        <button
          onClick={onCreate}
          className="w-full py-2 px-3 text-left text-[13px] font-light rounded-lg transition-all duration-200 cursor-default"
          style={{
            border: "1px solid var(--border-color)",
            color: "var(--text-secondary)",
          }}
        >
          + New Page
        </button>
      </div>

      {/* Workspaces */}
      <div className="px-3 mb-2">
        <CollapsibleSection title="Workspaces">
          <div className="space-y-0.5">
            {DEFAULT_WORKSPACES.map((ws) => (
              <button
                key={ws.id}
                onClick={() => onWorkspaceChange(ws.id)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-light flex items-center gap-2 cursor-default transition-colors"
                style={{
                  backgroundColor: activeWorkspace === ws.id ? "var(--bg-hover)" : "transparent",
                  color: activeWorkspace === ws.id ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <span className="text-sm">{ws.icon}</span>
                <span>{ws.name}</span>
              </button>
            ))}
          </div>
        </CollapsibleSection>
      </div>

      {/* View Tabs */}
      <div className="px-3 mb-2 flex gap-1">
        {(["pages", "trash"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 py-1.5 text-[11px] font-mono tracking-wider rounded-lg transition-colors cursor-default uppercase"
            style={{
              backgroundColor: view === v ? "var(--bg-tertiary)" : "transparent",
              color: view === v ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Content */}
      <nav className="flex-1 overflow-y-auto px-2">
        {view === "pages" ? (
          <>
            {favorites.length > 0 && !searchQuery && (
              <CollapsibleSection title="Favorites" count={favorites.length}>
                <AnimatePresence mode="popLayout">
                  {favorites.map((note) => (
                    <NoteItem
                      key={`fav-${note.id}`}
                      note={note}
                      isActive={activeId === note.id}
                      onSelect={() => onSelect(note.id)}
                      onDelete={() => onDelete(note.id)}
                      onToggleFavorite={() => onToggleFavorite(note.id)}
                    />
                  ))}
                </AnimatePresence>
              </CollapsibleSection>
            )}

            <CollapsibleSection title={searchQuery ? "Results" : "All Pages"} count={notes.length}>
              <AnimatePresence mode="popLayout">
                {notes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isActive={activeId === note.id}
                    onSelect={() => onSelect(note.id)}
                    onDelete={() => onDelete(note.id)}
                    onToggleFavorite={() => onToggleFavorite(note.id)}
                  />
                ))}
              </AnimatePresence>
              {notes.length === 0 && searchQuery && (
                <p className="text-center text-[13px] py-6 font-light italic" style={{ color: "var(--text-muted)" }}>
                  No results
                </p>
              )}
            </CollapsibleSection>
          </>
        ) : (
          <div>
            <AnimatePresence mode="popLayout">
              {trashedNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 mb-px"
                >
                  <button
                    onClick={() => onSelect(note.id)}
                    className="flex-1 text-left px-3 py-2 rounded-lg transition-colors cursor-default"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <div className="text-[13px] font-light truncate">
                      {note.icon} {note.title || "Untitled"}
                    </div>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {formatDate(note.updatedAt)}
                    </div>
                  </button>
                  <div className="flex gap-0.5 flex-shrink-0 pr-1">
                    <button
                      onClick={() => onRestore(note.id)}
                      className="text-[11px] px-1.5 py-1 rounded cursor-default"
                      style={{ color: "var(--text-muted)" }}
                      title="Restore"
                    >
                      {"\u21a9"}
                    </button>
                    <button
                      onClick={() => { if (confirm("Permanently delete?")) onPermanentDelete(note.id); }}
                      className="text-[11px] px-1.5 py-1 rounded cursor-default"
                      style={{ color: "var(--text-muted)" }}
                      title="Delete forever"
                    >
                      {"\u2715"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {trashedNotes.length === 0 && (
              <p className="text-center text-[13px] py-8 font-light italic" style={{ color: "var(--text-muted)" }}>
                Trash is empty
              </p>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: "var(--border-color)" }}>
        <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          {notes.length} {notes.length === 1 ? "page" : "pages"}
        </p>
      </div>
    </aside>
  );
}
