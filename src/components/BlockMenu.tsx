import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Editor } from "@tiptap/react";
import { fileToDataUrl } from "../lib/storage";

interface BlockMenuProps {
  editor: Editor;
}

interface BlockCategory {
  name: string;
  blocks: BlockItem[];
}

interface BlockItem {
  title: string;
  description: string;
  icon: string;
  action: (editor: Editor) => void;
}

const categories: BlockCategory[] = [
  {
    name: "TEXT",
    blocks: [
      { title: "Text", description: "Plain text paragraph", icon: "Aa", action: (e) => e.chain().focus().setParagraph().run() },
      { title: "Heading 1", description: "Large section title", icon: "H1", action: (e) => e.chain().focus().setHeading({ level: 1 }).run() },
      { title: "Heading 2", description: "Medium section title", icon: "H2", action: (e) => e.chain().focus().setHeading({ level: 2 }).run() },
      { title: "Heading 3", description: "Small section title", icon: "H3", action: (e) => e.chain().focus().setHeading({ level: 3 }).run() },
    ],
  },
  {
    name: "LISTS",
    blocks: [
      { title: "To-do List", description: "Track tasks with checkboxes", icon: "\u2611", action: (e) => e.chain().focus().toggleTaskList().run() },
      { title: "Bullet List", description: "Simple unordered list", icon: "\u2022", action: (e) => e.chain().focus().toggleBulletList().run() },
      { title: "Numbered List", description: "Ordered numbered list", icon: "1.", action: (e) => e.chain().focus().toggleOrderedList().run() },
    ],
  },
  {
    name: "MEDIA",
    blocks: [
      {
        title: "Image", description: "Upload an image file", icon: "\ud83d\uddbc\ufe0f",
        action: (editor) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const src = await fileToDataUrl(file);
            editor.chain().focus().setImage({ src }).run();
          };
          input.click();
        },
      },
      { title: "Code Block", description: "Code with syntax highlighting", icon: "</>", action: (e) => e.chain().focus().setCodeBlock().run() },
      { title: "Table", description: "Insert a 3x3 table", icon: "\u25a6", action: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    ],
  },
  {
    name: "OTHER",
    blocks: [
      { title: "Quote", description: "Highlight a quote", icon: "\u201c", action: (e) => e.chain().focus().setBlockquote().run() },
      { title: "Divider", description: "Horizontal separator", icon: "\u2014", action: (e) => e.chain().focus().setHorizontalRule().run() },
    ],
  },
];

export default function BlockMenu({ editor }: BlockMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      blocks: cat.blocks.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.description.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.blocks.length > 0);

  const handleSelect = (block: BlockItem) => {
    block.action(editor);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-default z-40"
        style={{
          backgroundColor: open ? "#10b981" : "var(--bg-tertiary)",
          color: open ? "var(--bg-primary)" : "var(--text-secondary)",
          border: open ? "none" : "1px solid var(--border-color)",
          transform: open ? "rotate(45deg)" : "none",
          boxShadow: "var(--shadow)",
        }}
      >
        <span className="text-xl font-light">+</span>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 w-[300px] max-h-[420px] rounded-xl overflow-hidden z-50 flex flex-col"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="p-3 border-b" style={{ borderColor: "var(--border-color)" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter blocks..."
                autoFocus
                className="w-full py-2 px-3 text-[13px] rounded-lg outline-none transition-colors"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {filteredCategories.map((cat) => (
                <div key={cat.name} className="mb-2">
                  <p className="px-4 py-1 text-[10px] font-mono tracking-widest" style={{ color: "var(--text-muted)" }}>
                    {cat.name}
                  </p>
                  {cat.blocks.map((block) => (
                    <button
                      key={block.title}
                      onClick={() => handleSelect(block)}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors cursor-default"
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        {block.icon}
                      </span>
                      <div>
                        <div className="text-[13px] font-light" style={{ color: "var(--text-primary)" }}>{block.title}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{block.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <p className="text-center text-[13px] py-6 italic" style={{ color: "var(--text-muted)" }}>No blocks found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
