import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "./Icons";

interface FocusTimerProps {
  open: boolean;
  onClose: () => void;
}

type TimerMode = "focus" | "break";

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function FocusTimer({ open, onClose }: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const totalTime = mode === "focus" ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60;
  const progress = 1 - timeLeft / totalTime;
  const circumference = 2 * Math.PI * 88;

  useEffect(() => {
    // Load sessions from localStorage
    const saved = localStorage.getItem("scaled-focus-sessions");
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date === today) {
        setSessions(data.count);
      }
    }
  }, []);

  const saveSession = useCallback(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("scaled-focus-sessions");
    let count = 1;
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) count = data.count + 1;
    }
    localStorage.setItem("scaled-focus-sessions", JSON.stringify({ date: today, count }));
    setSessions(count);

    // Also save to history for dashboard
    const historyKey = "scaled-focus-history";
    const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
    history.push({ date: today, timestamp: Date.now() });
    // Keep last 90 days
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    localStorage.setItem(historyKey, JSON.stringify(history.filter((h: any) => h.timestamp > cutoff)));
  }, []);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && running) {
      setRunning(false);
      if (mode === "focus") {
        saveSession();
        setMode("break");
        setTimeLeft(BREAK_MINUTES * 60);
      } else {
        setMode("focus");
        setTimeLeft(FOCUS_MINUTES * 60);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [running, timeLeft, mode, saveSession]);

  const toggleTimer = () => setRunning(!running);

  const resetTimer = () => {
    setRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60);
  };

  const switchMode = (m: TimerMode) => {
    setRunning(false);
    setMode(m);
    setTimeLeft(m === "focus" ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[380px] rounded-3xl overflow-hidden"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 32px 64px -16px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-2">
              <h2 className="font-serif italic text-lg font-light" style={{ color: "var(--text-primary)" }}>
                {mode === "focus" ? "Focus" : "Break"}
              </h2>
              <button onClick={onClose} className="cursor-default" style={{ color: "var(--text-muted)" }}>
                <IconX size={16} />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-1 px-5 pb-4">
              {(["focus", "break"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="px-3 py-1 text-[12px] rounded-lg transition-all cursor-default capitalize"
                  style={{
                    backgroundColor: mode === m ? "rgba(16,185,129,0.1)" : "transparent",
                    color: mode === m ? "#10b981" : "var(--text-muted)",
                    border: `1px solid ${mode === m ? "rgba(16,185,129,0.3)" : "transparent"}`,
                  }}
                >
                  {m === "focus" ? "25 min" : "5 min"}
                </button>
              ))}
            </div>

            {/* Timer Circle */}
            <div className="flex flex-col items-center py-6">
              <div className="relative w-[200px] h-[200px]">
                <svg width="200" height="200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100" cy="100" r="88"
                    stroke="var(--bg-tertiary)"
                    strokeWidth="4"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="100" cy="100" r="88"
                    stroke={mode === "focus" ? "#10b981" : "#3b82f6"}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: circumference * (1 - progress) }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-[42px] font-light tabular-nums tracking-tight"
                    style={{ color: "var(--text-primary)", fontFamily: "Inter, system-ui" }}
                  >
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.15em] mt-1" style={{ color: "var(--text-muted)" }}>
                    {mode === "focus" ? "Focus Time" : "Break Time"}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pb-6">
              <button
                onClick={resetTimer}
                className="px-4 py-2 text-[12px] rounded-xl cursor-default transition-all"
                style={{
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                Reset
              </button>
              <button
                onClick={toggleTimer}
                className="px-8 py-2.5 text-[13px] font-medium rounded-xl cursor-default transition-all"
                style={{
                  backgroundColor: running ? "var(--bg-tertiary)" : "#10b981",
                  color: running ? "var(--text-primary)" : "#000",
                  border: running ? "1px solid var(--border-color)" : "none",
                }}
              >
                {running ? "Pause" : "Start"}
              </button>
            </div>

            {/* Sessions */}
            <div
              className="px-5 py-3 border-t flex items-center justify-between"
              style={{ borderColor: "var(--border-color)" }}
            >
              <span className="text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                Sessions today
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.max(sessions, 4) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full transition-all"
                    style={{
                      backgroundColor: i < sessions ? "#10b981" : "var(--bg-tertiary)",
                      boxShadow: i < sessions ? "0 0 6px rgba(16,185,129,0.4)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
