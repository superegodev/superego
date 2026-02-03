import { themes } from "@superego/themes";

const { vars } = themes;

export default {
  typography: {
    fontSizes: vars.typography.fontSizes,
    fontFamilies: vars.typography.fontFamilies,
  },

  spacing: {
    _4: vars.spacing._4,
  },

  borders: {
    radius: {
      none: vars.borders.radius.none,
      md: vars.borders.radius.md,
    },
    width: vars.borders.width,
  },

  colors: {
    reds: vars.colors.reds,
    yellows: vars.colors.yellows,
    oranges: vars.colors.oranges,
    teals: vars.colors.teals,
    greens: vars.colors.greens,
    blues: vars.colors.blues,
    cyans: vars.colors.cyans,
    violets: vars.colors.violets,
    pinks: vars.colors.pinks,
    semantic: vars.colors.semantic,
    text: vars.colors.text,
    background: vars.colors.background,
    border: vars.colors.border,
  },
};
