import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Note, Workspace } from "../lib/storage";
import { IconX, IconPage, IconPen, IconTarget, IconChart, IconLightning, IconSparkle } from "./Icons";

interface DashboardProps {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  workspaces: Workspace[];
  onSelectNote: (id: string) => void;
  onOpenFocusTimer: () => void;
}

function getWritingStats(notes: Note[]) {
  const totalWords = notes.reduce((sum, n) => {
    const text = n.content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
    return sum + text.split(/\s+/).filter(Boolean).length;
  }, 0);

  const totalChars = notes.reduce((sum, n) => {
    return sum + n.content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").length;
  }, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  const editedToday = notes.filter((n) => n.updatedAt >= todayTs).length;

  // Writing streak
  let streak = 0;
  const dayMs = 24 * 60 * 60 * 1000;
  for (let d = 0; d < 365; d++) {
    const dayStart = todayTs - d * dayMs;
    const dayEnd = dayStart + dayMs;
    const hasActivity = notes.some((n) => n.updatedAt >= dayStart && n.updatedAt < dayEnd);
    if (hasActivity) streak++;
    else break;
  }

  // Activity heatmap (last 7 weeks)
  const heatmap: { date: string; count: number; level: number }[] = [];
  for (let d = 48; d >= 0; d--) {
    const dayStart = todayTs - d * dayMs;
    const dayEnd = dayStart + dayMs;
    const count = notes.filter((n) => n.updatedAt >= dayStart && n.updatedAt < dayEnd).length;
    const date = new Date(dayStart);
    heatmap.push({
      date: date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      count,
      level: count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4,
    });
  }

  // Focus sessions today
  const focusData = localStorage.getItem("scaled-focus-sessions");
  let focusToday = 0;
  if (focusData) {
    const parsed = JSON.parse(focusData);
    if (parsed.date === new Date().toDateString()) focusToday = parsed.count;
  }

  return { totalWords, totalChars, editedToday, streak, heatmap, focusToday, totalPages: notes.length };
}

const HEATMAP_COLORS = [
  "var(--bg-tertiary)",
  "rgba(16,185,129,0.2)",
  "rgba(16,185,129,0.4)",
  "rgba(16,185,129,0.6)",
  "#10b981",
];

export default function Dashboard({
  open,
  onClose,
  notes,
  workspaces,
  onSelectNote,
  onOpenFocusTimer,
}: DashboardProps) {
  const stats = useMemo(() => getWritingStats(notes), [notes]);

  const recentNotes = useMemo(() => {
    return [...notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
  }, [notes]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-[640px] max-h-[85vh] overflow-y-auto rounded-2xl"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 32px 64px -16px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
            >
              <IconSparkle size={18} />
            </span>
            <div>
              <h2 className="font-serif italic text-xl font-light" style={{ color: "var(--text-primary)" }}>
                Dashboard
              </h2>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Your writing at a glance</p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-default" style={{ color: "var(--text-muted)" }}>
            <IconX size={16} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="px-6 pb-4 grid grid-cols-4 gap-3">
          {[
            { label: "Total Words", value: stats.totalWords.toLocaleString(), icon: <IconPen size={14} /> },
            { label: "Pages", value: stats.totalPages.toString(), icon: <IconPage size={14} /> },
            { label: "Streak", value: `${stats.streak}d`, icon: <IconLightning size={14} /> },
            { label: "Focus Today", value: stats.focusToday.toString(), icon: <IconTarget size={14} />, clickable: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl ${stat.clickable ? "cursor-default" : ""}`}
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
              }}
              onClick={stat.clickable ? () => { onClose(); onOpenFocusTimer(); } : undefined}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: "var(--text-muted)" }}>
                {stat.icon}
                <span className="text-[10px] uppercase tracking-[0.1em]">{stat.label}</span>
              </div>
              <p className="text-[22px] font-light tabular-nums" style={{ color: "var(--text-primary)" }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Activity Heatmap */}
        <div className="px-6 pb-4">
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <IconChart size={13} />
              <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                Activity — Last 7 weeks
              </span>
            </div>
            <div className="flex gap-[3px] flex-wrap">
              {stats.heatmap.map((day, i) => (
                <div
                  key={i}
                  className="w-[14px] h-[14px] rounded-[3px] transition-all"
                  style={{ backgroundColor: HEATMAP_COLORS[day.level] }}
                  title={`${day.date}: ${day.count} pages edited`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 justify-end">
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>Less</span>
              {HEATMAP_COLORS.map((c, i) => (
                <div
                  key={i}
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ backgroundColor: c }}
                />
              ))}
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>More</span>
            </div>
          </div>
        </div>

        {/* Recent Pages */}
        <div className="px-6 pb-6">
          <p className="text-[10px] uppercase tracking-[0.12em] font-medium mb-2" style={{ color: "var(--text-muted)" }}>
            Recently Edited
          </p>
          <div className="space-y-1">
            {recentNotes.map((note, i) => {
              const ws = workspaces.find((w) => w.id === note.workspace);
              return (
                <motion.button
                  key={note.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
                  onClick={() => { onSelectNote(note.id); onClose(); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 cursor-default transition-colors"
                  style={{ border: "1px solid var(--border-color)" }}
                >
                  {note.icon ? (
                    <span className="text-sm">{note.icon}</span>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}><IconPage size={14} /></span>
                  )}
                  <span className="flex-1 text-[13px] font-light truncate" style={{ color: "var(--text-primary)" }}>
                    {note.title || "Untitled"}
                  </span>
                  {ws && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ws.color }} />
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{ws.name}</span>
                    </span>
                  )}
                  <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {new Date(note.updatedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
