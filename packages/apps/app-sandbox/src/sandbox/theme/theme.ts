import { themes } from "@superego/themes";

export default {
  typography: {
    // TODO: as demonstrated by this mapping, font sizes need a refactor.
    fontSizes: {
      xs: themes.commonVars.typography.fontSizes.xs2,
      sm: themes.commonVars.typography.fontSizes.xs,
      md: themes.commonVars.typography.fontSizes.sm,
      lg: themes.commonVars.typography.fontSizes.md,
      xl: themes.commonVars.typography.fontSizes.lg,
    },
    fontFamilies: {
      sansSerif: themes.commonVars.typography.fontFamilies.sansSerif,
      serif: themes.commonVars.typography.fontFamilies.serif,
      monospace: themes.commonVars.typography.fontFamilies.monospace,
    },
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
