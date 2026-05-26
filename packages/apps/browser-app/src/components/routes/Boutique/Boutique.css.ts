import { globalStyle, style } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../../themes.css.js";

export const Boutique = {
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
