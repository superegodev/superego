import { createTheme } from "@vanilla-extract/css";

const commonVars = {
  typography: {
    fontSizes: {
      xs2: "0.70rem",
      xs: "0.80rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      xl2: "1.5rem",
      xl3: "1.875rem",
      xl4: "2.25rem",
    },
    fontWeights: {
      light: "300",
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeights: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2",
    },
    fontFamilies: {
      sansSerif: `
        system-ui,          /* 1. OS Default UI Font (Modern Standard) */
        -apple-system,      /* 2. Apple (Safari macOS/iOS) */
        BlinkMacSystemFont, /* 3. Apple (Chrome macOS/iOS) */
        "Segoe UI",         /* 4. Windows */
        Roboto,             /* 5. Android / Chrome OS */
        "Noto Sans",        /* 6. Linux (Google, General Fallback) */
        Ubuntu,             /* 7. Linux (Ubuntu) */
        Cantarell,          /* 8. Linux (GNOME) */
        "Fira Sans",        /* 9. Linux (Mozilla, General) */
        "Droid Sans",       /* 10. Linux/Android (Older) */
        "Oxygen-Sans",      /* 11. Linux (KDE) */
        "Helvetica Neue",   /* 12. Fallback (High Quality) */
        Arial,              /* 13. Fallback (Ubiquitous) */
        sans-serif          /* 14. Generic CSS Fallback */
      `,
      monospace: `
        ui-monospace,     /* 1. OS Default UI Monospace (Modern Standard) */
        Menlo,            /* 2. Apple (macOS Newer) */
        Monaco,           /* 3. Apple (macOS Older) */
        "Cascadia Code",  /* 4a. Windows (Newer, Code-focused) */
        "Segoe UI Mono",  /* 4b. Windows (UI Companion) */
        "Roboto Mono",    /* 5. Android / Chrome OS */
        "Noto Sans Mono", /* 6. Linux (Google, General Fallback) */
        "Ubuntu Mono",    /* 7. Linux (Ubuntu) */
                          /* 8. No standard Cantarell Mono, falls back */
        "Fira Mono",      /* 9. Linux (Mozilla, General) */
        "Droid Sans Mono",/* 10. Linux/Android (Older) */
        "Oxygen Mono",    /* 11. Linux (KDE) */
        "Courier New",    /* 12 + 13. Fallback (Classic/Ubiquitous Mono) */
        monospace         /* 14. Generic CSS Fallback */
      `,
    },
  },
  spacing: {
    _0: "0",
    _05: "0.125rem",
    _1: "0.25rem",
    _2: "0.5rem",
    _3: "0.75rem",
    _4: "1rem",
    _5: "1.25rem",
    _6: "1.5rem",
    _7: "1.75rem",
    _8: "2rem",
    _9: "2.25rem",
    _10: "2.5rem",
    _12: "3rem",
    _16: "4rem",
    _20: "5rem",
    _24: "6rem",
    _32: "8rem",
    _40: "10rem",
    _48: "12rem",
    _64: "16rem",
    _80: "20rem",
    _90: "22.5rem",
    _100: "25rem",
    _120: "30rem",
    _160: "40rem",
    _180: "45rem",
  },
  borders: {
    radius: {
      none: "0",
      sm: "0.125rem",
      md: "0.25rem",
      lg: "0.5rem",
      xl: "0.75rem",
      xl2: "1rem",
      xl3: "1.25rem",
      full: "9999px",
    },
    width: {
      thin: "1px",
      medium: "2px",
      thick: "3px",
    },
  },
};

const colors = {
  greys: {
    _0: "#ffffff",
    _1: "#fafafa",
    _2: "#f5f5f5",
    _3: "#f0f0f0",
    _35: "#e4e4e4",
    _4: "#d9d9d9",
    _5: "#bfbfbf",
    _6: "#8c8c8c",
    _7: "#595959",
    _8: "#434343",
    _85: "#343434",
    _9: "#262626",
    _10: "#1f1f1f",
    _11: "#141414",
    _12: "#000000",
  },

  reds: {
    _1: "#fff5f5",
    _2: "#ffc9c9",
    _3: "#ff8787",
    _4: "#fa5252",
    _5: "#e03131",
  },

  yellows: {
    _1: "#fff9db",
    _2: "#ffec99",
    _3: "#ffd43b",
    _4: "#fab005",
    _5: "#f08c00",
  },

  oranges: {
    _1: "#fff4e6",
    _2: "#ffd8a8",
    _3: "#ffa94d",
    _4: "#fd7e14",
    _5: "#e8590c",
  },

  teals: {
    _1: "#e6fcf5",
    _2: "#96f2d7",
    _3: "#38d9a9",
    _4: "#12b886",
    _5: "#099268",
  },

  greens: {
    _1: "#ebfbee",
    _2: "#b2f2bb",
    _3: "#69db7c",
    _4: "#40c057",
    _5: "#2f9e44",
  },

  blues: {
    _1: "#e7f5ff",
    _2: "#a5d8ff",
    _3: "#4dabf7",
    _4: "#228be6",
    _5: "#1971c2",
  },

  cyans: {
    _1: "#e3fafc",
    _2: "#99e9f2",
    _3: "#3bc9db",
    _4: "#15aabf",
    _5: "#0c8599",
  },

  violets: {
    _1: "#f3f0ff",
    _2: "#d0bfff",
    _3: "#9775fa",
    _4: "#7950f2",
    _5: "#6741d9",
  },

  pinks: {
    _1: "#fff0f6",
    _2: "#fcc2d7",
    _3: "#f783ac",
    _4: "#e64980",
    _5: "#c2255c",
  },
};

export const [light, vars] = createTheme({
  ...commonVars,
  colors: {
    ...colors,
    accent: colors.oranges._4,
    semantic: {
      info: {
        border: colors.blues._5,
        background: colors.blues._1,
        text: colors.blues._5,
      },
      success: {
        border: colors.greens._5,
        background: colors.greens._1,
        text: colors.greens._5,
      },
      pending: {
        border: colors.oranges._5,
        background: colors.oranges._1,
        text: colors.oranges._5,
      },
      error: {
        border: colors.reds._5,
        background: colors.reds._1,
        text: colors.reds._5,
      },
    },
    button: {
      default: {
        base: {
          background: colors.greys._0,
          text: colors.greys._10,
          border: colors.greys._4,
        },
        hover: {
          background: colors.greys._3,
          text: colors.greys._10,
          border: colors.greys._4,
        },
        disabled: {
          background: colors.greys._3,
          text: colors.greys._6,
          border: colors.greys._4,
        },
      },
      primary: {
        base: {
          background: colors.greys._10,
          text: colors.greys._2,
          border: colors.greys._10,
        },
        hover: {
          background: colors.greys._12,
          text: colors.greys._2,
          border: colors.greys._12,
        },
        disabled: {
          background: colors.greys._8,
          text: colors.greys._2,
          border: colors.greys._8,
        },
      },
      invisible: {
        base: {
          background: "none",
          text: colors.greys._10,
          border: "transparent",
        },
        hover: { background: colors.greys._3, text: colors.greys._10 },
        disabled: { background: "none", text: colors.greys._6 },
        selected: {
          background: "none",
          text: colors.greys._10,
          border: colors.greys._5,
        },
      },
      danger: {
        base: {
          background: colors.greys._0,
          text: colors.reds._5,
          border: colors.greys._4,
        },
        hover: {
          background: colors.reds._5,
          text: colors.greys._0,
          border: colors.reds._5,
        },
        disabled: {
          background: colors.greys._0,
          text: colors.greys._6,
          border: colors.greys._4,
        },
      },
    },
    neutral: colors.greys,
    text: {
      primary: colors.greys._10,
      secondary: colors.greys._6,
      inverse: colors.greys._2,
      onAccent: colors.greys._0,
    },
    background: {
      surface: colors.greys._0,
      secondarySurface: colors.greys._1,
      surfaceHighlight: colors.greys._3,
      inverse: colors.greys._10,
      inverseHighlight: colors.greys._8,
    },
    border: {
      default: colors.greys._4,
      strong: colors.greys._5,
      subtle: colors.greys._35,
      focus: colors.greys._7,
      disabled: colors.greys._2,
    },
  },
});

export const dark = createTheme(vars, {
  ...commonVars,
  colors: {
    ...colors,
    accent: colors.oranges._4,
    semantic: {
      info: {
        border: colors.blues._1,
        background: colors.blues._5,
        text: colors.blues._1,
      },
      success: {
        border: colors.greens._1,
        background: colors.greens._5,
        text: colors.greens._1,
      },
      pending: {
        border: colors.oranges._1,
        background: colors.oranges._5,
        text: colors.oranges._1,
      },
      error: {
        border: colors.reds._1,
        background: colors.reds._5,
        text: colors.reds._1,
      },
    },
    button: {
      default: {
        base: {
          background: colors.greys._10,
          text: colors.greys._2,
          border: colors.greys._8,
        },
        hover: {
          background: colors.greys._8,
          text: colors.greys._2,
          border: colors.greys._8,
        },
        disabled: {
          background: colors.greys._8,
          text: colors.greys._6,
          border: colors.greys._8,
        },
      },
      primary: {
        base: {
          background: colors.greys._2,
          text: colors.greys._10,
          border: colors.greys._2,
        },
        hover: {
          background: colors.greys._0,
          text: colors.greys._10,
          border: colors.greys._0,
        },
        disabled: {
          background: colors.greys._4,
          text: colors.greys._10,
          border: colors.greys._4,
        },
      },
      invisible: {
        base: {
          background: "none",
          text: colors.greys._2,
          border: "transparent",
        },
        hover: { background: colors.greys._8, text: colors.greys._2 },
        disabled: { background: "none", text: colors.greys._6 },
        selected: {
          background: colors.greys._2,
          text: colors.greys._10,
          border: colors.greys._7,
        },
      },
      danger: {
        base: {
          background: colors.greys._10,
          text: colors.reds._5,
          border: colors.greys._8,
        },
        hover: {
          background: colors.reds._5,
          text: colors.greys._0,
          border: colors.reds._5,
        },
        disabled: {
          background: colors.greys._8,
          text: colors.greys._6,
          border: colors.greys._8,
        },
      },
    },
    neutral: {
      _0: colors.greys._12,
      _1: colors.greys._11,
      _2: colors.greys._10,
      _3: colors.greys._9,
      _35: colors.greys._85,
      _4: colors.greys._8,
      _5: colors.greys._7,
      _6: colors.greys._6,
      _7: colors.greys._5,
      _8: colors.greys._4,
      _85: colors.greys._35,
      _9: colors.greys._3,
      _10: colors.greys._2,
      _11: colors.greys._1,
      _12: colors.greys._0,
    },
    text: {
      primary: colors.greys._2,
      secondary: colors.greys._6,
      inverse: colors.greys._10,
      onAccent: colors.greys._0,
    },
    background: {
      surface: colors.greys._10,
      secondarySurface: colors.greys._9,
      surfaceHighlight: colors.greys._8,
      inverse: colors.greys._0,
      inverseHighlight: colors.greys._3,
    },
    border: {
      default: colors.greys._8,
      strong: colors.greys._7,
      subtle: colors.greys._9,
      focus: colors.greys._5,
      disabled: colors.greys._10,
    },
  },
});
