import { motion } from "framer-motion";

interface EmptyStateProps {
  onCreate: () => void;
}

export default function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex-1 h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
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
          className="px-6 py-2.5 text-[13px] rounded-lg transition-all duration-300 cursor-default"
          style={{
            border: "1px solid var(--border-color)",
            color: "var(--text-secondary)",
          }}
        >
          Create first page
        </button>
      </motion.div>
    </div>
  );
}
