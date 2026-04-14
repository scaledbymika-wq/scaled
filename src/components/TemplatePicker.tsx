import { motion } from "framer-motion";
import {
  IconPage, IconMeeting, IconRocket, IconChart, IconJournal,
  IconTarget, IconHandshake, IconLightning, IconX, IconTaskList,
} from "./Icons";

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  defaultTitle: string;
}

const templates: Template[] = [
  {
    id: "blank",
    name: "Blank Page",
    description: "Start from scratch",
    icon: <IconPage size={20} strokeWidth={1.3} />,
    defaultTitle: "",
    content: "",
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    description: "Agenda, notes, and action items",
    icon: <IconMeeting size={20} strokeWidth={1.3} />,
    defaultTitle: "Meeting Notes",
    content: `<h2>Agenda</h2><ul><li><p>Topic 1</p></li><li><p>Topic 2</p></li><li><p>Topic 3</p></li></ul><h2>Notes</h2><p></p><h2>Action Items</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Action item 1</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Action item 2</p></div></li></ul>`,
  },
  {
    id: "project",
    name: "Project Brief",
    description: "Goals, timeline, and resources",
    icon: <IconRocket size={20} strokeWidth={1.3} />,
    defaultTitle: "Project Brief",
    content: `<h2>Overview</h2><p>Describe the project in 2-3 sentences.</p><h2>Goals</h2><ul><li><p>Goal 1</p></li><li><p>Goal 2</p></li><li><p>Goal 3</p></li></ul><h2>Timeline</h2><table><tr><th>Phase</th><th>Deadline</th><th>Status</th></tr><tr><td>Research</td><td></td><td></td></tr><tr><td>Execution</td><td></td><td></td></tr><tr><td>Review</td><td></td><td></td></tr></table><h2>Resources</h2><p></p>`,
  },
  {
    id: "weekly",
    name: "Weekly Review",
    description: "Reflect and plan ahead",
    icon: <IconChart size={20} strokeWidth={1.3} />,
    defaultTitle: "Weekly Review",
    content: `<h2>Wins This Week</h2><ul><li><p></p></li></ul><h2>Challenges</h2><ul><li><p></p></li></ul><h2>Learnings</h2><blockquote><p>What did I learn this week?</p></blockquote><h2>Next Week Priorities</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Priority 1</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Priority 2</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Priority 3</p></div></li></ul>`,
  },
  {
    id: "journal",
    name: "Daily Journal",
    description: "Daily thoughts and reflections",
    icon: <IconJournal size={20} strokeWidth={1.3} />,
    defaultTitle: new Date().toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    content: `<h2>Today</h2><p></p><h2>Grateful For</h2><ul><li><p></p></li></ul><h2>Focus</h2><p>The one thing that matters most today:</p><blockquote><p></p></blockquote><h2>Notes</h2><p></p>`,
  },
  {
    id: "strategy",
    name: "Strategy Document",
    description: "Analysis, plan, and execution",
    icon: <IconTarget size={20} strokeWidth={1.3} />,
    defaultTitle: "Strategy",
    content: `<h2>Situation Analysis</h2><p>Where are we now?</p><h2>Objective</h2><p>Where do we want to be?</p><h2>Strategy</h2><p>How do we get there?</p><h2>Tactics</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Tactic 1</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Tactic 2</p></div></li></ul><h2>KPIs</h2><table><tr><th>Metric</th><th>Current</th><th>Target</th></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>`,
  },
  {
    id: "client",
    name: "Client Onboarding",
    description: "New client setup checklist",
    icon: <IconHandshake size={20} strokeWidth={1.3} />,
    defaultTitle: "Client Onboarding",
    content: `<h2>Client Details</h2><table><tr><th>Field</th><th>Value</th></tr><tr><td>Name</td><td></td></tr><tr><td>Industry</td><td></td></tr><tr><td>Contact</td><td></td></tr><tr><td>Start Date</td><td></td></tr></table><h2>Onboarding Checklist</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Welcome email sent</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Access credentials shared</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Kickoff meeting scheduled</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Brand assets received</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Strategy document created</p></div></li></ul><h2>Notes</h2><p></p>`,
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    description: "Capture ideas freely",
    icon: <IconLightning size={20} strokeWidth={1.3} />,
    defaultTitle: "Brainstorm",
    content: `<h2>Topic</h2><p></p><hr><h2>Ideas</h2><ul><li><p></p></li></ul><h2>Best Ideas to Explore</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p></p></div></li></ul>`,
  },
  {
    id: "todo",
    name: "To-Do List",
    description: "Organize tasks by priority",
    icon: <IconTaskList size={20} strokeWidth={1.3} />,
    defaultTitle: "To-Do List",
    content: `<h2>High Priority</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Important task</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p></p></div></li></ul><h2>Medium Priority</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p></p></div></li></ul><h2>Low Priority</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p></p></div></li></ul><hr><h2>Done</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox"></label><div><p></p></div></li></ul>`,
  },
];

interface TemplatePickerProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
}

export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-[560px] max-h-[520px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <h2 className="font-serif italic text-xl font-light" style={{ color: "var(--text-primary)" }}>
              New Page
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>Choose a template or start blank</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center cursor-default"
            style={{ color: "var(--text-muted)" }}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => onSelect(tmpl)}
                className="text-left p-4 rounded-2xl transition-all duration-100 cursor-default group"
                style={{ border: "1px solid var(--border-color)" }}
              >
                <span
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                    display: "flex",
                  }}
                >
                  {tmpl.icon}
                </span>
                <div className="text-[14px] font-light" style={{ color: "var(--text-primary)" }}>
                  {tmpl.name}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {tmpl.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { templates };
