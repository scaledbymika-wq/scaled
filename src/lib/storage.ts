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

// — Board System (Notion-style) —

export interface Board {
  id: string;
  name: string;
  icon: string;
  color: string;
  columnOrder: string[];
  createdAt: number;
  updatedAt: number;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  color: string;
  cardOrder: string[];
}

export interface BoardCard {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  color: string;
  tags: string[];
  scheduledAt: string;
  createdAt: number;
  updatedAt: number;
}

const BOARDS_KEY = "scaled-boards";
const COLUMNS_KEY = "scaled-board-columns";
const CARDS_KEY = "scaled-board-cards";

const COLUMN_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

function readBoards(): Board[] {
  try { return JSON.parse(localStorage.getItem(BOARDS_KEY) || "[]"); } catch { return []; }
}
function writeBoards(b: Board[]) { localStorage.setItem(BOARDS_KEY, JSON.stringify(b)); }
function readColumns(): BoardColumn[] {
  try { return JSON.parse(localStorage.getItem(COLUMNS_KEY) || "[]"); } catch { return []; }
}
function writeColumns(c: BoardColumn[]) { localStorage.setItem(COLUMNS_KEY, JSON.stringify(c)); }
function readCards(): BoardCard[] {
  try { return JSON.parse(localStorage.getItem(CARDS_KEY) || "[]"); } catch { return []; }
}
function writeCards(c: BoardCard[]) { localStorage.setItem(CARDS_KEY, JSON.stringify(c)); }

// Board CRUD
export function getBoards(): Board[] {
  return readBoards().sort((a, b) => b.updatedAt - a.updatedAt);
}
export function getBoard(id: string): Board | undefined {
  return readBoards().find((b) => b.id === id);
}
export function createBoard(name: string): Board {
  const boards = readBoards();
  const board: Board = {
    id: crypto.randomUUID(),
    name,
    icon: "",
    color: WORKSPACE_COLORS[boards.length % WORKSPACE_COLORS.length],
    columnOrder: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  boards.push(board);
  writeBoards(boards);
  // Create default columns
  const defaults = [
    { name: "To Do", color: "#ef4444" },
    { name: "Doing", color: "#f59e0b" },
    { name: "Done", color: "#10b981" },
  ];
  const cols = readColumns();
  defaults.forEach((d) => {
    const col: BoardColumn = { id: crypto.randomUUID(), boardId: board.id, name: d.name, color: d.color, cardOrder: [] };
    cols.push(col);
    board.columnOrder.push(col.id);
  });
  writeColumns(cols);
  // Update board with column order
  const idx = boards.findIndex((b) => b.id === board.id);
  boards[idx] = board;
  writeBoards(boards);
  return board;
}
export function updateBoard(id: string, updates: Partial<Omit<Board, "id" | "createdAt">>) {
  const boards = readBoards();
  const idx = boards.findIndex((b) => b.id === id);
  if (idx === -1) return;
  Object.assign(boards[idx], updates, { updatedAt: Date.now() });
  writeBoards(boards);
}
export function deleteBoard(id: string) {
  writeBoards(readBoards().filter((b) => b.id !== id));
  writeCards(readCards().filter((c) => c.boardId !== id));
  writeColumns(readColumns().filter((c) => c.boardId !== id));
}

// Column CRUD
export function getColumnsForBoard(boardId: string): BoardColumn[] {
  const board = getBoard(boardId);
  if (!board) return [];
  const cols = readColumns().filter((c) => c.boardId === boardId);
  return board.columnOrder.map((id) => cols.find((c) => c.id === id)).filter(Boolean) as BoardColumn[];
}
export function createColumn(boardId: string, name: string): BoardColumn {
  const cols = readColumns();
  const boardCols = cols.filter((c) => c.boardId === boardId);
  const col: BoardColumn = {
    id: crypto.randomUUID(),
    boardId,
    name,
    color: COLUMN_COLORS[boardCols.length % COLUMN_COLORS.length],
    cardOrder: [],
  };
  cols.push(col);
  writeColumns(cols);
  // Add to board's columnOrder
  const boards = readBoards();
  const board = boards.find((b) => b.id === boardId);
  if (board) {
    board.columnOrder.push(col.id);
    board.updatedAt = Date.now();
    writeBoards(boards);
  }
  return col;
}
export function updateColumn(id: string, updates: Partial<Omit<BoardColumn, "id" | "boardId">>) {
  const cols = readColumns();
  const idx = cols.findIndex((c) => c.id === id);
  if (idx === -1) return;
  Object.assign(cols[idx], updates);
  writeColumns(cols);
}
export function deleteColumn(id: string) {
  const col = readColumns().find((c) => c.id === id);
  if (!col) return;
  writeColumns(readColumns().filter((c) => c.id !== id));
  writeCards(readCards().filter((c) => c.columnId !== id));
  // Remove from board's columnOrder
  const boards = readBoards();
  const board = boards.find((b) => b.id === col.boardId);
  if (board) {
    board.columnOrder = board.columnOrder.filter((cid) => cid !== id);
    board.updatedAt = Date.now();
    writeBoards(boards);
  }
}
export function reorderColumns(boardId: string, newOrder: string[]) {
  updateBoard(boardId, { columnOrder: newOrder });
}

// Card CRUD
export function getCardsForColumn(columnId: string): BoardCard[] {
  const col = readColumns().find((c) => c.id === columnId);
  if (!col) return [];
  const cards = readCards().filter((c) => c.columnId === columnId);
  return col.cardOrder.map((id) => cards.find((c) => c.id === id)).filter(Boolean) as BoardCard[];
}
export function getCardsForBoard(boardId: string): BoardCard[] {
  return readCards().filter((c) => c.boardId === boardId);
}
export function getAllCards(): BoardCard[] {
  return readCards().sort((a, b) => b.updatedAt - a.updatedAt);
}
export function createCard(boardId: string, columnId: string, title: string): BoardCard {
  const card: BoardCard = {
    id: crypto.randomUUID(),
    boardId,
    columnId,
    title,
    description: "",
    color: "",
    tags: [],
    scheduledAt: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const cards = readCards();
  cards.push(card);
  writeCards(cards);
  // Add to column's cardOrder
  const cols = readColumns();
  const col = cols.find((c) => c.id === columnId);
  if (col) {
    col.cardOrder.push(card.id);
    writeColumns(cols);
  }
  return card;
}
export function updateCard(id: string, updates: Partial<Omit<BoardCard, "id" | "boardId" | "createdAt">>) {
  const cards = readCards();
  const idx = cards.findIndex((c) => c.id === id);
  if (idx === -1) return;
  Object.assign(cards[idx], updates, { updatedAt: Date.now() });
  writeCards(cards);
}
export function deleteCard(id: string) {
  const card = readCards().find((c) => c.id === id);
  if (!card) return;
  writeCards(readCards().filter((c) => c.id !== id));
  const cols = readColumns();
  const col = cols.find((c) => c.id === card.columnId);
  if (col) {
    col.cardOrder = col.cardOrder.filter((cid) => cid !== id);
    writeColumns(cols);
  }
}
export function moveCard(cardId: string, toColumnId: string, toIndex: number) {
  const cards = readCards();
  const card = cards.find((c) => c.id === cardId);
  if (!card) return;
  const cols = readColumns();
  // Remove from source column
  const srcCol = cols.find((c) => c.id === card.columnId);
  if (srcCol) {
    srcCol.cardOrder = srcCol.cardOrder.filter((id) => id !== cardId);
  }
  // Insert into target column
  const tgtCol = cols.find((c) => c.id === toColumnId);
  if (tgtCol) {
    const idx = Math.min(toIndex, tgtCol.cardOrder.length);
    tgtCol.cardOrder.splice(idx, 0, cardId);
  }
  // Update card's columnId
  card.columnId = toColumnId;
  card.updatedAt = Date.now();
  writeColumns(cols);
  writeCards(cards);
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
