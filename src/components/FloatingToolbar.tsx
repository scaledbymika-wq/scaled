import { useEffect, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import {
  IconBold, IconItalic, IconUnderline, IconStrikethrough,
  IconCode, IconHighlight, IconLink, IconAlignLeft, IconAlignCenter, IconAlignRight,
} from "./Icons";

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

  const formatButtons = [
    { icon: <IconBold size={14} />, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive("bold") },
    { icon: <IconItalic size={14} />, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive("italic") },
    { icon: <IconUnderline size={14} />, action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive("underline") },
    { icon: <IconStrikethrough size={14} />, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive("strike") },
    { icon: <IconCode size={14} />, action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive("code") },
    { icon: <IconHighlight size={14} />, action: () => editor.chain().focus().toggleHighlight().run(), isActive: editor.isActive("highlight") },
  ];

  const alignButtons = [
    { icon: <IconAlignLeft size={14} />, action: () => editor.chain().focus().setTextAlign("left").run(), isActive: editor.isActive({ textAlign: "left" }) },
    { icon: <IconAlignCenter size={14} />, action: () => editor.chain().focus().setTextAlign("center").run(), isActive: editor.isActive({ textAlign: "center" }) },
    { icon: <IconAlignRight size={14} />, action: () => editor.chain().focus().setTextAlign("right").run(), isActive: editor.isActive({ textAlign: "right" }) },
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
        className="rounded-xl flex items-center overflow-hidden"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
        {formatButtons.map((btn, i) => (
          <button
            key={i}
            onMouseDown={(e) => {
              e.preventDefault();
              btn.action();
            }}
            className="w-9 h-9 flex items-center justify-center transition-colors duration-100 cursor-default"
            style={{
              color: btn.isActive ? "#10b981" : "var(--text-secondary)",
              backgroundColor: btn.isActive ? "var(--bg-tertiary)" : "transparent",
              borderLeft: i > 0 ? "1px solid var(--border-color)" : "none",
            }}
          >
            {btn.icon}
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
          className="w-9 h-9 flex items-center justify-center transition-colors duration-100 cursor-default"
          style={{
            color: editor.isActive("link") ? "#10b981" : "var(--text-secondary)",
            backgroundColor: editor.isActive("link") ? "var(--bg-tertiary)" : "transparent",
            borderLeft: "1px solid var(--border-color)",
          }}
        >
          <IconLink size={14} />
        </button>

        {/* Separator */}
        <div className="w-px h-5 mx-0.5" style={{ backgroundColor: "var(--border-color)" }} />

        {/* Alignment */}
        {alignButtons.map((btn, i) => (
          <button
            key={`align-${i}`}
            onMouseDown={(e) => {
              e.preventDefault();
              btn.action();
            }}
            className="w-9 h-9 flex items-center justify-center transition-colors duration-100 cursor-default"
            style={{
              color: btn.isActive ? "#10b981" : "var(--text-secondary)",
              backgroundColor: btn.isActive ? "var(--bg-tertiary)" : "transparent",
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
