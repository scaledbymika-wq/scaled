import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import EmptyState from "./components/EmptyState";
import TemplatePicker, { type Template } from "./components/TemplatePicker";
import Settings from "./components/Settings";
import UpdateDialog from "./components/UpdateDialog";
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
  type Note,
  type Workspace,
} from "./lib/storage";

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [favorites, setFavorites] = useState<Note[]>([]);
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { settings } = useTheme();

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
      if (e.metaKey && e.key === "f") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder="Search..."]')?.focus();
      }
      if (e.metaKey && e.key === ",") {
        e.preventDefault();
        setShowSettings((s) => !s);
      }
      if (e.key === "Escape") {
        if (showTemplatePicker) setShowTemplatePicker(false);
        if (showSettings) setShowSettings(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNewPage, showTemplatePicker, showSettings]);

  // Word count for active note
  const wordCount = activeNote
    ? activeNote.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Sidebar
        notes={notes}
        favorites={favorites}
        trashedNotes={trashedNotes}
        activeId={activeId}
        onSelect={setActiveId}
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
      />

      <main className="flex-1 h-full relative" style={{ backgroundColor: "var(--bg-primary)" }}>
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

        {/* Word Count Bar */}
        {activeNote && settings.showWordCount && (
          <div
            className="absolute bottom-0 right-0 px-4 py-2 text-[11px] font-mono tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </div>
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

      <UpdateDialog />
    </div>
  );
}
