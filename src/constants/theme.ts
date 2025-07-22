// src/constants/theme.ts

const palette = {
  // Grayscale Palette (inspired by GitHub Dark)
  black: "#010409",
  darkBlue: "#0d1117", // Used as main background
  mediumBlue: "#161b22",
  lightGray: "#30363d", // Used for borders
  lighterGray: "#8b949e",
  white: "#f0f6fc", // Used for main text

  // Accent Colors
  blue: "#58a6ff",
  green: "#34a853",
  red: "#f85149",
  yellow: "#e3b341",

  // Routine Palette
  indigo: "#6366F1",
  purple: "#8B5CF6",
  pink: "#EC4899",
  orange: "#F97316",
  teal: "#14B8A6",
};

export const routineColors = [
  palette.indigo,
  palette.purple,
  palette.pink,
  palette.orange,
  palette.teal,
  palette.blue,
];

export const theme = {
  colors: {
    background: palette.darkBlue,
    text: palette.white,
    primary: palette.blue,
    border: palette.lightGray,

    // Semantic Colors
    success: palette.green,
    danger: palette.red,
    warning: palette.yellow,

    // Grays
    gray: palette.lighterGray,

    // Secondary Backgrounds
    surface: palette.mediumBlue, // For cards, menus, etc.
  },

  typography: {
    fonts: {
      // Define aliases for loaded fonts
      regular: "DMSans-Regular",
      bold: "DMSans-Bold",
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16, // Base size
      lg: 22, // Used in Header
      xl: 28,
    },
  },

  layout: {
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 40,
    },
    headerHeight: 64,
  },
} as const; // 'as const' makes the object readonly and its properties literal types
