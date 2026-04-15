import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note, Workspace } from "../lib/storage";
import {
  IconSearch, IconPage, IconPlus, IconSettings, IconSun, IconMoon,
  IconFolder, IconTarget, IconExpand, IconHabit, IconSidebar, IconBoard, IconTable,
} from "./Icons";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  workspaces: Workspace[];
  onSelectNote: (id: string) => void;
  onCreatePage: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleFocusTimer: () => void;
  onOpenHabitTracker: () => void;
  onOpenBoard: () => void;
  onOpenPlanner: () => void;
  onToggleZenMode: () => void;
  onToggleSidebar: () => void;
  theme: string;
}

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export default function CommandPalette({
  open,
  onClose,
  notes,
  workspaces,
  onSelectNote,
  onCreatePage,
  onOpenSettings,
  onToggleTheme,
  onToggleFocusTimer,
  onOpenHabitTracker,
  onOpenBoard,
  onOpenPlanner,
  onToggleZenMode,
  onToggleSidebar,
  theme,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [];

    // Actions
    items.push(
      { id: "new-page", label: "New Page", sublabel: "Cmd+N", icon: <IconPlus size={16} />, action: () => { onCreatePage(); onClose(); }, category: "Actions" },
      { id: "settings", label: "Settings", sublabel: "Cmd+,", icon: <IconSettings size={16} />, action: () => { onOpenSettings(); onClose(); }, category: "Actions" },
      { id: "theme", label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode", icon: theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />, action: () => { onToggleTheme(); onClose(); }, category: "Actions" },
      { id: "focus", label: "Focus Timer", sublabel: "Pomodoro", icon: <IconTarget size={16} />, action: () => { onToggleFocusTimer(); onClose(); }, category: "Actions" },
      { id: "habits", label: "Habit Tracker", sublabel: "Habits, Mood & Stats", icon: <IconHabit size={16} />, action: () => { onOpenHabitTracker(); onClose(); }, category: "Views" },
      { id: "board", label: "Board", sublabel: "Kanban Board", icon: <IconBoard size={16} />, action: () => { onOpenBoard(); onClose(); }, category: "Views" },
      { id: "planner", label: "Planner", sublabel: "Table with Tags & Schedule", icon: <IconTable size={16} />, action: () => { onOpenPlanner(); onClose(); }, category: "Views" },
      { id: "zen", label: "Zen Mode", sublabel: "Distraction-free", icon: <IconExpand size={16} />, action: () => { onToggleZenMode(); onClose(); }, category: "Actions" },
      { id: "sidebar", label: "Toggle Sidebar", sublabel: "Cmd+\\", icon: <IconSidebar size={16} />, action: () => { onToggleSidebar(); onClose(); }, category: "Actions" },
    );

    // Pages
    notes.forEach((note) => {
      const ws = workspaces.find((w) => w.id === note.workspace);
      items.push({
        id: `note-${note.id}`,
        label: note.title || "Untitled",
        sublabel: ws?.name,
        icon: note.icon ? <span className="text-sm">{note.icon}</span> : <IconPage size={16} />,
        action: () => { onSelectNote(note.id); onClose(); },
        category: "Pages",
      });
    });

    // Workspaces
    workspaces.forEach((ws) => {
      items.push({
        id: `ws-${ws.id}`,
        label: ws.name,
        icon: <IconFolder size={16} />,
        action: () => onClose(),
        category: "Workspaces",
      });
    });

    return items;
  }, [notes, workspaces, theme, onCreatePage, onOpenSettings, onToggleTheme, onToggleFocusTimer, onOpenHabitTracker, onOpenBoard, onOpenPlanner, onToggleZenMode, onToggleSidebar, onSelectNote, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.sublabel?.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i + filtered.length - 1) % filtered.length);
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((item) => {
      const existing = map.get(item.category) || [];
      existing.push(item);
      map.set(item.category, existing);
    });
    return map;
  }, [filtered]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-[520px] max-h-[400px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 24px 64px -16px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)" }}><IconSearch size={16} /></span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, commands..."
                className="flex-1 bg-transparent outline-none text-[14px] font-light"
                style={{ color: "var(--text-primary)" }}
              />
              <kbd
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto py-1" ref={listRef}>
              {filtered.length === 0 && (
                <p className="text-center text-[13px] py-8 italic" style={{ color: "var(--text-muted)" }}>
                  No results for "{query}"
                </p>
              )}
              {Array.from(grouped.entries()).map(([category, items]) => (
                <div key={category}>
                  <p className="px-4 pt-2 pb-1 text-[10px] tracking-[0.12em] uppercase font-medium" style={{ color: "var(--text-muted)" }}>
                    {category}
                  </p>
                  {items.map((item) => {
                    flatIndex++;
                    const idx = flatIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className="w-full text-left px-4 py-2 flex items-center gap-3 cursor-default transition-colors"
                        style={{
                          backgroundColor: idx === selectedIndex ? "var(--bg-hover)" : "transparent",
                        }}
                      >
                        <span style={{ color: idx === selectedIndex ? "var(--text-primary)" : "var(--text-muted)" }}>
                          {item.icon}
                        </span>
                        <span className="flex-1 text-[13px] font-light truncate" style={{ color: "var(--text-primary)" }}>
                          {item.label}
                        </span>
                        {item.sublabel && (
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                            {item.sublabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
