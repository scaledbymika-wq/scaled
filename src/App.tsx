import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import EmptyState from "./components/EmptyState";
import TemplatePicker, { type Template } from "./components/TemplatePicker";
import Settings from "./components/Settings";
import UpdateDialog from "./components/UpdateDialog";
import CommandPalette from "./components/CommandPalette";
import FocusTimer from "./components/FocusTimer";
import HabitTracker from "./components/HabitTracker";
import BoardListView from "./components/BoardListView";
import BoardDetailView from "./components/BoardDetailView";
import PlannerView from "./components/PlannerView";
import { useTheme } from "./lib/theme";
import {
  getNotes,
  getNotesForWorkspace,
  getFavorites,
  getTrashed,
  searchNotes,
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  permanentlyDelete,
  toggleFavorite,
  getWorkspaces,
  createWorkspace,
  deleteWorkspace,
  getBoards,
  getBoard,
  type Note,
  type Workspace,
  type Board,
} from "./lib/storage";
import {
  IconTarget, IconMenu, IconExpand, IconShrink,
} from "./components/Icons";

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [favorites, setFavorites] = useState<Note[]>([]);
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [activeView, setActiveView] = useState("pages"); // "pages" | "habits" | "boards" | "board:{id}" | "planner"
  const [boards, setBoards] = useState<Board[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { settings, theme, setTheme } = useTheme();

  const refresh = useCallback(() => {
    const q = searchQuery.trim();
    if (q) {
      setNotes(searchNotes(q));
    } else if (activeWorkspace) {
      setNotes(getNotesForWorkspace(activeWorkspace));
    } else {
      setNotes(getNotes());
    }
    setFavorites(getFavorites());
    setTrashedNotes(getTrashed());
    setWorkspaces(getWorkspaces());
    setBoards(getBoards());
  }, [searchQuery, activeWorkspace]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const loaded = getNotes();
    if (loaded.length > 0 && !activeId) {
      setActiveId(loaded[0].id);
    }
    setWorkspaces(getWorkspaces());
  }, []);

  const activeNote =
    notes.find((n) => n.id === activeId) ||
    trashedNotes.find((n) => n.id === activeId);

  const handleNewPage = useCallback(() => {
    setShowTemplatePicker(true);
  }, []);

  const handleTemplateSelect = useCallback(
    (template: Template) => {
      const note = createNote(null, activeWorkspace);
      if (template.defaultTitle || template.content) {
        updateNote(note.id, {
          title: template.defaultTitle,
          content: template.content,
        });
      }
      setSearchQuery("");
      setShowTemplatePicker(false);
      setActiveView("pages");
      refresh();
      setActiveId(note.id);
    },
    [refresh, activeWorkspace]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteNote(id);
      refresh();
      if (activeId === id) {
        const remaining = getNotes();
        setActiveId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [activeId, refresh]
  );

  const handleRestore = useCallback(
    (id: string) => {
      restoreNote(id);
      refresh();
      setActiveId(id);
      setActiveView("pages");
    },
    [refresh]
  );

  const handlePermanentDelete = useCallback(
    (id: string) => {
      permanentlyDelete(id);
      refresh();
      if (activeId === id) setActiveId(null);
    },
    [activeId, refresh]
  );

  const handleToggleFavorite = useCallback(
    (id: string) => {
      toggleFavorite(id);
      refresh();
    },
    [refresh]
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      if (!activeId) return;
      updateNote(activeId, { title });
      setNotes((prev) =>
        prev.map((n) => (n.id === activeId ? { ...n, title, updatedAt: Date.now() } : n))
      );
    },
    [activeId]
  );

  const handleContentChange = useCallback(
    (content: string) => {
      if (!activeId) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateNote(activeId, { content });
        refresh();
      }, 400);
      setNotes((prev) =>
        prev.map((n) => (n.id === activeId ? { ...n, content, updatedAt: Date.now() } : n))
      );
    },
    [activeId, refresh]
  );

  const handleIconChange = useCallback(
    (icon: string) => {
      if (!activeId) return;
      updateNote(activeId, { icon });
      refresh();
    },
    [activeId, refresh]
  );

  const handleCoverChange = useCallback(
    (cover: string) => {
      if (!activeId) return;
      updateNote(activeId, { cover });
      refresh();
    },
    [activeId, refresh]
  );

  const handleCreateWorkspace = useCallback(
    (name: string) => {
      createWorkspace(name);
      refresh();
    },
    [refresh]
  );

  const handleDeleteWorkspace = useCallback(
    (id: string) => {
      deleteWorkspace(id);
      if (activeWorkspace === id) setActiveWorkspace("");
      refresh();
    },
    [activeWorkspace, refresh]
  );

  const handleAssignWorkspace = useCallback(
    (noteId: string, workspaceId: string) => {
      updateNote(noteId, { workspace: workspaceId });
      refresh();
    },
    [refresh]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        handleNewPage();
      }
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((s) => !s);
      }
      if (e.metaKey && e.key === "f") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder="Search..."]')?.focus();
      }
      if (e.metaKey && e.key === ",") {
        e.preventDefault();
        setShowSettings((s) => !s);
      }
      if (e.metaKey && e.key === "\\") {
        e.preventDefault();
        setSidebarCollapsed((s) => !s);
      }
      if (e.key === "Escape") {
        if (zenMode) { setZenMode(false); return; }
        if (showCommandPalette) { setShowCommandPalette(false); return; }
        if (showTemplatePicker) { setShowTemplatePicker(false); return; }
        if (showSettings) { setShowSettings(false); return; }
        if (showFocusTimer) { setShowFocusTimer(false); return; }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNewPage, showTemplatePicker, showSettings, showCommandPalette, showFocusTimer, zenMode]);

  // Word + char count for active note
  const textStats = useMemo(() => {
    if (!activeNote) return { words: 0, chars: 0, readingTime: 0 };
    const text = activeNote.content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#?\w+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingTime };
  }, [activeNote]);

  // Zen Mode
  if (zenMode) {
    return (
      <div className="h-screen w-full relative" style={{ backgroundColor: "var(--bg-primary)" }}>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setZenMode(false)}
          className="absolute top-5 right-5 z-50 w-8 h-8 rounded-lg flex items-center justify-center cursor-default opacity-0 hover:opacity-60 transition-opacity"
          style={{ color: "var(--text-muted)" }}
          title="Exit Zen Mode (Esc)"
        >
          <IconShrink size={14} />
        </motion.button>

        <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

        {activeNote ? (
          <Editor
            content={activeNote.content}
            onUpdate={handleContentChange}
            title={activeNote.title}
            onTitleChange={handleTitleChange}
            icon={activeNote.icon}
            cover={activeNote.cover}
            onIconChange={handleIconChange}
            onCoverChange={handleCoverChange}
            zenMode
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[14px] font-light italic" style={{ color: "var(--text-muted)" }}>
              Select a page to enter Zen Mode
            </p>
          </div>
        )}
        <UpdateDialog />
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
            <Sidebar
              notes={notes}
              favorites={favorites}
              trashedNotes={trashedNotes}
              activeId={activeId}
              onSelect={(id) => { setActiveId(id); setActiveView("pages"); }}
              onCreate={handleNewPage}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              onToggleFavorite={handleToggleFavorite}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenSettings={() => setShowSettings(true)}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={setActiveWorkspace}
              workspaces={workspaces}
              onCreateWorkspace={handleCreateWorkspace}
              onDeleteWorkspace={handleDeleteWorkspace}
              onAssignWorkspace={handleAssignWorkspace}
              onCollapse={() => setSidebarCollapsed(true)}
              boards={boards}
              activeBoardId={activeView.startsWith("board:") ? activeView.slice(6) : null}
              onSelectBoard={(id) => setActiveView(`board:${id}`)}
              onOpenBoardList={() => setActiveView("boards")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 h-full relative" style={{ backgroundColor: "var(--bg-primary)" }}>
        {/* Sidebar toggle when collapsed */}
        <AnimatePresence>
          {sidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onClick={() => setSidebarCollapsed(false)}
              className="absolute top-4 left-4 z-40 w-8 h-8 rounded-lg flex items-center justify-center cursor-default transition-colors"
              style={{ color: "var(--text-muted)" }}
              title="Show sidebar (Cmd+\\)"
            >
              <IconMenu size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main Content — switch between editor and other views */}
        {activeView === "habits" ? (
          <HabitTracker
            notes={getNotes()}
            workspaces={workspaces}
            onSelectNote={(id) => { setActiveId(id); setActiveView("pages"); }}
            onOpenFocusTimer={() => setShowFocusTimer(true)}
          />
        ) : activeView === "boards" ? (
          <BoardListView
            boards={boards}
            onSelectBoard={(id) => setActiveView(`board:${id}`)}
            onRefresh={refresh}
          />
        ) : activeView.startsWith("board:") ? (
          (() => {
            const boardId = activeView.slice(6);
            const board = getBoard(boardId);
            return board ? (
              <BoardDetailView
                board={board}
                onBack={() => setActiveView("boards")}
                onRefresh={refresh}
              />
            ) : (
              <BoardListView boards={boards} onSelectBoard={(id) => setActiveView(`board:${id}`)} onRefresh={refresh} />
            );
          })()
        ) : activeView === "planner" ? (
          <PlannerView
            onOpenBoard={(id) => setActiveView(`board:${id}`)}
          />
        ) : (
          <>
            <AnimatePresence mode="wait">
              {activeNote ? (
                <motion.div
                  key={activeNote.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="h-full"
                >
                  <Editor
                    content={activeNote.content}
                    onUpdate={handleContentChange}
                    title={activeNote.title}
                    onTitleChange={handleTitleChange}
                    icon={activeNote.icon}
                    cover={activeNote.cover}
                    onIconChange={handleIconChange}
                    onCoverChange={handleCoverChange}
                  />
                </motion.div>
              ) : (
                <EmptyState onCreate={handleNewPage} />
              )}
            </AnimatePresence>

            {/* Status Bar */}
            {activeNote && settings.showWordCount && (
              <div className="absolute bottom-0 right-0 px-4 py-2 flex items-center gap-4">
                <button
                  onClick={() => setZenMode(true)}
                  className="flex items-center gap-1.5 cursor-default transition-opacity hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  <IconExpand size={10} />
                  <span className="text-[9px] uppercase tracking-[0.08em]">Zen</span>
                </button>
                <button
                  onClick={() => setShowFocusTimer(true)}
                  className="flex items-center gap-1.5 cursor-default transition-opacity hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  <IconTarget size={10} />
                  <span className="text-[9px] uppercase tracking-[0.08em]">Focus</span>
                </button>
                <span
                  className="text-[9px] font-mono tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  {textStats.words}w · {textStats.chars}c · {textStats.readingTime}m
                </span>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showTemplatePicker && (
          <TemplatePicker
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplatePicker(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      <CommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        notes={getNotes()}
        workspaces={workspaces}
        onSelectNote={(id) => { setActiveId(id); setActiveView("pages"); }}
        onCreatePage={handleNewPage}
        onOpenSettings={() => setShowSettings(true)}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onToggleFocusTimer={() => setShowFocusTimer(true)}
        onOpenHabitTracker={() => setActiveView("habits")}
        onOpenBoard={() => setActiveView("boards")}
        onOpenPlanner={() => setActiveView("planner")}
        boards={boards}
        onSelectBoard={(id) => setActiveView(`board:${id}`)}
        onToggleZenMode={() => setZenMode(true)}
        onToggleSidebar={() => setSidebarCollapsed((s) => !s)}
        theme={theme}
      />

      <FocusTimer
        open={showFocusTimer}
        onClose={() => setShowFocusTimer(false)}
      />

      <UpdateDialog />
    </div>
  );
}
