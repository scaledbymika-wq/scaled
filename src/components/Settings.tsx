import { motion } from "framer-motion";
import { useTheme } from "../lib/theme";

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const { settings, updateSettings } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="w-[480px] max-h-[600px] overflow-y-auto rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-serif italic text-xl font-light" style={{ color: "var(--text-primary)" }}>
              Settings
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-default"
              style={{ color: "var(--text-muted)" }}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Appearance */}
          <Section title="APPEARANCE">
            <SettingRow label="Theme">
              <div className="flex gap-2">
                <ThemeButton
                  label="Dark"
                  active={settings.theme === "dark"}
                  onClick={() => updateSettings({ theme: "dark" })}
                  preview="bg-[#0c0c0c]"
                />
                <ThemeButton
                  label="Light"
                  active={settings.theme === "light"}
                  onClick={() => updateSettings({ theme: "light" })}
                  preview="bg-white"
                />
              </div>
            </SettingRow>

            <SettingRow label="Font Size">
              <div className="flex gap-1.5">
                {(["small", "medium", "large"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className={`px-3 py-1.5 text-[12px] rounded-lg border transition-all cursor-default capitalize ${
                      settings.fontSize === size
                        ? "border-emerald text-emerald"
                        : ""
                    }`}
                    style={{
                      borderColor: settings.fontSize === size ? "#10b981" : "var(--border-color)",
                      color: settings.fontSize === size ? "#10b981" : "var(--text-secondary)",
                      backgroundColor: settings.fontSize === size ? "rgba(16,185,129,0.08)" : "transparent",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </SettingRow>

            <SettingRow label="Editor Width">
              <div className="flex gap-1.5">
                {(["narrow", "normal", "wide"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => updateSettings({ editorWidth: w })}
                    className={`px-3 py-1.5 text-[12px] rounded-lg border transition-all cursor-default capitalize`}
                    style={{
                      borderColor: settings.editorWidth === w ? "#10b981" : "var(--border-color)",
                      color: settings.editorWidth === w ? "#10b981" : "var(--text-secondary)",
                      backgroundColor: settings.editorWidth === w ? "rgba(16,185,129,0.08)" : "transparent",
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </SettingRow>
          </Section>

          {/* Editor */}
          <Section title="EDITOR">
            <SettingRow label="Word Count">
              <Toggle
                value={settings.showWordCount}
                onChange={(v) => updateSettings({ showWordCount: v })}
              />
            </SettingRow>
          </Section>

          {/* About */}
          <Section title="ABOUT">
            <div className="text-[13px] space-y-1" style={{ color: "var(--text-muted)" }}>
              <p><span style={{ color: "var(--text-secondary)" }}>Scaled.</span> v0.1.0</p>
              <p>Built by ScaledByMika</p>
              <p className="font-serif italic" style={{ color: "var(--text-secondary)" }}>
                "Your space to think, write, and build."
              </p>
            </div>
          </Section>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-mono tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-light" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function ThemeButton({
  label,
  active,
  onClick,
  preview,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  preview: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-default`}
      style={{
        borderColor: active ? "#10b981" : "var(--border-color)",
        backgroundColor: active ? "rgba(16,185,129,0.08)" : "transparent",
      }}
    >
      <div className={`w-5 h-5 rounded-md border ${preview}`} style={{ borderColor: "var(--border-strong)" }} />
      <span
        className="text-[12px]"
        style={{ color: active ? "#10b981" : "var(--text-secondary)" }}
      >
        {label}
      </span>
    </button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-[22px] rounded-full transition-all duration-200 cursor-default relative`}
      style={{
        backgroundColor: value ? "#10b981" : "var(--bg-tertiary)",
      }}
    >
      <div
        className="w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-all duration-200"
        style={{
          left: value ? "20px" : "2px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}
