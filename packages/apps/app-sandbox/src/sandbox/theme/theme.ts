import { themes } from "@superego/themes";

export default {
  typography: {
    fontSizes: themes.commonVars.typography.fontSizes,
    fontFamilies: themes.commonVars.typography.fontFamilies,
  },

  spacing: {
    // Use multiples with calc for other spacing values
    _4: "1rem",
  },

  borders: {
    radius: {
      none: themes.commonVars.borders.radius.none,
      md: themes.commonVars.borders.radius.md,
    },
    width: themes.commonVars.borders,
  },

  colors: {
    reds: themes.colors.reds,
    yellows: themes.colors.yellows,
    oranges: themes.colors.oranges,
    teals: themes.colors.teals,
    greens: themes.colors.greens,
    blues: themes.colors.blues,
    cyans: themes.colors.cyans,
    violets: themes.colors.violets,
    pinks: themes.colors.pinks,
  },
};
