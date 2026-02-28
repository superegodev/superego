import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const narrowContainerWidth = "45rem";

export const ConversationMessages = {
  root: style({
    width: "100%",
    containerType: "inline-size",
  }),
};

export const ThinkingMessage = {
  root: style({
    display: "flex",
    alignItems: "center",
    width: "100%",
  }),

  spinner: style({
    width: "auto",
    height: vars.spacing._4,
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
    textAlign: "start",
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

export const ErrorMessage = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),

  message: style({
    display: "flex",
    alignItems: "center",
    fontSize: vars.typography.fontSizes.md,
    fontWeight: vars.typography.fontWeights.medium,
    color: vars.colors.semantic.error.text,
    gap: vars.spacing._2,
  }),

  retryButton: style({
    fontSize: vars.typography.fontSizes.lg,
    color: vars.colors.semantic.error.text,
    selectors: {
      "&:hover": {
        color: vars.colors.semantic.error.text,
      },
    },
  }),

  disclosurePanel: style({
    selectors: {
      '&[aria-hidden="false"]': {
        border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
        borderRadius: vars.borders.radius.md,
      },
    },
  }),
};
