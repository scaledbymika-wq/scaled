import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconPlus, IconPage } from "./Icons";

const STORAGE_KEY = "scaled-quicknote";

interface QuickNoteProps {
  open: boolean;
  onClose: () => void;
  /** Called with the scratchpad text when the user clicks "Create Page". */
  onCreatePage?: (content: string) => void;
}

export default function QuickNote({ open, onClose, onCreatePage }: QuickNoteProps) {
  const [text, setText] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, text);
  }, [text]);

  // Focus the textarea when the panel opens
  useEffect(() => {
    if (open) {
      // Small delay so the animation starts before focus
      const t = setTimeout(() => textareaRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Auto-resize the textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [text, open, autoResize]);

  const handleClear = () => {
    setText("");
    textareaRef.current?.focus();
  };

  const handleCreatePage = () => {
    if (!text.trim()) return;
    onCreatePage?.(text);
    setText("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 w-[340px] rounded-2xl overflow-hidden z-[9999]"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="flex items-center gap-2">
              <IconPage size={15} className="opacity-50" />
              <span
                className="text-[13px] font-light tracking-wide"
                style={{ color: "var(--text-primary)" }}
              >
                Quick Note
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors duration-100 cursor-default"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <IconX size={14} />
            </button>
          </div>

          {/* Textarea */}
          <div className="px-4 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Jot something down..."
              rows={3}
              className="w-full resize-none text-[13px] font-light leading-relaxed outline-none"
              style={{
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                minHeight: "72px",
                maxHeight: "280px",
              }}
            />
          </div>

          {/* Footer actions */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "1px solid var(--border-color)" }}
          >
            <button
              onClick={handleClear}
              disabled={!text.trim()}
              className="text-[12px] font-light px-3 py-1.5 rounded-lg transition-colors duration-100 cursor-default"
              style={{
                color: text.trim() ? "var(--text-secondary)" : "var(--text-muted)",
                border: "1px solid var(--border-color)",
                opacity: text.trim() ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (text.trim())
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Clear
            </button>

            <button
              onClick={handleCreatePage}
              disabled={!text.trim()}
              className="flex items-center gap-1.5 text-[12px] font-light px-3 py-1.5 rounded-lg transition-all duration-100 cursor-default"
              style={{
                backgroundColor: text.trim() ? "#10b981" : "var(--bg-tertiary)",
                color: text.trim() ? "#000" : "var(--text-muted)",
              }}
            >
              <IconPlus size={12} />
              Create Page
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
