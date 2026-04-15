import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { BoardCard, BoardColumn } from "../lib/storage";
import { updateCard, deleteCard, moveCard, getTags, createTag } from "../lib/storage";
import { IconX, IconTrash, IconPlus } from "./Icons";

const CARD_COLORS = ["", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

interface CardModalProps {
  card: BoardCard;
  columns: BoardColumn[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function CardModal({ card, columns, onClose, onRefresh }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [color, setColor] = useState(card.color);
  const [scheduledAt, setScheduledAt] = useState(card.scheduledAt);
  const [cardTags, setCardTags] = useState<string[]>(card.tags);
  const [columnId, setColumnId] = useState(card.columnId);
  const [addingTag, setAddingTag] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const tags = getTags();

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCard(card.id, { title, description, color, scheduledAt, tags: cardTags });
      if (columnId !== card.columnId) {
        const col = columns.find((c) => c.id === columnId);
        if (col) {
          moveCard(card.id, columnId, 999); // append to end
        }
      }
      onRefresh();
    }, 300);
    return () => clearTimeout(timer);
  }, [title, description, color, scheduledAt, cardTags, columnId]);

  // Auto-grow textarea
  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [description]);

  const handleDelete = () => {
    deleteCard(card.id);
    onRefresh();
    onClose();
  };

  const handleCreateTag = () => {
    const name = tagInputRef.current?.value.trim();
    if (name) {
      const tag = createTag(name);
      setCardTags([...cardTags, tag.id]);
      setAddingTag(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (cardTags.includes(tagId)) {
      setCardTags(cardTags.filter((t) => t !== tagId));
    } else {
      setCardTags([...cardTags, tagId]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="w-[520px] max-h-[80vh] rounded-2xl overflow-y-auto"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 24px 64px -16px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <span className="text-[10px] uppercase tracking-[0.12em] font-medium" style={{ color: "var(--text-muted)" }}>
            Edit Card
          </span>
          <button onClick={onClose} className="cursor-default" style={{ color: "var(--text-muted)" }}>
            <IconX size={14} />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title..."
            className="w-full bg-transparent outline-none font-serif italic text-[1.4rem] font-light"
            style={{ color: "var(--text-primary)" }}
          />

          {/* Description */}
          <textarea
            ref={descRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={2}
            className="w-full bg-transparent outline-none resize-none text-[13px] font-light leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />

          {/* Column */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.12em] font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>
              Column
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {columns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setColumnId(col.id)}
                  className="px-3 py-1 rounded-lg text-[11px] font-light cursor-default transition-colors"
                  style={{
                    backgroundColor: columnId === col.id ? col.color + "20" : "var(--bg-tertiary)",
                    color: columnId === col.id ? col.color : "var(--text-muted)",
                    border: `1px solid ${columnId === col.id ? col.color + "40" : "var(--border-color)"}`,
                  }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: col.color }} />
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.12em] font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>
              Tags
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium cursor-default transition-colors"
                  style={{
                    backgroundColor: cardTags.includes(tag.id) ? tag.color + "20" : "var(--bg-tertiary)",
                    color: cardTags.includes(tag.id) ? tag.color : "var(--text-muted)",
                    border: `1px solid ${cardTags.includes(tag.id) ? tag.color + "40" : "var(--border-color)"}`,
                  }}
                >
                  {tag.name}
                </button>
              ))}
              {addingTag ? (
                <input
                  ref={tagInputRef}
                  autoFocus
                  placeholder="Tag name..."
                  className="px-2.5 py-1 rounded-full text-[10px] bg-transparent outline-none w-[100px]"
                  style={{ color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateTag();
                    if (e.key === "Escape") setAddingTag(false);
                  }}
                  onBlur={() => { handleCreateTag(); setAddingTag(false); }}
                />
              ) : (
                <button
                  onClick={() => setAddingTag(true)}
                  className="px-2.5 py-1 rounded-full text-[10px] cursor-default flex items-center gap-1"
                  style={{ color: "var(--text-muted)", border: "1px dashed var(--border-color)" }}
                >
                  <IconPlus size={8} />
                  New Tag
                </button>
              )}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.12em] font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>
              Color
            </label>
            <div className="flex gap-2">
              {CARD_COLORS.map((c) => (
                <button
                  key={c || "none"}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full cursor-default transition-transform"
                  style={{
                    backgroundColor: c || "var(--bg-tertiary)",
                    border: color === c ? "2px solid var(--text-primary)" : "1px solid var(--border-color)",
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.12em] font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>
              Schedule
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="bg-transparent outline-none text-[12px] rounded-lg px-3 py-1.5 cursor-default"
              style={{
                color: scheduledAt ? "var(--text-primary)" : "var(--text-muted)",
                border: "1px solid var(--border-color)",
              }}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-[11px] cursor-default transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <IconTrash size={11} />
              Delete card
            </button>
            <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
              Created {new Date(card.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
