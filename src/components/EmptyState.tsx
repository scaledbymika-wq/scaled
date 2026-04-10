import { motion } from "framer-motion";
import { IconPlus, IconSparkle } from "./Icons";

interface EmptyStateProps {
  onCreate: () => void;
}

export default function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex-1 h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border-color)",
            color: "var(--text-muted)",
          }}
        >
          <IconSparkle size={28} strokeWidth={1.2} />
        </motion.div>

        <h2
          className="font-serif italic text-4xl font-light mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Quiet Ambition.
        </h2>
        <p className="text-sm font-light mb-10" style={{ color: "var(--text-muted)" }}>
          Your space to think, write, and build.
        </p>
        <button
          onClick={onCreate}
          className="px-6 py-2.5 text-[13px] rounded-xl transition-all duration-300 cursor-default flex items-center gap-2 mx-auto"
          style={{
            border: "1px solid var(--border-color)",
            color: "var(--text-secondary)",
          }}
        >
          <IconPlus size={14} />
          <span>Create first page</span>
        </button>
      </motion.div>
    </div>
  );
}
