import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";
import { HEADING_HEIGHT, ROW_HEIGHT } from "./constants.js";

export const Table = {
  root: style({
    width: "100%",
    overflow: "auto",
  }),
};

const columnTitleBase = style({
  width: "100%",
  textWrap: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});
export const Column = {
  root: style({
    height: HEADING_HEIGHT,
    paddingInline: vars.spacing._2,
    fontWeight: vars.typography.fontWeights.medium,
    fontSize: vars.typography.fontSizes.md,
    background: vars.colors.background.surface,
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
    selectors: {
      '&[data-allows-sorting="true"]': {
        cursor: "pointer",
      },
    },
  }),

  title: styleVariants({
    left: [columnTitleBase, { textAlign: "left" }],
    center: [columnTitleBase, { textAlign: "center" }],
    right: [columnTitleBase, { textAlign: "right" }],
  }),

  sortIndicator: style({
    flexShrink: 0,
    position: "relative",
    // Pixel adjustment to align the icon.
    top: "2.5px",
  }),
};

export const Row = {
  root: style({
    selectors: {
      "&:hover": {
        background: vars.colors.background.surfaceHighlight,
      },
      "&[data-href]": {
        cursor: "pointer",
      },
    },
  }),
};

const cellRootBase = style({
  height: ROW_HEIGHT,
  padding: vars.spacing._2_5,
  lineHeight: "normal",
  borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  fontSize: vars.typography.fontSizes.md,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
});
export const Cell = {
  root: styleVariants({
    left: [cellRootBase, { textAlign: "left" }],
    center: [cellRootBase, { textAlign: "center" }],
    right: [cellRootBase, { textAlign: "right" }],
  }),
};

export const Empty = {
  root: style({
    display: "block",
    textAlign: "center",
    paddingInline: vars.spacing._2,
    paddingBlock: vars.spacing._8,
    fontSize: vars.typography.fontSizes.md,
  }),
};
