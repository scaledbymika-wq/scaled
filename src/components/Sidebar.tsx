import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import type { Note, Workspace } from "../lib/storage";
import {
  IconSearch, IconPlus, IconChevron, IconSettings,
  IconStar, IconStarFilled, IconTrash, IconPage, IconPages,
  IconFolder, IconFolderPlus, IconX, IconRestore, IconPen, IconSidebar,
} from "./Icons";

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
  workspaces: Workspace[];
  onCreateWorkspace: (name: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onAssignWorkspace: (noteId: string, workspaceId: string) => void;
  onCollapse: () => void;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  count,
  children,
  action,
}: {
  title: string;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-3 py-1 cursor-default group"
      >
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          style={{ color: "var(--text-muted)" }}
        >
          <IconChevron size={9} />
        </motion.div>
        <span className="text-[10px] font-sans tracking-[0.12em] uppercase font-medium" style={{ color: "var(--text-muted)" }}>
          {title}
        </span>
        {count !== undefined && (
          <span className="text-[10px] ml-auto tabular-nums" style={{ color: "var(--text-muted)" }}>
            {count}
          </span>
        )}
        {action && (
          <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            {action}
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
        className="w-full text-left px-3 py-1.5 rounded-xl mb-px cursor-default transition-all duration-100 group flex items-center gap-2"
        style={{
          backgroundColor: isActive ? "var(--bg-hover)" : "transparent",
          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        }}
      >
        {note.icon ? (
          <span className="text-[13px] flex-shrink-0">{note.icon}</span>
        ) : (
          <span style={{ color: "var(--text-muted)" }} className="flex-shrink-0">
            <IconPage size={14} strokeWidth={1.5} />
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-light truncate">{note.title || "Untitled"}</div>
          <div className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {formatDate(note.updatedAt)}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-shrink-0">
          <span
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="cursor-default flex items-center"
            style={{ color: note.favorite ? "#10b981" : "var(--text-muted)" }}
          >
            {note.favorite ? <IconStarFilled size={11} /> : <IconStar size={11} />}
          </span>
          <span
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="cursor-default flex items-center"
            style={{ color: "var(--text-muted)" }}
          >
            <IconTrash size={11} />
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
  workspaces,
  onCreateWorkspace,
  onDeleteWorkspace,
  onCollapse,
}: SidebarProps) {
  const [creatingWs, setCreatingWs] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const wsInputRef = useRef<HTMLInputElement>(null);

  const handleCreateWs = () => {
    const name = wsInputRef.current?.value.trim();
    if (name) {
      onCreateWorkspace(name);
      setCreatingWs(false);
    }
  };

  return (
    <aside
      className="w-[260px] min-w-[260px] h-full flex flex-col border-r"
      style={{
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--border-color)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Drag region for macOS title bar */}
      <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

      {/* Brand + Controls */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <h1 className="font-serif italic text-[20px] font-light tracking-tight" style={{ color: "var(--text-primary)" }}>
          Scaled.
        </h1>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onOpenSettings}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 cursor-default"
            style={{ color: "var(--text-muted)" }}
            title="Settings (Cmd+,)"
          >
            <IconSettings size={14} />
          </button>
          <button
            onClick={onCollapse}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 cursor-default"
            style={{ color: "var(--text-muted)" }}
            title="Collapse sidebar (Cmd+\\)"
          >
            <IconSidebar size={14} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 mb-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
            <IconSearch size={12} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full py-1.5 pl-7 pr-3 text-[12px] font-light rounded-xl outline-none transition-colors"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* New Page */}
      <div className="px-3 mb-3">
        <button
          onClick={onCreate}
          className="w-full py-2 px-3 text-left text-[12px] font-light rounded-xl transition-all duration-100 cursor-default flex items-center gap-2"
          style={{
            border: "1px solid var(--border-color)",
            color: "var(--text-secondary)",
          }}
        >
          <IconPlus size={13} />
          <span>New Page</span>
        </button>
      </div>

      {/* Content */}
      <nav className="flex-1 overflow-y-auto px-2">
        {/* Workspaces — only show when multiple exist */}
        {workspaces.length > 0 && (
          <div className="mb-1">
            <CollapsibleSection
              title="Workspaces"
              action={
                <button
                  onClick={() => setCreatingWs(true)}
                  className="flex items-center justify-center cursor-default"
                  style={{ color: "var(--text-muted)" }}
                >
                  <IconFolderPlus size={12} />
                </button>
              }
            >
              <div className="space-y-px">
                <button
                  onClick={() => onWorkspaceChange("")}
                  className="w-full text-left px-3 py-1 rounded-md text-[12px] font-light flex items-center gap-2 cursor-default transition-colors"
                  style={{
                    backgroundColor: activeWorkspace === "" ? "var(--bg-hover)" : "transparent",
                    color: activeWorkspace === "" ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  <IconPages size={13} />
                  <span>All Pages</span>
                </button>

                {workspaces.map((ws) => (
                  <div key={ws.id} className="group flex items-center">
                    <button
                      onClick={() => onWorkspaceChange(ws.id)}
                      className="flex-1 text-left px-3 py-1 rounded-md text-[12px] font-light flex items-center gap-2 cursor-default transition-colors"
                      style={{
                        backgroundColor: activeWorkspace === ws.id ? "var(--bg-hover)" : "transparent",
                        color: activeWorkspace === ws.id ? "var(--text-primary)" : "var(--text-secondary)",
                      }}
                    >
                      <IconFolder size={13} />
                      <span>{ws.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0" style={{ backgroundColor: ws.color }} />
                    </button>
                    <button
                      onClick={() => onDeleteWorkspace(ws.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mr-1 cursor-default flex items-center"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <IconX size={10} />
                    </button>
                  </div>
                ))}

                <AnimatePresence>
                  {creatingWs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-1.5 px-3 py-1">
                        <span className="flex-shrink-0" style={{ color: "var(--text-muted)" }}><IconFolder size={13} /></span>
                        <input
                          ref={wsInputRef}
                          autoFocus
                          placeholder="Name..."
                          className="flex-1 bg-transparent outline-none text-[12px] font-light"
                          style={{ color: "var(--text-primary)" }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateWs();
                            if (e.key === "Escape") setCreatingWs(false);
                          }}
                          onBlur={() => {
                            handleCreateWs();
                            setCreatingWs(false);
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Favorites */}
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

        {/* Pages */}
        <CollapsibleSection title={searchQuery ? "Results" : "Pages"} count={notes.length}>
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
            <p className="text-center text-[12px] py-6 font-light italic" style={{ color: "var(--text-muted)" }}>
              No results
            </p>
          )}
          {notes.length === 0 && !searchQuery && (
            <p className="text-center text-[12px] py-6 font-light italic" style={{ color: "var(--text-muted)" }}>
              No pages yet
            </p>
          )}
        </CollapsibleSection>

        {/* Trash — inline collapsible, only if items exist */}
        {trashedNotes.length > 0 && (
          <CollapsibleSection title="Trash" count={trashedNotes.length} defaultOpen={false}>
            <div className="mb-1 px-1">
              <button
                onClick={() => {
                  if (confirm("Permanently delete all trashed items?")) {
                    trashedNotes.forEach((n) => onPermanentDelete(n.id));
                  }
                }}
                className="text-[10px] uppercase tracking-[0.08em] px-2 py-1 rounded-md cursor-default transition-colors"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border-color)" }}
              >
                Empty Trash
              </button>
            </div>
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
                    className="flex-1 text-left px-3 py-1.5 rounded-md transition-colors cursor-default flex items-center gap-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span style={{ color: "var(--text-muted)" }}><IconPage size={13} /></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-light truncate">
                        {note.title || "Untitled"}
                      </div>
                    </div>
                  </button>
                  <div className="flex gap-1 flex-shrink-0 pr-1">
                    <button
                      onClick={() => onRestore(note.id)}
                      className="cursor-default flex items-center p-0.5"
                      style={{ color: "var(--text-muted)" }}
                      title="Restore"
                    >
                      <IconRestore size={12} />
                    </button>
                    <button
                      onClick={() => onPermanentDelete(note.id)}
                      className="cursor-default flex items-center p-0.5"
                      style={{ color: "var(--text-muted)" }}
                      title="Delete forever"
                    >
                      <IconX size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CollapsibleSection>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <IconPen size={10} />
          <span className="text-[9px] tracking-[0.1em] uppercase font-medium">
            {notes.length} {notes.length === 1 ? "page" : "pages"}
          </span>
        </div>
        {/* Create workspace if none exist yet */}
        {workspaces.length === 0 && (
          <button
            onClick={() => setCreatingWs(true)}
            className="flex items-center gap-1 cursor-default transition-opacity hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
            title="Create workspace"
          >
            <IconFolderPlus size={10} />
            <span className="text-[9px] tracking-[0.1em] uppercase font-medium">Workspace</span>
          </button>
        )}
      </div>

      {/* Floating workspace creation when no workspaces */}
      <AnimatePresence>
        {creatingWs && workspaces.length === 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-3 pb-2"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
              <span className="flex-shrink-0" style={{ color: "var(--text-muted)" }}><IconFolder size={13} /></span>
              <input
                ref={wsInputRef}
                autoFocus
                placeholder="Workspace name..."
                className="flex-1 bg-transparent outline-none text-[12px] font-light"
                style={{ color: "var(--text-primary)" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateWs();
                  if (e.key === "Escape") setCreatingWs(false);
                }}
                onBlur={() => {
                  handleCreateWs();
                  setCreatingWs(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
