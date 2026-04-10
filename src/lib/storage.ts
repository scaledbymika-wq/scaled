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
  createdAt: number;
  updatedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
}

const STORAGE_KEY = "scaled-notes";
const WORKSPACE_KEY = "scaled-workspaces";

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

// Convert image file to base64 data URL for local storage
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
