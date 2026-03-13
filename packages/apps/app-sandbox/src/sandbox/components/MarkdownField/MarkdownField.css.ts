import { style } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

export const MarkdownField = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
  }),
};

export const MarkdownInput = {
  root: style({
    width: "100%",
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    overflow: "auto",
    background: vars.colors.background.surface,
    selectors: {
      '&[data-has-focus="true"][data-focus-visible="true"]': {
        outline: `2px solid ${vars.colors.accent}`,
        outlineOffset: "-1px",
      },
    },
  }),
};

export const FormattingToolbar = {
  root: style({
    position: "sticky",
    top: 0,
    zIndex: 2,
    width: "100%",
    overflow: "auto",
    display: "flex",
    gap: vars.spacing._2,
    paddingInline: vars.spacing._4,
    paddingBlockStart: vars.spacing._4,
    paddingBlockEnd: vars.spacing._2,
    background: `linear-gradient(180deg, ${vars.colors.background.surface} 0%, ${vars.colors.background.surface} 90%, rgb(from ${vars.colors.background.surface} r g b / 0) 100%)`,
  }),

  group: style({
    display: "flex",
    gap: vars.spacing._0_5,
  }),

  separator: style({
    alignSelf: "stretch",
    background: vars.colors.border.default,
    width: vars.borders.width.thin,
  }),

  toggleButton: style({
    fontSize: vars.typography.fontSizes.xl,
  }),
};
