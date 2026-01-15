import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Markdown = {
  root: style({
    width: "100%",
    fontSize: vars.typography.fontSizes.md,
    lineHeight: vars.spacing._6,
  }),

  tableScroller: style({
    width: "100%",
    maxHeight: vars.spacing._80,
    overflow: "auto",
    position: "relative",
    marginBlock: vars.spacing._4,
  }),
};

globalStyle(`${Markdown.root} > *:first-child`, {
  marginBlockStart: 0,
});
globalStyle(`${Markdown.root} > *:last-child`, {
  marginBlockEnd: 0,
});
globalStyle(`${Markdown.root} ol, ${Markdown.root} ul`, {
  paddingInlineStart: vars.spacing._8,
  lineHeight: vars.spacing._4_5,
});
globalStyle(`${Markdown.root} li`, {
  marginBlockEnd: vars.spacing._2,
});
globalStyle(`${Markdown.root} table`, {
  width: "100%",
  borderCollapse: "collapse",
  borderSpacing: 0,
  marginBlock: 0,
  lineHeight: vars.spacing._4_5,
});
globalStyle(`${Markdown.root} thead th`, {
  paddingInline: vars.spacing._2,
  paddingBlock: vars.spacing._3,
  textAlign: "left",
  fontWeight: vars.typography.fontWeights.medium,
  fontSize: vars.typography.fontSizes.md,
  background: vars.colors.background.surface,
  position: "sticky",
  top: 0,
  zIndex: 1,
});
globalStyle(`${Markdown.root} tbody tr`, {
  borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
});
globalStyle(`${Markdown.root} tbody tr:hover`, {
  background: vars.colors.background.surfaceHighlight,
});
globalStyle(`${Markdown.root} tbody td`, {
  padding: vars.spacing._2,
  fontSize: vars.typography.fontSizes.md,
  verticalAlign: "middle",
});
