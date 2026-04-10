import { motion } from "framer-motion";
import { useTheme } from "../lib/theme";
import { IconX, IconSun, IconMoon, IconPalette } from "./Icons";

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
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-[480px] max-h-[600px] overflow-y-auto rounded-2xl"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            >
              <IconPalette size={16} />
            </span>
            <h2 className="font-serif italic text-xl font-light" style={{ color: "var(--text-primary)" }}>
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-default"
            style={{ color: "var(--text-muted)" }}
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="p-6 space-y-7">
          {/* Appearance */}
          <Section title="APPEARANCE">
            <SettingRow label="Theme">
              <div className="flex gap-2">
                <ThemeButton
                  icon={<IconMoon size={14} />}
                  label="Dark"
                  active={settings.theme === "dark"}
                  onClick={() => updateSettings({ theme: "dark" })}
                />
                <ThemeButton
                  icon={<IconSun size={14} />}
                  label="Light"
                  active={settings.theme === "light"}
                  onClick={() => updateSettings({ theme: "light" })}
                />
              </div>
            </SettingRow>

            <SettingRow label="Font Size">
              <div className="flex gap-1.5">
                {(["small", "medium", "large"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className="px-3 py-1.5 text-[12px] rounded-lg border transition-all cursor-default capitalize"
                    style={{
                      borderColor: settings.fontSize === size ? "#10b981" : "var(--border-color)",
                      color: settings.fontSize === size ? "#10b981" : "var(--text-secondary)",
                      backgroundColor: settings.fontSize === size ? "rgba(16,185,129,0.06)" : "transparent",
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
                    className="px-3 py-1.5 text-[12px] rounded-lg border transition-all cursor-default capitalize"
                    style={{
                      borderColor: settings.editorWidth === w ? "#10b981" : "var(--border-color)",
                      color: settings.editorWidth === w ? "#10b981" : "var(--text-secondary)",
                      backgroundColor: settings.editorWidth === w ? "rgba(16,185,129,0.06)" : "transparent",
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
            <div className="text-[13px] space-y-2" style={{ color: "var(--text-muted)" }}>
              <p><span style={{ color: "var(--text-primary)" }} className="font-serif italic">Scaled.</span> <span className="text-[11px] font-mono">v0.3.0</span></p>
              <p>Built by ScaledByMika</p>
              <p className="font-serif italic text-[14px]" style={{ color: "var(--text-secondary)" }}>
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
      <p className="text-[10px] tracking-[0.12em] uppercase font-medium mb-4" style={{ color: "var(--text-muted)" }}>
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
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-default"
      style={{
        borderColor: active ? "#10b981" : "var(--border-color)",
        backgroundColor: active ? "rgba(16,185,129,0.06)" : "transparent",
        color: active ? "#10b981" : "var(--text-secondary)",
      }}
    >
      {icon}
      <span className="text-[12px]">{label}</span>
    </button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-10 h-[22px] rounded-full transition-all duration-200 cursor-default relative"
      style={{
        backgroundColor: value ? "#10b981" : "var(--bg-tertiary)",
      }}
    >
      <motion.div
        className="w-[18px] h-[18px] rounded-full bg-white absolute top-[2px]"
        animate={{ left: value ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
      />
    </button>
  );
}
