import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Table = {
  root: style({
    width: "100%",
    overflow: "scroll",
  }),
};

export const Header = {
  root: style({}),
};

export const Body = {
  root: style({}),
};

const columnRootBase = style({
  paddingInline: vars.spacing._2,
  paddingBlock: vars.spacing._3,
  fontWeight: vars.typography.fontWeights.medium,
  fontSize: vars.typography.fontSizes.sm,
  background: vars.colors.background.surface,
  borderBlockEnd: `${vars.borders.width.thick} solid ${vars.colors.border.default}`,
  textWrap: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
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
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
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
  padding: vars.spacing._2,
  fontSize: vars.typography.fontSizes.sm,
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
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    fontSize: vars.typography.fontSizes.sm,
  }),
};
