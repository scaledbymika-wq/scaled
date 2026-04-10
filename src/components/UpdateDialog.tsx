import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Update, checkForUpdate, downloadAndInstall } from "../lib/updater";

export default function UpdateDialog() {
  const [update, setUpdate] = useState<Update | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const doCheck = useCallback(async () => {
    const result = await checkForUpdate();
    setUpdate(result);
  }, []);

  useEffect(() => {
    // Check for updates 2 seconds after app starts
    const timer = setTimeout(doCheck, 2000);
    return () => clearTimeout(timer);
  }, [doCheck]);

  const handleInstall = async () => {
    if (!update) return;
    setDownloading(true);
    try {
      await downloadAndInstall(update, setProgress);
    } catch {
      setDownloading(false);
    }
  };

  const show = !dismissed && update !== null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 w-[320px] rounded-xl overflow-hidden z-[9999]"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow)",
          }}
        >
          {/* Header */}
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                {"\u2728"}
              </span>
              <div>
                <h3
                  className="font-serif italic text-[16px] font-light"
                  style={{ color: "var(--text-primary)" }}
                >
                  Update verfügbar
                </h3>
                <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                  Version {update?.version}
                </p>
              </div>
            </div>

            {update?.body && (
              <p
                className="text-[13px] font-light mb-4 leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {update.body}
              </p>
            )}

            {downloading ? (
              <div>
                <div
                  className="h-1.5 rounded-full overflow-hidden mb-2"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#10b981" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                  Downloading... {progress}%
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2.5 px-4 text-[13px] font-light rounded-lg transition-all duration-200 cursor-default"
                  style={{
                    backgroundColor: "#10b981",
                    color: "#000",
                  }}
                >
                  Jetzt updaten
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="py-2.5 px-4 text-[13px] font-light rounded-lg transition-all duration-200 cursor-default"
                  style={{
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Später
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
