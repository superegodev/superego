import { globalStyle, style } from "@vanilla-extract/css";
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

export const AssistantContentMessage = {
  root: style({
    width: "100%",
    marginBlockStart: vars.spacing._8,
    marginBlockEnd: 0,
  }),

  markdown: style({
    width: "100%",
    fontSize: vars.typography.fontSizes.sm,
    lineHeight: vars.spacing._6,
  }),

  markdownTableScroller: style({
    width: "100%",
    maxHeight: vars.spacing._80,
    overflowY: "auto",
    position: "relative",
    marginBlock: vars.spacing._4,
  }),

  infoAndActions: style({
    display: "flex",
    alignItems: "center",
    marginBlockStart: vars.spacing._4,
    fontSize: vars.typography.fontSizes.xs,
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
    },
  }),

  infoAndActionsSeparator: style({
    background: vars.colors.border.default,
    height: vars.spacing._4,
    width: vars.borders.width.thin,
    marginInline: vars.spacing._2,
  }),

  infoAndActionsAction: style({
    color: vars.colors.text.secondary,
  }),
};

// Styles for markdown elements
globalStyle(
  `${AssistantContentMessage.markdown} ol, ${AssistantContentMessage.markdown} ul`,
  {
    paddingInlineStart: vars.spacing._8,
    lineHeight: vars.spacing._4_5,
  },
);
globalStyle(`${AssistantContentMessage.markdown} li`, {
  marginBlockEnd: vars.spacing._2,
});
globalStyle(`${AssistantContentMessage.markdown} table`, {
  width: "100%",
  borderCollapse: "collapse",
  borderSpacing: 0,
  marginBlock: 0,
  lineHeight: vars.spacing._4_5,
});
globalStyle(`${AssistantContentMessage.markdown} thead th`, {
  paddingInline: vars.spacing._2,
  paddingBlock: vars.spacing._3,
  textAlign: "left",
  fontWeight: vars.typography.fontWeights.medium,
  fontSize: vars.typography.fontSizes.sm,
  background: vars.colors.background.surface,
  position: "sticky",
  top: 0,
  zIndex: 1,
});
globalStyle(`${AssistantContentMessage.markdown} tbody tr`, {
  borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
});
globalStyle(`${AssistantContentMessage.markdown} tbody tr:hover`, {
  background: vars.colors.background.surfaceHighlight,
});
globalStyle(`${AssistantContentMessage.markdown} tbody td`, {
  padding: vars.spacing._2,
  fontSize: vars.typography.fontSizes.sm,
  verticalAlign: "middle",
});
