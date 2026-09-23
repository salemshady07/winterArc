/**
 * The visual themes available in PullUp Reminder.
 * Each theme maps 1:1 to a `[data-theme="<id>"]` block in globals.css.
 * Swatches are used to paint the mini previews in the theme picker.
 */
export interface AppTheme {
  id: string;
  name: string;
  blurb: string;
  swatch: {
    bg: string;
    card: string;
    primary: string;
    ink: string;
  };
}

export const THEMES: AppTheme[] = [
  {
    id: "volt",
    name: "Volt",
    blurb: "Electric lime on deep forest",
    swatch: { bg: "#07100b", card: "#101a13", primary: "#b8f34a", ink: "#101410" },
  },
  {
    id: "daybreak",
    name: "Daybreak",
    blurb: "Soft paper, garden green",
    swatch: { bg: "#edf0e8", card: "#ffffff", primary: "#4d7c0f", ink: "#f4fbe4" },
  },
  {
    id: "abyss",
    name: "Abyss",
    blurb: "Glacial cyan on midnight blue",
    swatch: { bg: "#051019", card: "#0b1a26", primary: "#58d5ff", ink: "#03202c" },
  },
  {
    id: "ember",
    name: "Ember",
    blurb: "Molten amber on charred wood",
    swatch: { bg: "#140a05", card: "#20110a", primary: "#ffb03a", ink: "#241203" },
  },
  {
    id: "ultraviolet",
    name: "Ultraviolet",
    blurb: "Neon violet on deep space",
    swatch: { bg: "#0c0718", card: "#160f27", primary: "#b98cff", ink: "#1d0d38" },
  },
  {
    id: "bloom",
    name: "Bloom",
    blurb: "Wild rose on plum noir",
    swatch: { bg: "#160711", card: "#220d19", primary: "#ff7ea8", ink: "#300a1c" },
  },
];

export const DEFAULT_THEME = "volt";
export const THEME_STORAGE_KEY = "pullup-theme";

export function isThemeId(value: unknown): value is string {
  return (
    typeof value === "string" && THEMES.some((theme) => theme.id === value)
  );
}
