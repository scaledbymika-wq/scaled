import { useState, useMemo } from "react";
import type { Note, NoteStatus, Workspace } from "../lib/storage";
import { updateNote, getTags } from "../lib/storage";
import { TagPill } from "./BoardView";
import { IconPage, IconChevron } from "./Icons";

interface PlannerViewProps {
  notes: Note[];
  workspaces: Workspace[];
  onSelectNote: (id: string) => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS: { key: NoteStatus; label: string; color: string }[] = [
  { key: "", label: "—", color: "var(--text-muted)" },
  { key: "todo", label: "To Do", color: "#ef4444" },
  { key: "doing", label: "Doing", color: "#f59e0b" },
  { key: "done", label: "Done", color: "#10b981" },
];

function StatusBadge({ status, onChange }: { status: NoteStatus; onChange: (s: NoteStatus) => void }) {
  const [open, setOpen] = useState(false);
  const current = STATUS_OPTIONS.find((s) => s.key === status) || STATUS_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="px-2 py-0.5 rounded-lg text-[10px] font-medium cursor-default transition-colors"
        style={{
          backgroundColor: status ? current.color + "18" : "var(--bg-tertiary)",
          color: current.color,
          border: `1px solid ${status ? current.color + "30" : "var(--border-color)"}`,
        }}
      >
        {current.label}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-50 w-[100px]"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={(e) => { e.stopPropagation(); onChange(opt.key); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] cursor-default transition-colors"
              style={{
                color: opt.color,
                backgroundColor: status === opt.key ? "var(--bg-hover)" : "transparent",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type SortKey = "title" | "status" | "scheduledAt" | "updatedAt";

export default function PlannerView({ notes, workspaces, onSelectNote, onRefresh }: PlannerViewProps) {
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const tags = getTags();
  const allNotes = useMemo(() => notes.filter((n) => !n.trashed), [notes]);

  const filtered = useMemo(() => {
    let list = allNotes;
    if (filterTag) list = list.filter((n) => n.tags.includes(filterTag));
    return list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "title") cmp = (a.title || "Untitled").localeCompare(b.title || "Untitled");
      else if (sortBy === "status") cmp = (a.status || "").localeCompare(b.status || "");
      else if (sortBy === "scheduledAt") cmp = (a.scheduledAt || "").localeCompare(b.scheduledAt || "");
      else cmp = a.updatedAt - b.updatedAt;
      return sortAsc ? cmp : -cmp;
    });
  }, [allNotes, sortBy, sortAsc, filterTag]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(true); }
  };

  const handleStatusChange = (noteId: string, status: NoteStatus) => {
    updateNote(noteId, { status });
    onRefresh();
  };

  const handleScheduleChange = (noteId: string, value: string) => {
    updateNote(noteId, { scheduledAt: value });
    onRefresh();
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKey)}
      className="flex items-center gap-1 cursor-default text-[10px] uppercase tracking-[0.1em] font-medium"
      style={{ color: sortBy === sortKey ? "var(--text-primary)" : "var(--text-muted)" }}
    >
      {label}
      {sortBy === sortKey && (
        <IconChevron size={8} className={sortAsc ? "-rotate-90" : "rotate-90"} />
      )}
    </button>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="h-[52px] flex-shrink-0 w-full" data-tauri-drag-region="true" />

      <div className="max-w-[900px] mx-auto px-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif italic text-2xl font-light" style={{ color: "var(--text-primary)" }}>
              Planner
            </h1>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              All pages as a table with tags and schedule
            </p>
          </div>
        </div>

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Filter:</span>
            <button
              onClick={() => setFilterTag(null)}
              className="px-2 py-0.5 rounded-full text-[10px] cursor-default transition-colors"
              style={{
                backgroundColor: !filterTag ? "var(--bg-hover)" : "transparent",
                color: !filterTag ? "var(--text-primary)" : "var(--text-muted)",
                border: "1px solid var(--border-color)",
              }}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium cursor-default transition-colors"
                style={{
                  backgroundColor: filterTag === tag.id ? tag.color + "20" : "transparent",
                  color: filterTag === tag.id ? tag.color : "var(--text-muted)",
                  border: `1px solid ${filterTag === tag.id ? tag.color + "40" : "var(--border-color)"}`,
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
          {/* Header Row */}
          <div
            className="grid gap-3 px-4 py-2.5"
            style={{
              gridTemplateColumns: "1fr 140px 100px 140px",
              backgroundColor: "var(--bg-tertiary)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <SortHeader label="Title" sortKey="title" />
            <span className="text-[10px] uppercase tracking-[0.1em] font-medium" style={{ color: "var(--text-muted)" }}>Tags</span>
            <SortHeader label="Status" sortKey="status" />
            <SortHeader label="Scheduled" sortKey="scheduledAt" />
          </div>

          {/* Rows */}
          {filtered.map((note, i) => {
            const noteTags = tags.filter((t) => note.tags.includes(t.id));
            const ws = workspaces.find((w) => w.id === note.workspace);
            return (
              <div
                key={note.id}
                className="grid gap-3 px-4 py-2.5 items-center transition-colors cursor-default"
                style={{
                  gridTemplateColumns: "1fr 140px 100px 140px",
                  backgroundColor: "var(--bg-secondary)",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border-color)" : "none",
                }}
                onClick={() => onSelectNote(note.id)}
              >
                {/* Title */}
                <div className="flex items-center gap-2 min-w-0">
                  {note.icon ? (
                    <span className="text-[13px] flex-shrink-0">{note.icon}</span>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }} className="flex-shrink-0"><IconPage size={13} /></span>
                  )}
                  <span className="text-[12px] font-light truncate" style={{ color: "var(--text-primary)" }}>
                    {note.title || "Untitled"}
                  </span>
                  {ws && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ws.color }} />
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {noteTags.map((tag) => (
                    <TagPill key={tag.id} tag={tag} />
                  ))}
                </div>

                {/* Status */}
                <div onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={note.status} onChange={(s) => handleStatusChange(note.id, s)} />
                </div>

                {/* Schedule */}
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="datetime-local"
                    value={note.scheduledAt}
                    onChange={(e) => handleScheduleChange(note.id, e.target.value)}
                    className="bg-transparent outline-none text-[11px] tabular-nums w-full cursor-default"
                    style={{ color: note.scheduledAt ? "var(--text-primary)" : "var(--text-muted)" }}
                  />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-[12px] font-light italic" style={{ color: "var(--text-muted)" }}>
                {filterTag ? "No pages with this tag" : "No pages yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
