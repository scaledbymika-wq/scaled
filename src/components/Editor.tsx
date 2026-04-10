import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Dropcursor from "@tiptap/extension-dropcursor";
import { common, createLowlight } from "lowlight";
import { useEffect, useRef, useCallback } from "react";
import SlashCommand from "../extensions/SlashCommand";
import FloatingToolbar from "./FloatingToolbar";
import BlockMenu from "./BlockMenu";
import { fileToDataUrl } from "../lib/storage";
import { useTheme } from "../lib/theme";

const lowlight = createLowlight(common);

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  icon: string;
  cover: string;
  onIconChange: (icon: string) => void;
  onCoverChange: (cover: string) => void;
}

export default function Editor({
  content,
  onUpdate,
  title,
  onTitleChange,
  icon,
  cover,
  onIconChange,
  onCoverChange,
}: EditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const { settings } = useTheme();

  const editorMaxWidth = settings.editorWidth === "narrow" ? "620px" : settings.editorWidth === "wide" ? "900px" : "720px";
  const editorFontSize = settings.fontSize === "small" ? "14px" : settings.fontSize === "large" ? "18px" : "16px";
  const coverInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // replaced by lowlight version
        dropcursor: false,
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ allowBase64: true, inline: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Dropcursor.configure({ color: "#10b981", width: 2 }),
      SlashCommand,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: { class: "tiptap" },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          event.preventDefault();
          Array.from(files).forEach(async (file) => {
            if (file.type.startsWith("image/")) {
              const src = await fileToDataUrl(file);
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src })
                )
              );
            }
          });
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                fileToDataUrl(file).then((src) => {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src })
                    )
                  );
                });
              }
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

  const handleCoverUpload = useCallback(async () => {
    coverInputRef.current?.click();
  }, []);

  const handleCoverFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const dataUrl = await fileToDataUrl(file);
      onCoverChange(dataUrl);
    },
    [onCoverChange]
  );

  const EMOJI_LIST = [
    "\ud83d\udcdd", "\ud83d\ude80", "\ud83d\udca1", "\ud83c\udfaf", "\ud83d\udd25",
    "\u2b50", "\ud83d\udcda", "\ud83d\udee0\ufe0f", "\ud83c\udf1f", "\ud83d\udcbc",
    "\ud83d\udcac", "\ud83c\udf10", "\ud83d\udd12", "\u2705", "\ud83d\udcc8",
    "\ud83d\udce6", "\ud83c\udfa8", "\u26a1", "\ud83d\udd2e", "\ud83e\udde0",
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto">
      {/* Hidden file input for cover */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverFile}
      />

      {/* Cover Image */}
      {cover ? (
        <div className="relative w-full h-[200px] group">
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, var(--bg-primary))" }} />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button
              onClick={handleCoverUpload}
              className="px-3 py-1.5 text-[11px] backdrop-blur rounded-lg transition-colors"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              Change cover
            </button>
            <button
              onClick={() => onCoverChange("")}
              className="px-3 py-1.5 text-[11px] backdrop-blur rounded-lg transition-colors"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <div className={`mx-auto px-8 ${cover ? "pt-8" : "pt-28"} pb-40`} style={{ maxWidth: editorMaxWidth, fontSize: editorFontSize }}>
        {/* Page Controls */}
        <div className="flex items-center gap-2 mb-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => {
              const picked = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
              onIconChange(icon ? "" : picked);
            }}
            className="px-2 py-1 text-[11px] border border-transparent rounded transition-all"
            style={{ color: "var(--text-muted)" }}
          >
            {icon ? "Remove icon" : "Add icon"}
          </button>
          {!cover && (
            <button
              onClick={handleCoverUpload}
              className="px-2 py-1 text-[11px] border border-transparent rounded transition-all"
              style={{ color: "var(--text-muted)" }}
            >
              Add cover
            </button>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <button
            onClick={() => {
              const picked = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
              onIconChange(picked);
            }}
            className="text-5xl mb-4 hover:scale-110 transition-transform cursor-default"
          >
            {icon}
          </button>
        )}

        {/* Title */}
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          rows={1}
          className="w-full bg-transparent border-none outline-none resize-none font-serif italic text-[2.8rem] leading-[1.15] font-light mb-2 select-text title-input"
          style={{ color: "var(--text-primary)" }}
        />

        {/* Editor */}
        <div className="select-text relative">
          {editor && <FloatingToolbar editor={editor} />}
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Block Insert Menu (floating + button) */}
      {editor && <BlockMenu editor={editor} />}
    </div>
  );
}
