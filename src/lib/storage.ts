export type NoteStatus = "" | "todo" | "doing" | "done";

export interface Note {
  id: string;
  title: string;
  content: string;
  icon: string;
  cover: string;
  parentId: string | null;
  favorite: boolean;
  trashed: boolean;
  workspace: string;
  status: NoteStatus;
  tags: string[]; // tag IDs
  scheduledAt: string; // ISO date-time string or ""
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
}

const STORAGE_KEY = "scaled-notes";
const WORKSPACE_KEY = "scaled-workspaces";
const TAG_KEY = "scaled-tags";

function readAll(): Note[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

function writeAll(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function migrate(note: Partial<Note> & { id: string }): Note {
  return {
    id: note.id,
    title: note.title ?? "Untitled",
    content: note.content ?? "",
    icon: note.icon ?? "",
    cover: note.cover ?? "",
    parentId: note.parentId ?? null,
    favorite: note.favorite ?? false,
    trashed: note.trashed ?? false,
    workspace: note.workspace ?? "",
    status: note.status ?? "",
    tags: note.tags ?? [],
    scheduledAt: note.scheduledAt ?? "",
    createdAt: note.createdAt ?? Date.now(),
    updatedAt: note.updatedAt ?? Date.now(),
  };
}

export function getNotes(): Note[] {
  return readAll()
    .map(migrate)
    .filter((n) => !n.trashed)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getNotesForWorkspace(workspaceId: string): Note[] {
  if (!workspaceId) return getNotes();
  return getNotes().filter((n) => n.workspace === workspaceId);
}

export function getFavorites(): Note[] {
  return getNotes().filter((n) => n.favorite);
}

export function getTrashed(): Note[] {
  return readAll()
    .map(migrate)
    .filter((n) => n.trashed)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getChildren(parentId: string): Note[] {
  return getNotes().filter((n) => n.parentId === parentId);
}

export function getRootNotes(): Note[] {
  return getNotes().filter((n) => !n.parentId);
}

export function getNote(id: string): Note | undefined {
  const note = readAll().find((n) => n.id === id);
  return note ? migrate(note) : undefined;
}

export function searchNotes(query: string): Note[] {
  const q = query.toLowerCase();
  return getNotes().filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().replace(/<[^>]*>/g, "").includes(q)
  );
}

export function createNote(parentId: string | null = null, workspace = ""): Note {
  const note: Note = {
    id: crypto.randomUUID(),
    title: "",
    content: "",
    icon: "",
    cover: "",
    parentId,
    favorite: false,
    trashed: false,
    workspace,
    status: "",
    tags: [],
    scheduledAt: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const notes = readAll();
  notes.push(note);
  writeAll(notes);
  return note;
}

export function updateNote(id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) {
  const notes = readAll().map(migrate);
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return;
  Object.assign(notes[idx], updates, { updatedAt: Date.now() });
  writeAll(notes);
}

export function deleteNote(id: string) {
  updateNote(id, { trashed: true });
}

export function restoreNote(id: string) {
  updateNote(id, { trashed: false });
}

export function permanentlyDelete(id: string) {
  writeAll(readAll().filter((n) => n.id !== id));
}

export function toggleFavorite(id: string) {
  const note = getNote(id);
  if (note) updateNote(id, { favorite: !note.favorite });
}

// — Workspace CRUD —

const WORKSPACE_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

export function getWorkspaces(): Workspace[] {
  const raw = localStorage.getItem(WORKSPACE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Workspace[];
  } catch {
    return [];
  }
}

function writeWorkspaces(ws: Workspace[]) {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(ws));
}

export function createWorkspace(name: string): Workspace {
  const existing = getWorkspaces();
  const colorIndex = existing.length % WORKSPACE_COLORS.length;
  const ws: Workspace = {
    id: crypto.randomUUID(),
    name,
    color: WORKSPACE_COLORS[colorIndex],
  };
  existing.push(ws);
  writeWorkspaces(existing);
  return ws;
}

export function updateWorkspace(id: string, updates: Partial<Omit<Workspace, "id">>) {
  const workspaces = getWorkspaces();
  const idx = workspaces.findIndex((w) => w.id === id);
  if (idx === -1) return;
  Object.assign(workspaces[idx], updates);
  writeWorkspaces(workspaces);
}

export function deleteWorkspace(id: string) {
  writeWorkspaces(getWorkspaces().filter((w) => w.id !== id));
  // Unassign notes from deleted workspace
  const notes = readAll().map(migrate);
  notes.forEach((n) => {
    if (n.workspace === id) n.workspace = "";
  });
  writeAll(notes);
}

export function getNextWorkspaceColor(): string {
  const existing = getWorkspaces();
  return WORKSPACE_COLORS[existing.length % WORKSPACE_COLORS.length];
}

// — Tag CRUD —

const TAG_COLORS = [
  "#8b5cf6", "#ef4444", "#10b981", "#f59e0b", "#3b82f6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
];

export function getTags(): Tag[] {
  const raw = localStorage.getItem(TAG_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Tag[]; }
  catch { return []; }
}

function writeTags(tags: Tag[]) {
  localStorage.setItem(TAG_KEY, JSON.stringify(tags));
}

export function createTag(name: string): Tag {
  const existing = getTags();
  const tag: Tag = {
    id: crypto.randomUUID(),
    name,
    color: TAG_COLORS[existing.length % TAG_COLORS.length],
  };
  existing.push(tag);
  writeTags(existing);
  return tag;
}

export function updateTag(id: string, updates: Partial<Omit<Tag, "id">>) {
  const tags = getTags();
  const idx = tags.findIndex((t) => t.id === id);
  if (idx === -1) return;
  Object.assign(tags[idx], updates);
  writeTags(tags);
}

export function deleteTag(id: string) {
  writeTags(getTags().filter((t) => t.id !== id));
  // Remove tag from all notes
  const notes = readAll().map(migrate);
  notes.forEach((n) => {
    n.tags = n.tags.filter((t) => t !== id);
  });
  writeAll(notes);
}

export function addTagToNote(noteId: string, tagId: string) {
  const note = getNote(noteId);
  if (!note || note.tags.includes(tagId)) return;
  updateNote(noteId, { tags: [...note.tags, tagId] });
}

export function removeTagFromNote(noteId: string, tagId: string) {
  const note = getNote(noteId);
  if (!note) return;
  updateNote(noteId, { tags: note.tags.filter((t) => t !== tagId) });
}

// Convert image file to base64 data URL for local storage
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
