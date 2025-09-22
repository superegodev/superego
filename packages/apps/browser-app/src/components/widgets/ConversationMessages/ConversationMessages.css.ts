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

export const ErrorMessage = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),

  message: style({
    display: "flex",
    alignItems: "center",
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.medium,
    color: vars.colors.semantic.error.text,
    gap: vars.spacing._2,
  }),

  retryButton: style({
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.semantic.error.text,
    selectors: {
      "&:hover": {
        color: vars.colors.semantic.error.text,
      },
    },
  }),
};

export const UserMessage = {
  root: style({
    background: vars.colors.background.surfaceHighlight,
    borderRadius: vars.borders.radius.xl,
    padding: vars.spacing._4,
    marginBlock: vars.spacing._4,
    fontSize: vars.typography.fontSizes.sm,
    position: "relative",
    "@container": {
      [`(min-width: ${narrowContainerWidth})`]: {
        marginInlineStart: "40%",
      },
    },
  }),

  playPauseButton: style({
    position: "absolute",
    right: vars.spacing._2,
    bottom: `calc(-1 * ${vars.spacing._2})`,
    borderRadius: "50%",
  }),
};
