import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Editor } from "@tiptap/react";
import { fileToDataUrl } from "../lib/storage";
import {
  IconPlus, IconSearch, IconText, IconHeading1, IconHeading2, IconHeading3,
  IconTaskList, IconBulletList, IconNumberedList, IconImage, IconCodeBlock,
  IconTable, IconQuote, IconDivider, IconCallout,
} from "./Icons";

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
  icon: React.ReactNode;
  action: (editor: Editor) => void;
}

const categories: BlockCategory[] = [
  {
    name: "TEXT",
    blocks: [
      { title: "Text", description: "Plain text paragraph", icon: <IconText size={16} />, action: (e) => e.chain().focus().setParagraph().run() },
      { title: "Heading 1", description: "Large section title", icon: <IconHeading1 size={16} />, action: (e) => e.chain().focus().setHeading({ level: 1 }).run() },
      { title: "Heading 2", description: "Medium section title", icon: <IconHeading2 size={16} />, action: (e) => e.chain().focus().setHeading({ level: 2 }).run() },
      { title: "Heading 3", description: "Small section title", icon: <IconHeading3 size={16} />, action: (e) => e.chain().focus().setHeading({ level: 3 }).run() },
    ],
  },
  {
    name: "LISTS",
    blocks: [
      { title: "To-do List", description: "Track tasks with checkboxes", icon: <IconTaskList size={16} />, action: (e) => e.chain().focus().toggleTaskList().run() },
      { title: "Bullet List", description: "Simple unordered list", icon: <IconBulletList size={16} />, action: (e) => e.chain().focus().toggleBulletList().run() },
      { title: "Numbered List", description: "Ordered numbered list", icon: <IconNumberedList size={16} />, action: (e) => e.chain().focus().toggleOrderedList().run() },
    ],
  },
  {
    name: "MEDIA",
    blocks: [
      {
        title: "Image", description: "Upload an image file", icon: <IconImage size={16} />,
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
      { title: "Code Block", description: "Code with syntax highlighting", icon: <IconCodeBlock size={16} />, action: (e) => e.chain().focus().setCodeBlock().run() },
      { title: "Table", description: "Insert a 3x3 table", icon: <IconTable size={16} />, action: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    ],
  },
  {
    name: "OTHER",
    blocks: [
      { title: "Quote", description: "Highlight a quote", icon: <IconQuote size={16} />, action: (e) => e.chain().focus().setBlockquote().run() },
      { title: "Divider", description: "Horizontal separator", icon: <IconDivider size={16} />, action: (e) => e.chain().focus().setHorizontalRule().run() },
      { title: "Callout", description: "Highlighted info block", icon: <IconCallout size={16} />, action: (e) => e.chain().focus().setBlockquote().run() },
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
      <motion.button
        onClick={() => setOpen(!open)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-default z-40"
        style={{
          backgroundColor: open ? "#10b981" : "var(--bg-tertiary)",
          color: open ? "var(--bg-primary)" : "var(--text-secondary)",
          border: open ? "none" : "1px solid var(--border-color)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
        <IconPlus size={20} strokeWidth={1.8} />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-6 w-[300px] max-h-[420px] rounded-2xl overflow-hidden z-50 flex flex-col"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 16px 40px -8px rgba(0,0,0,0.3)",
            }}
          >
            <div className="p-3 border-b" style={{ borderColor: "var(--border-color)" }}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  <IconSearch size={13} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter blocks..."
                  autoFocus
                  className="w-full py-2 pl-8 pr-3 text-[13px] rounded-lg outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {filteredCategories.map((cat) => (
                <div key={cat.name} className="mb-1">
                  <p className="px-4 py-1 text-[10px] tracking-[0.12em] uppercase font-medium" style={{ color: "var(--text-muted)" }}>
                    {cat.name}
                  </p>
                  {cat.blocks.map((block) => (
                    <button
                      key={block.title}
                      onClick={() => handleSelect(block)}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors cursor-default"
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          border: "1px solid var(--border-color)",
                          color: "var(--text-secondary)",
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
