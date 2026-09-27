export const defaultTheme = {
  bg: "#0e1116",
  panelBg: "#12161d",
  border: "#2a313c",
  borderFocus: "#4c8fd6",
  text: "#d5dae2",
  textDim: "#7c8696",
  accent: "#e0af68",
  statusBg: "#171c24",
  error: "#FF0E0E",
};

export type Theme = { [K in keyof typeof defaultTheme]: string };

// Shared object read by every component. Overridden from the user config at
// startup via applyTheme, before the first render.
export const theme: Theme = { ...defaultTheme };

export function applyTheme(overrides: Theme) {
  Object.assign(theme, overrides);
}

export const borderStyle = "single" as const;
