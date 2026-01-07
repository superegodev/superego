import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

export const Table = {
  root: style({
    width: "100%",
    borderCollapse: "collapse",
  }),
};

const columnRootBase = style({
  padding: vars.spacing._2,
  fontWeight: vars.typography.fontWeights.medium,
  fontSize: vars.typography.fontSizes.md,
  background: vars.colors.background.surface,
  borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
});
export const Column = {
  root: styleVariants({
    left: [columnRootBase, { textAlign: "left" }],
    center: [columnRootBase, { textAlign: "center" }],
    right: [columnRootBase, { textAlign: "right" }],
  }),
};

export const Row = {
  root: style({
    selectors: {
      "&:hover": {
        background: vars.colors.background.surfaceHighlight,
      },
    },
  }),
};

const cellRootBase = style({
  height: "100%",
  padding: vars.spacing._2,
  borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  fontSize: vars.typography.fontSizes.md,
});
export const Cell = {
  root: styleVariants({
    left: [cellRootBase, { textAlign: "left" }],
    center: [cellRootBase, { textAlign: "center" }],
    right: [cellRootBase, { textAlign: "right" }],
  }),
};
