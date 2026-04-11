import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note, Workspace } from "../lib/storage";
import {
  IconPlus, IconCheck, IconTarget, IconChart,
  IconTrash, IconChevron, IconLightning, IconPen, IconPage, IconSparkle,
} from "./Icons";

// Types
interface Habit {
  id: string;
  name: string;
  createdAt: number;
}

interface HabitCompletion {
  [date: string]: { [habitId: string]: boolean };
}

interface MoodEntry {
  score: number;
  timestamp: number;
}

interface MoodData {
  [date: string]: {
    morning?: MoodEntry;
    midday?: MoodEntry;
    evening?: MoodEntry;
  };
}

// Storage
const HABITS_KEY = "scaled-habits";
const COMPLETIONS_KEY = "scaled-habit-completions";
const MOOD_KEY = "scaled-mood-entries";

function loadHabits(): Habit[] {
  try { return JSON.parse(localStorage.getItem(HABITS_KEY) || "[]"); }
  catch { return []; }
}
function saveHabits(h: Habit[]) { localStorage.setItem(HABITS_KEY, JSON.stringify(h)); }

function loadCompletions(): HabitCompletion {
  try { return JSON.parse(localStorage.getItem(COMPLETIONS_KEY) || "{}"); }
  catch { return {}; }
}
function saveCompletions(c: HabitCompletion) { localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(c)); }

function loadMood(): MoodData {
  try { return JSON.parse(localStorage.getItem(MOOD_KEY) || "{}"); }
  catch { return {}; }
}
function saveMood(m: MoodData) { localStorage.setItem(MOOD_KEY, JSON.stringify(m)); }

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getStreak(habitId: string, completions: HabitCompletion): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 86400000;
  for (let d = 0; d < 365; d++) {
    const dateStr = toDateStr(new Date(today.getTime() - d * dayMs));
    if (completions[dateStr]?.[habitId]) streak++;
    else break;
  }
  return streak;
}

const MOOD_LEVELS = [
  { score: 1, label: "Awful", color: "#ef4444" },
  { score: 2, label: "Bad", color: "#f97316" },
  { score: 3, label: "Okay", color: "#eab308" },
  { score: 4, label: "Good", color: "#22c55e" },
  { score: 5, label: "Great", color: "#10b981" },
];

const MOOD_PERIODS = ["morning", "midday", "evening"] as const;

interface HabitTrackerProps {
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  const editedToday = notes.filter((n) => n.updatedAt >= todayTs).length;

  let streak = 0;
  const dayMs = 86400000;
  for (let d = 0; d < 365; d++) {
    const dayStart = todayTs - d * dayMs;
    const dayEnd = dayStart + dayMs;
    const hasActivity = notes.some((n) => n.updatedAt >= dayStart && n.updatedAt < dayEnd);
    if (hasActivity) streak++;
    else break;
  }

  const focusData = localStorage.getItem("scaled-focus-sessions");
  let focusToday = 0;
  if (focusData) {
    const parsed = JSON.parse(focusData);
    if (parsed.date === new Date().toDateString()) focusToday = parsed.count;
  }

  const heatmap: { date: string; count: number; level: number }[] = [];
  for (let d = 48; d >= 0; d--) {
    const dayStart = todayTs - d * dayMs;
    const dayEnd = dayStart + dayMs;
    const count = notes.filter((n) => n.updatedAt >= dayStart && n.updatedAt < dayEnd).length;
    const date = new Date(dayStart);
    heatmap.push({
      date: date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" }),
      count,
      level: count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4,
    });
  }

  return { totalWords, editedToday, streak, focusToday, totalPages: notes.length, heatmap };
}

const HEATMAP_COLORS = [
  "var(--bg-tertiary)",
  "rgba(16,185,129,0.2)",
  "rgba(16,185,129,0.4)",
  "rgba(16,185,129,0.6)",
  "#10b981",
];

export default function HabitTracker({
  notes,
  workspaces,
  onSelectNote,
  onOpenFocusTimer,
}: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion>({});
  const [mood, setMood] = useState<MoodData>({});
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [newHabitName, setNewHabitName] = useState("");
  const [showAddHabit, setShowAddHabit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHabits(loadHabits());
    setCompletions(loadCompletions());
    setMood(loadMood());
  }, []);

  const isToday = selectedDate === toDateStr(new Date());

  const navigateDate = (delta: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    if (d <= new Date()) setSelectedDate(toDateStr(d));
  };

  const addHabit = () => {
    const name = newHabitName.trim();
    if (!name) return;
    const habit: Habit = { id: crypto.randomUUID(), name, createdAt: Date.now() };
    const updated = [...habits, habit];
    setHabits(updated);
    saveHabits(updated);
    setNewHabitName("");
    setShowAddHabit(false);
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    saveHabits(updated);
  };

  const toggleCompletion = (habitId: string) => {
    const updated = { ...completions };
    if (!updated[selectedDate]) updated[selectedDate] = {};
    updated[selectedDate][habitId] = !updated[selectedDate]?.[habitId];
    setCompletions(updated);
    saveCompletions(updated);
  };

  const setMoodScore = (period: (typeof MOOD_PERIODS)[number], score: number) => {
    const updated = { ...mood };
    if (!updated[selectedDate]) updated[selectedDate] = {};
    updated[selectedDate][period] = { score, timestamp: Date.now() };
    setMood(updated);
    saveMood(updated);
  };

  const completionRate = useMemo(() => {
    if (habits.length === 0) return 0;
    const dc = completions[selectedDate] || {};
    const done = habits.filter((h) => dc[h.id]).length;
    return Math.round((done / habits.length) * 100);
  }, [habits, completions, selectedDate]);

  const last30Days = useMemo(() => {
    const days: { date: string; rate: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const dateStr = toDateStr(new Date(today.getTime() - i * 86400000));
      const dc = completions[dateStr] || {};
      const done = habits.filter((h) => dc[h.id]).length;
      days.push({ date: dateStr, rate: habits.length > 0 ? done / habits.length : 0 });
    }
    return days;
  }, [habits, completions]);

  const moodChart = useMemo(() => {
    const days: { date: string; avg: number | null }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const dateStr = toDateStr(new Date(today.getTime() - i * 86400000));
      const dayMood = mood[dateStr];
      if (dayMood) {
        const scores = (Object.values(dayMood) as MoodEntry[]).map((e) => e.score).filter(Boolean);
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        days.push({ date: dateStr, avg });
      } else {
        days.push({ date: dateStr, avg: null });
      }
    }
    return days;
  }, [mood]);

  const moodPath = useMemo(() => {
    const points = moodChart
      .map((day, i) =>
        day.avg !== null ? { x: (i / 29) * 300, y: 60 - (day.avg / 5) * 60 } : null
      )
      .filter(Boolean) as { x: number; y: number }[];
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  }, [moodChart]);

  const habitHeatmap = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cells: { date: string; rate: number; level: number }[] = [];
    for (let d = 48; d >= 0; d--) {
      const dateStr = toDateStr(new Date(today.getTime() - d * 86400000));
      const dc = completions[dateStr] || {};
      const done = habits.filter((h) => dc[h.id]).length;
      const rate = habits.length > 0 ? done / habits.length : 0;
      cells.push({
        date: formatDisplayDate(dateStr),
        rate,
        level: rate === 0 ? 0 : rate <= 0.25 ? 1 : rate <= 0.5 ? 2 : rate <= 0.75 ? 3 : 4,
      });
    }
    return cells;
  }, [habits, completions]);

  const stats = useMemo(() => getWritingStats(notes), [notes]);

  const recentNotes = useMemo(() => {
    return [...notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
  }, [notes]);

  const ringR = 34;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div className="h-full overflow-y-auto">
      {/* macOS drag region */}
      <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

      <div className="max-w-[680px] mx-auto px-8 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
          >
            <IconSparkle size={20} />
          </span>
          <div>
            <h1 className="font-serif italic text-2xl font-light" style={{ color: "var(--text-primary)" }}>
              Dashboard
            </h1>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Habits, mood, and writing at a glance
            </p>
          </div>
        </div>

        {/* Writing Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Words", value: stats.totalWords.toLocaleString(), icon: <IconPen size={13} /> },
            { label: "Pages", value: stats.totalPages.toString(), icon: <IconPage size={13} /> },
            { label: "Streak", value: `${stats.streak}d`, icon: <IconLightning size={13} /> },
            { label: "Focus", value: stats.focusToday.toString(), icon: <IconTarget size={13} />, clickable: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-3 rounded-xl ${stat.clickable ? "cursor-default" : ""}`}
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
              }}
              onClick={stat.clickable ? onOpenFocusTimer : undefined}
            >
              <div className="flex items-center gap-1.5 mb-1.5" style={{ color: "var(--text-muted)" }}>
                {stat.icon}
                <span className="text-[9px] uppercase tracking-[0.1em]">{stat.label}</span>
              </div>
              <p className="text-[20px] font-light tabular-nums" style={{ color: "var(--text-primary)" }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Writing Heatmap */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <IconChart size={12} />
            <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
              Writing Activity — Last 7 Weeks
            </span>
          </div>
          <div className="flex gap-[3px] flex-wrap">
            {stats.heatmap.map((day, i) => (
              <div
                key={i}
                className="w-[13px] h-[13px] rounded-[3px]"
                style={{ backgroundColor: HEATMAP_COLORS[day.level] }}
                title={`${day.date}: ${day.count} pages edited`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2 justify-end">
            <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Less</span>
            {HEATMAP_COLORS.map((c, i) => (
              <div key={i} className="w-[9px] h-[9px] rounded-[2px]" style={{ backgroundColor: c }} />
            ))}
            <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>More</span>
          </div>
        </div>

        {/* Habit Tracking Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconTarget size={14} />
            <span className="text-[10px] uppercase tracking-[0.12em] font-medium" style={{ color: "var(--text-muted)" }}>
              Daily Habits
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateDate(-1)}
              className="cursor-default p-0.5 rounded transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <IconChevron size={13} className="rotate-180" />
            </button>
            <button
              onClick={() => setSelectedDate(toDateStr(new Date()))}
              className="text-[12px] font-light px-2 py-0.5 rounded-md cursor-default"
              style={{
                color: isToday ? "#10b981" : "var(--text-primary)",
                backgroundColor: isToday ? "rgba(16,185,129,0.1)" : "transparent",
              }}
            >
              {isToday ? "Today" : formatDisplayDate(selectedDate)}
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="cursor-default p-0.5 rounded transition-colors"
              style={{ color: isToday ? "var(--bg-tertiary)" : "var(--text-muted)" }}
              disabled={isToday}
            >
              <IconChevron size={13} />
            </button>
          </div>
        </div>

        {/* Completion Ring + Habits */}
        <div className="flex gap-4 mb-6">
          {/* Ring */}
          {habits.length > 0 && (
            <div className="flex-shrink-0 flex items-start pt-2">
              <div className="relative w-[72px] h-[72px]">
                <svg width="72" height="72" className="transform -rotate-90">
                  <circle cx="36" cy="36" r={ringR} stroke="var(--bg-tertiary)" strokeWidth="3.5" fill="none" />
                  <motion.circle
                    cx="36" cy="36" r={ringR}
                    stroke="#10b981" strokeWidth="3.5" fill="none" strokeLinecap="round"
                    strokeDasharray={ringC}
                    animate={{ strokeDashoffset: ringC * (1 - completionRate / 100) }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[16px] font-light tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {completionRate}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Habits List */}
          <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
            <AnimatePresence>
              {habits.map((habit, i) => {
                const completed = completions[selectedDate]?.[habit.id] || false;
                const streak = getStreak(habit.id, completions);
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-3 py-2.5 group"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderBottom: i < habits.length - 1 ? "1px solid var(--border-color)" : "none",
                    }}
                  >
                    <button
                      onClick={() => toggleCompletion(habit.id)}
                      className="w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0 transition-all cursor-default"
                      style={{
                        border: completed ? "none" : "1.5px solid var(--border-color)",
                        backgroundColor: completed ? "#10b981" : "transparent",
                      }}
                    >
                      {completed && <IconCheck size={11} strokeWidth={2.5} className="text-black" />}
                    </button>
                    <span
                      className="flex-1 text-[12px] font-light transition-all"
                      style={{
                        color: completed ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: completed ? "line-through" : "none",
                      }}
                    >
                      {habit.name}
                    </span>
                    {streak > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] tabular-nums" style={{ color: "#10b981" }}>
                        <IconLightning size={10} />{streak}d
                      </span>
                    )}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-default"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <IconTrash size={11} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {showAddHabit ? (
              <div className="flex items-center gap-3 px-3 py-2.5" style={{ backgroundColor: "var(--bg-secondary)" }}>
                <div className="w-[18px] h-[18px] rounded-md flex-shrink-0" style={{ border: "1.5px solid var(--border-color)" }} />
                <input
                  ref={inputRef}
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addHabit();
                    if (e.key === "Escape") { setShowAddHabit(false); setNewHabitName(""); }
                  }}
                  onBlur={() => { if (!newHabitName.trim()) setShowAddHabit(false); }}
                  autoFocus
                  placeholder="New habit..."
                  className="flex-1 bg-transparent outline-none text-[12px] font-light"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            ) : (
              <button
                onClick={() => { setShowAddHabit(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 cursor-default transition-colors"
                style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}
              >
                <IconPlus size={13} />
                <span className="text-[12px] font-light">Add habit</span>
              </button>
            )}
          </div>
        </div>

        {/* Mood Section */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.12em] font-medium mb-2" style={{ color: "var(--text-muted)" }}>
            Mood Check-in
          </p>
          <div className="grid grid-cols-3 gap-2">
            {MOOD_PERIODS.map((period) => {
              const entry = mood[selectedDate]?.[period];
              return (
                <div
                  key={period}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
                >
                  <p className="text-[9px] uppercase tracking-[0.08em] mb-2 text-center capitalize" style={{ color: "var(--text-muted)" }}>
                    {period}
                  </p>
                  <div className="flex justify-center gap-1">
                    {MOOD_LEVELS.map((level) => (
                      <button
                        key={level.score}
                        onClick={() => setMoodScore(period, level.score)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] cursor-default transition-all"
                        style={{
                          backgroundColor: entry?.score === level.score ? level.color : "var(--bg-tertiary)",
                          color: entry?.score === level.score ? "#000" : "var(--text-muted)",
                          transform: entry?.score === level.score ? "scale(1.15)" : "scale(1)",
                          boxShadow: entry?.score === level.score ? `0 0 8px ${level.color}40` : "none",
                        }}
                        title={level.label}
                      >
                        {level.score}
                      </button>
                    ))}
                  </div>
                  {entry && (
                    <p className="text-[9px] text-center mt-1" style={{ color: MOOD_LEVELS[entry.score - 1].color }}>
                      {MOOD_LEVELS[entry.score - 1].label}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit Consistency Heatmap */}
        {habits.length > 0 && (
          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <IconTarget size={12} />
              <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                Habit Consistency — Last 7 Weeks
              </span>
            </div>
            <div className="flex gap-[3px] flex-wrap">
              {habitHeatmap.map((day, i) => (
                <div
                  key={i}
                  className="w-[13px] h-[13px] rounded-[3px]"
                  style={{ backgroundColor: HEATMAP_COLORS[day.level] }}
                  title={`${day.date}: ${Math.round(day.rate * 100)}%`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 justify-end">
              <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Less</span>
              {HEATMAP_COLORS.map((c, i) => (
                <div key={i} className="w-[9px] h-[9px] rounded-[2px]" style={{ backgroundColor: c }} />
              ))}
              <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>More</span>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* 30-Day Completion */}
          {habits.length > 0 && (
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <IconChart size={12} />
                <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                  Completion — 30d
                </span>
              </div>
              <div className="flex items-end gap-[2px] h-[50px]">
                {last30Days.map((day, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${Math.max(day.rate * 100, 2)}%`,
                      backgroundColor: day.rate > 0 ? `rgba(16,185,129,${0.3 + day.rate * 0.7})` : "var(--bg-tertiary)",
                    }}
                    title={`${formatDisplayDate(day.date)}: ${Math.round(day.rate * 100)}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>30d ago</span>
                <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Today</span>
              </div>
            </div>
          )}

          {/* Mood Chart */}
          {moodChart.some((d) => d.avg !== null) && (
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <IconChart size={12} />
                <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                  Mood — 30d
                </span>
              </div>
              <svg width="100%" height="50" viewBox="0 0 300 60" preserveAspectRatio="none">
                {[1, 2, 3, 4, 5].map((v) => (
                  <line key={v} x1="0" y1={60 - (v / 5) * 60} x2="300" y2={60 - (v / 5) * 60} stroke="var(--bg-tertiary)" strokeWidth="1" />
                ))}
                <path d={moodPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {moodChart.map((day, i) => {
                  if (day.avg === null) return null;
                  const x = (i / 29) * 300;
                  const y = 60 - (day.avg / 5) * 60;
                  const color = MOOD_LEVELS[Math.round(day.avg) - 1]?.color || "#10b981";
                  return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
                })}
              </svg>
              <div className="flex justify-between mt-1">
                <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>30d ago</span>
                <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Today</span>
              </div>
            </div>
          )}
        </div>

        {/* Recently Edited */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.12em] font-medium mb-2" style={{ color: "var(--text-muted)" }}>
            Recently Edited
          </p>
          <div className="space-y-1">
            {recentNotes.map((note, i) => {
              const ws = workspaces.find((w) => w.id === note.workspace);
              return (
                <motion.button
                  key={note.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.02 }}
                  onClick={() => onSelectNote(note.id)}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-default transition-colors"
                  style={{ border: "1px solid var(--border-color)" }}
                >
                  {note.icon ? (
                    <span className="text-[13px]">{note.icon}</span>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}><IconPage size={13} /></span>
                  )}
                  <span className="flex-1 text-[12px] font-light truncate" style={{ color: "var(--text-primary)" }}>
                    {note.title || "Untitled"}
                  </span>
                  {ws && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ws.color }} />
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{ws.name}</span>
                    </span>
                  )}
                  <span className="text-[9px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {new Date(note.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
