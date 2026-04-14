import { Extension } from "@tiptap/react";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  IconText, IconHeading1, IconHeading2, IconHeading3,
  IconTaskList, IconBulletList, IconNumberedList,
  IconQuote, IconDivider, IconCodeBlock, IconImage,
  IconTable, IconCallout,
} from "../components/Icons";

export interface CommandItem {
  title: string;
  description: string;
  icon: ReactNode;
  command: (props: { editor: any; range: any }) => void;
}

const getSuggestionItems = (): CommandItem[] => [
  {
    title: "Text",
    description: "Plain text block",
    icon: <IconText size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: <IconHeading1 size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <IconHeading2 size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: <IconHeading3 size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with checkboxes",
    icon: <IconTaskList size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Bullet List",
    description: "Unordered list",
    icon: <IconBulletList size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Ordered list",
    icon: <IconNumberedList size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote",
    icon: <IconQuote size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  },
  {
    title: "Divider",
    description: "Horizontal line separator",
    icon: <IconDivider size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Code Block",
    description: "Code with syntax highlighting",
    icon: <IconCodeBlock size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  {
    title: "Image",
    description: "Upload or embed an image",
    icon: <IconImage size={15} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          editor.chain().focus().setImage({ src: reader.result as string }).run();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
  },
  {
    title: "Table",
    description: "Insert a table",
    icon: <IconTable size={15} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Callout",
    description: "Highlighted info block",
    icon: <IconCallout size={15} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setBlockquote()
        .run();
    },
  },
];

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) command(item);
      },
      [items, command]
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) return null;

    return (
      <div
        className="rounded-2xl overflow-hidden w-[280px] max-h-[320px] overflow-y-auto py-1"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 16px 40px -8px rgba(0,0,0,0.3)",
        }}
      >
        {items.map((item, index) => (
          <button
            key={item.title}
            onClick={() => selectItem(index)}
            className="w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors duration-100"
            style={{
              backgroundColor: index === selectedIndex ? "var(--bg-hover)" : "transparent",
              color: index === selectedIndex ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              {item.icon}
            </span>
            <div>
              <div className="text-[13px] font-light" style={{ color: "var(--text-primary)" }}>{item.title}</div>
              <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    );
  }
);

CommandList.displayName = "CommandList";

const renderItems = () => {
  let component: ReactRenderer<CommandListRef> | null = null;
  let popup: TippyInstance[] | null = null;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) return;

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
        offset: [0, 8],
      });
    },
    onUpdate: (props: any) => {
      component?.updateProps(props);
      if (popup && props.clientRect) {
        popup[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        });
      }
    },
    onKeyDown: (props: any) => {
      if (props.event.key === "Escape") {
        popup?.[0]?.hide();
        return true;
      }
      return component?.ref?.onKeyDown(props) ?? false;
    },
    onExit: () => {
      popup?.[0]?.destroy();
      component?.destroy();
    },
  };
};

const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          return getSuggestionItems().filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: renderItems,
      }),
    ];
  },
});

export default SlashCommand;
