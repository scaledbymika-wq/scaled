import { useEffect, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";

interface FloatingToolbarProps {
  editor: Editor;
}

interface Position {
  top: number;
  left: number;
}

export default function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [visible, setVisible] = useState(false);

  const updatePosition = useCallback(() => {
    const { from, to, empty } = editor.state.selection;
    if (empty || from === to) {
      setVisible(false);
      return;
    }

    const view = editor.view;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    const editorEl = view.dom.closest(".select-text");
    if (!editorEl) return;

    const editorRect = editorEl.getBoundingClientRect();
    const top = start.top - editorRect.top - 44;
    const left = (start.left + end.left) / 2 - editorRect.left;

    setPosition({ top, left });
    setVisible(true);
  }, [editor]);

  useEffect(() => {
    editor.on("selectionUpdate", updatePosition);
    editor.on("blur", () => setVisible(false));
    return () => {
      editor.off("selectionUpdate", updatePosition);
    };
  }, [editor, updatePosition]);

  if (!visible || !position) return null;

  const buttons = [
    {
      label: "B",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      label: "I",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      label: "U",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
    },
    {
      label: "S",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    {
      label: "<>",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
    },
    {
      label: "H",
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive("highlight"),
    },
  ];

  return (
    <div
      className="absolute z-50 transition-all duration-100"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div
        className="rounded-lg shadow-2xl flex items-center overflow-hidden"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
        }}
      >
        {buttons.map((btn, i) => (
          <button
            key={btn.label}
            onMouseDown={(e) => {
              e.preventDefault();
              btn.action();
            }}
            className="px-3 py-2 text-[13px] font-mono transition-colors duration-100 cursor-default"
            style={{
              color: btn.isActive ? "#10b981" : "var(--text-secondary)",
              backgroundColor: btn.isActive ? "var(--bg-tertiary)" : "transparent",
              borderLeft: i > 0 ? "1px solid var(--border-color)" : "none",
            }}
          >
            {btn.label}
          </button>
        ))}

        {/* Link */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt("URL:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className="px-3 py-2 text-[13px] transition-colors duration-100 cursor-default"
          style={{
            color: editor.isActive("link") ? "#10b981" : "var(--text-secondary)",
            backgroundColor: editor.isActive("link") ? "var(--bg-tertiary)" : "transparent",
            borderLeft: "1px solid var(--border-color)",
          }}
        >
          Link
        </button>
      </div>
    </div>
  );
}
