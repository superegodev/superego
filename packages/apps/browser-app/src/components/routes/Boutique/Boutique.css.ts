import { globalStyle, style } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../../themes.css.js";

export const Boutique = {
  pageDropZone: style({
    display: "contents",
  }),

  dropZoneHint: style({
    padding: vars.spacing._6,
    border: `${vars.borders.width.medium} dashed ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.lg,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: vars.colors.text.secondary,
    selectors: {
      "[data-drop-target] &": {
        borderColor: vars.colors.border.focus,
      },
    },
  }),

  packMpk: style({
    fontFamily: vars.typography.fontFamilies.monospace,
    borderRadius: vars.borders.radius.md,
    marginInline: vars.spacing._2,
    color: vars.colors.text.primary,
  }),

  boutiqueHeading: style({
    fontWeight: vars.typography.fontWeights.regular,
    fontSize: vars.typography.fontSizes.md,
    marginBlockStart: vars.spacing._6,
    marginBlockEnd: vars.spacing._4,
  }),

  grid: style({
    display: "grid",
    gap: vars.spacing._4,
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    "@media": {
      [`(max-width: ${breakpoints.medium})`]: {
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      },
      [`(max-width: ${breakpoints.small})`]: {
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      },
    },
  }),
};

export const Explainer = {
  root: style({
    marginBlockEnd: vars.spacing._8,
    fontSize: vars.typography.fontSizes.md,
    lineHeight: vars.typography.lineHeights.relaxed,
  }),
};

globalStyle(`${Explainer.root} p:first-child`, {
  marginBlockStart: 0,
});
