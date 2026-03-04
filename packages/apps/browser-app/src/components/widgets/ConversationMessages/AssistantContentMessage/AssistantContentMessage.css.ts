import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const AssistantContentMessage = {
  root: style({
    width: "100%",
    marginBlockStart: vars.spacing._8,
    marginBlockEnd: 0,
  }),

  infoAndActions: style({
    display: "flex",
    gap: vars.spacing._2,
    alignItems: "center",
    marginBlockStart: vars.spacing._4,
    fontSize: vars.typography.fontSizes.sm,
    color: vars.colors.text.secondary,
    opacity: 0,
    transition: "opacity 500ms",
    transitionDelay: "100ms",
    selectors: {
      "div:hover > &": {
        opacity: 1,
      },
      "&:has(:focus)": {
        opacity: 1,
      },
      '&:has([aria-expanded="true"])': {
        opacity: 1,
      },
    },
  }),

  infoAndActionsSeparator: style({
    background: vars.colors.border.default,
    height: vars.spacing._4,
    width: vars.borders.width.thin,
    // Adjustment to make the next-child button look correctly spaced. (Else it
    // looks to far due to its internal padding.)
    marginInlineEnd: `calc(-1 * ${vars.spacing._1})`,
    selectors: {
      "&:last-child": {
        display: "none",
      },
    },
  }),

  infoAndActionsAction: style({
    padding: 0,
    width: vars.spacing._6,
    height: vars.spacing._6,
    color: vars.colors.text.secondary,
  }),
};

export const TokenUsage = {
  trigger: style({
    all: "unset",
    cursor: "default",
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
    textUnderlineOffset: vars.spacing._1,
  }),

  tooltip: style({
    padding: vars.spacing._4,
    background: vars.colors.background.surface,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.sm,
    textAlign: "start",
    borderColor: vars.colors.border.default,
    borderWidth: vars.borders.width.thin,
    borderStyle: "solid",
    boxShadow: `0 ${vars.spacing._2} ${vars.spacing._4} rgb(from ${vars.colors.shadow.default} r g b / 0.1)`,
  }),

  title: style({
    margin: 0,
    marginBlockEnd: vars.spacing._3,
    color: vars.colors.text.secondary,
  }),

  statsList: style({
    display: "grid",
    gridTemplateColumns: "auto auto",
    gap: `${vars.spacing._1} ${vars.spacing._2}`,
    margin: 0,
    padding: 0,
  }),

  statsListValue: style({
    margin: 0,
    textAlign: "end",
  }),
};

globalStyle(`${TokenUsage.tooltip} svg`, {
  fill: vars.colors.background.surface,
  stroke: vars.colors.border.default,
  strokeWidth: 1,
});
