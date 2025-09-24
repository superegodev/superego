import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const codeLineHeight = 21;

// TODO: cursor: text?
export const EagerCodeBlock = {
  root: style({
    display: "grid",
    gridTemplateAreas: `"LineNumbers Code"`,
    gridTemplateColumns: "51px 1fr",
    fontSize: vars.typography.fontSizes.sm,
    paddingBlockStart: 10,
    paddingBlockEnd: 8,
    paddingInlineEnd: vars.spacing._4,
    maxHeight: vars.spacing._64,
    width: "100%",
    overflowY: "scroll",
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
    paddingInlineEnd: vars.spacing._4,
    fontFamily: vars.typography.fontFamilies.monospace,
    color: "#237893",
  }),

  code: style({
    gridArea: "Code",
    overflowX: "scroll",
  }),
};

globalStyle(`${EagerCodeBlock.code} > br`, {
  display: "none",
});

globalStyle(`${EagerCodeBlock.code} > span`, {
  display: "block",
  height: codeLineHeight,
});

globalStyle(`[aria-disabled="true"] > ${EagerCodeBlock.root} *`, {
  color: `${vars.colors.text.secondary}`,
});

export const CopyButton = {
  root: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._1,
    paddingBlock: 0,
    paddingInline: vars.spacing._1,
    position: "sticky",
    top: 0,
    right: 0,
    gridArea: "Code",
    alignSelf: "start",
    justifySelf: "end",
    zIndex: 1,
    backdropFilter: "blur(9999px)",
    fontSize: vars.typography.fontSizes.xs,
    selectors: {
      "&:hover": {
        background: "transparent",
      },
    },
  }),
};
