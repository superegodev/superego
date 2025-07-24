import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const TypescriptModuleInput = {
  root: style({
    position: "relative",
    marginBlockEnd: vars.spacing._2,
    cursor: "text",
    selectors: {
      "&::before": {
        content: "",
        pointerEvents: "none",
        zIndex: 9,
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
        borderRadius: vars.borders.radius.md,
      },
      '&[aria-invalid="true"]::before': {
        borderColor: vars.colors.semantic.error.border,
      },
    },
  }),
};

const codeLineHeight = 21;
export const ReadOnly = {
  root: style({
    display: "grid",
    gridTemplateAreas: `"LineNumbers Code"`,
    gridTemplateColumns: "51px 1fr",
    fontSize: vars.typography.fontSizes.sm,
    paddingBlockStart: 10,
    paddingBlockEnd: 8,
    paddingInlineEnd: vars.spacing._4,
    overflow: "hidden",
  }),
  lineNumbers: style({
    gridArea: "LineNumbers",
    display: "flex",
    flexDirection: "column",
  }),
  lineNumber: style({
    textAlign: "right",
    flexShrink: 0,
    height: codeLineHeight,
    paddingInlineEnd: 26,
    fontFamily: vars.typography.fontFamilies.monospace,
    color: "#237893",
  }),
  code: style({
    gridArea: "Code",
    overflow: "scroll",
  }),
};
globalStyle(`${ReadOnly.code} > br`, {
  display: "none",
});
globalStyle(`${ReadOnly.code} > span`, {
  display: "block",
  height: codeLineHeight,
});
globalStyle(`[aria-disabled="true"] > ${ReadOnly.root} *`, {
  color: `${vars.colors.text.secondary}`,
});
