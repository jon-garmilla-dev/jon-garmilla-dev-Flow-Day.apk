// src/constants/theme.js

const palette = {
  // Paleta de Grises (inspirada en GitHub Dark)
  black: "#010409",
  darkBlue: "#0d1117", // Usado como fondo principal
  mediumBlue: "#161b22",
  lightGray: "#30363d", // Usado para bordes
  lighterGray: "#8b949e",
  white: "#f0f6fc", // Usado para el texto principal

  // Colores de Acento
  blue: "#58a6ff",
  green: "#34a853",
  red: "#f85149",
  yellow: "#e3b341",

  // Paleta para Rutinas
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

    // Colores semánticos
    success: palette.green,
    danger: palette.red,
    warning: palette.yellow,

    // Grises
    gray: palette.lighterGray,

    // Fondos secundarios
    surface: palette.mediumBlue, // Para tarjetas, menús, etc.
  },

  typography: {
    fonts: {
      // Definimos alias para las fuentes cargadas
      regular: "DMSans-Regular",
      bold: "DMSans-Bold",
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16, // Tamaño base
      lg: 22, // Usado en el Header
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
};
