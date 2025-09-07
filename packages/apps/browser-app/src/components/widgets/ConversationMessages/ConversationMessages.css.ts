import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const ConversationMessages = {
  root: style({
    width: "100%",
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
    marginInlineStart: "40%",
    marginBlock: vars.spacing._8,
    fontSize: vars.typography.fontSizes.sm,
    position: "relative",
  }),

  playPauseButton: style({
    position: "absolute",
    right: `calc(-1 * ${vars.spacing._2})`,
    bottom: `calc(-1 * ${vars.spacing._2})`,
    borderRadius: "50%",
  }),
};

export const AssistantContentMessage = {
  root: style({
    marginBlock: vars.spacing._8,
  }),

  playPauseButton: style({
    display: "block",
    marginBlockStart: vars.spacing._2,
    opacity: 0,
    transition: "opacity 500ms",
    transitionDelay: "100ms",
    selectors: {
      "div:hover > &": {
        opacity: 1,
      },
      "&:focus": {
        opacity: 1,
      },
    },
  }),
};
