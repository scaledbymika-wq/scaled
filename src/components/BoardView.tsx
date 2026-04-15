import { useState, useRef, useMemo } from "react";
import type { Note, NoteStatus, Tag, Workspace } from "../lib/storage";
import { updateNote, getTags, createTag, addTagToNote, removeTagFromNote } from "../lib/storage";
import { IconPlus, IconX, IconPage, IconChevron } from "./Icons";

interface BoardViewProps {
  notes: Note[];
  workspaces: Workspace[];
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onRefresh: () => void;
}

const COLUMNS: { key: NoteStatus; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "#ef4444" },
  { key: "doing", label: "Doing", color: "#f59e0b" },
  { key: "done", label: "Done", color: "#10b981" },
];

function TagPill({ tag, onRemove }: { tag: Tag; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ backgroundColor: tag.color + "20", color: tag.color }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="cursor-default hover:opacity-70"
        >
          <IconX size={8} />
        </button>
      )}
    </span>
  );
}

function TagSelector({ noteId, noteTags, onRefresh }: { noteId: string; noteTags: string[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const tags = getTags();

  const toggle = (tagId: string) => {
    if (noteTags.includes(tagId)) {
      removeTagFromNote(noteId, tagId);
    } else {
      addTagToNote(noteId, tagId);
    }
    onRefresh();
  };

  const handleCreateTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    const tag = createTag(name);
    addTagToNote(noteId, tag.id);
    setNewTagName("");
    onRefresh();
  };

  if (!open) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="text-[10px] px-1.5 py-0.5 rounded-lg cursor-default transition-colors"
        style={{ color: "var(--text-muted)", border: "1px dashed var(--border-color)" }}
      >
        + Tag
      </button>
    );
  }

  return (
    <div
      className="absolute top-full left-0 mt-1 w-[200px] rounded-2xl overflow-hidden z-50"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2">
        <input
          ref={inputRef}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateTag();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="New tag or select..."
          className="w-full bg-transparent outline-none text-[11px] font-light px-2 py-1 rounded-lg"
          style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-tertiary)" }}
        />
      </div>
      <div className="max-h-[160px] overflow-y-auto px-1 pb-1">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggle(tag.id)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-left cursor-default transition-colors"
            style={{ backgroundColor: noteTags.includes(tag.id) ? "var(--bg-hover)" : "transparent" }}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
            <span className="text-[11px] flex-1" style={{ color: "var(--text-primary)" }}>{tag.name}</span>
            {noteTags.includes(tag.id) && <span className="text-[10px]" style={{ color: "#10b981" }}>✓</span>}
          </button>
        ))}
        {newTagName.trim() && !tags.some((t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()) && (
          <button
            onClick={handleCreateTag}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-left cursor-default"
            style={{ color: "var(--text-muted)" }}
          >
            <IconPlus size={10} />
            <span className="text-[11px]">Create "{newTagName.trim()}"</span>
          </button>
        )}
      </div>
      <div className="px-2 pb-2">
        <button
          onClick={() => setOpen(false)}
          className="w-full text-center text-[10px] py-1 rounded-lg cursor-default"
          style={{ color: "var(--text-muted)" }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function BoardCard({
  note,
  onSelect,
  onRefresh,
}: {
  note: Note;
  onSelect: () => void;
  onRefresh: () => void;
}) {
  const tags = getTags();
  const noteTags = tags.filter((t) => note.tags.includes(t.id));

  return (
    <div
      onClick={onSelect}
      className="p-3 rounded-2xl cursor-default transition-all group"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div className="flex items-start gap-2 mb-1.5">
        {note.icon ? (
          <span className="text-[14px]">{note.icon}</span>
        ) : (
          <span style={{ color: "var(--text-muted)" }} className="mt-0.5"><IconPage size={13} /></span>
        )}
        <span className="flex-1 text-[12px] font-light leading-snug" style={{ color: "var(--text-primary)" }}>
          {note.title || "Untitled"}
        </span>
      </div>
      {noteTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {noteTags.map((tag) => (
            <TagPill key={tag.id} tag={tag} />
          ))}
        </div>
      )}
      {note.scheduledAt && (
        <p className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
          {new Date(note.scheduledAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
      <div className="relative mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <TagSelector noteId={note.id} noteTags={note.tags} onRefresh={onRefresh} />
      </div>
    </div>
  );
}

export default function BoardView({ notes, onSelectNote, onCreateNote: _onCreateNote, onRefresh }: BoardViewProps) {
  const [dragOverCol, setDragOverCol] = useState<NoteStatus | null>(null);

  // Only show notes that have a status set
  const boardNotes = useMemo(() => notes.filter((n) => n.status), [notes]);
  const unassigned = useMemo(() => notes.filter((n) => !n.status && !n.trashed), [notes]);

  const moveToColumn = (noteId: string, status: NoteStatus) => {
    updateNote(noteId, { status });
    onRefresh();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

      <div className="px-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif italic text-2xl font-light" style={{ color: "var(--text-primary)" }}>
              Board
            </h1>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Organize pages by status
            </p>
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colNotes = boardNotes.filter((n) => n.status === col.key);
            return (
              <div
                key={col.key}
                className="rounded-2xl p-3 min-h-[300px] transition-colors"
                style={{
                  backgroundColor: dragOverCol === col.key ? "var(--bg-hover)" : "var(--bg-secondary)",
                  border: `1px solid ${dragOverCol === col.key ? col.color + "40" : "var(--border-color)"}`,
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCol(null);
                  const noteId = e.dataTransfer.getData("text/plain");
                  if (noteId) moveToColumn(noteId, col.key);
                }}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-[11px] uppercase tracking-[0.1em] font-medium" style={{ color: col.color }}>
                    {col.label}
                  </span>
                  <span className="text-[11px] tabular-nums ml-auto" style={{ color: "var(--text-muted)" }}>
                    {colNotes.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {colNotes.map((note) => (
                    <div
                      key={note.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", note.id)}
                    >
                      <BoardCard
                        note={note}
                        onSelect={() => onSelectNote(note.id)}
                        onRefresh={onRefresh}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unassigned Notes */}
        {unassigned.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <IconChevron size={10} className="rotate-90" />
              <span className="text-[10px] uppercase tracking-[0.12em] font-medium" style={{ color: "var(--text-muted)" }}>
                No Status — click to assign
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {unassigned.slice(0, 9).map((note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl cursor-default group"
                  style={{ border: "1px solid var(--border-color)" }}
                >
                  {note.icon ? (
                    <span className="text-[12px]">{note.icon}</span>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}><IconPage size={12} /></span>
                  )}
                  <span
                    className="flex-1 text-[11px] font-light truncate"
                    style={{ color: "var(--text-primary)" }}
                    onClick={() => onSelectNote(note.id)}
                  >
                    {note.title || "Untitled"}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {COLUMNS.map((col) => (
                      <button
                        key={col.key}
                        onClick={() => moveToColumn(note.id, col.key)}
                        className="w-4 h-4 rounded-md cursor-default"
                        style={{ backgroundColor: col.color + "30", border: `1px solid ${col.color}50` }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { TagPill };
