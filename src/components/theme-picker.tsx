"use client";

import { motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { THEMES } from "@/lib/themes";
import { Modal } from "@/components/modals";

interface ThemePickerModalProps {
  open: boolean;
  theme: string;
  onClose: () => void;
  onSelect: (themeId: string) => void;
}

export function ThemePickerModal({
  open,
  theme,
  onClose,
  onSelect,
}: ThemePickerModalProps) {
  return (
    <Modal open={open} onClose={onClose} className="theme-modal-shell">
      <div className="modal-icon-circle">
        <Palette size={20} strokeWidth={2.2} />
      </div>
      <h2 className="modal-title font-display">Choose a theme</h2>
      <p className="modal-sub">
        Pick a look that matches your grind. It applies instantly and is saved
        for your next visit.
      </p>

      <div className="theme-grid">
        {THEMES.map((item, index) => {
          const active = item.id === theme;
          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: Math.min(index * 0.045, 0.3),
                duration: 0.3,
                ease: "easeOut",
              }}
              className={active ? "theme-card active" : "theme-card"}
              onClick={() => onSelect(item.id)}
              aria-pressed={active}
              aria-label={`${item.name} theme`}
            >
              <span
                className="theme-preview"
                style={{ background: item.swatch.bg }}
              >
                <span
                  className="theme-preview-card"
                  style={{ background: item.swatch.card }}
                >
                  <span
                    className="theme-preview-dot"
                    style={{ background: item.swatch.primary }}
                  />
                  <span
                    className="theme-preview-line"
                    style={{ background: item.swatch.primary, opacity: 0.55 }}
                  />
                  <span
                    className="theme-preview-line short"
                    style={{ background: item.swatch.primary, opacity: 0.28 }}
                  />
                </span>
              </span>

              <span className="theme-meta">
                <span className="theme-name">{item.name}</span>
                <span className="theme-blurb">{item.blurb}</span>
              </span>

              {active && (
                <span className="theme-check">
                  <Check size={11} strokeWidth={3.4} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="theme-saved-note">
        Themes are stored in the app&apos;s database — your choice follows you.
      </p>
    </Modal>
  );
}
