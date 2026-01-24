import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";
import { narrowContainerWidth } from "../ConversationMessages.css.js";

export const UserMessage = {
  root: style({
    marginBlockStart: vars.spacing._4,
    position: "relative",
    "@container": {
      [`(min-width: ${narrowContainerWidth})`]: {
        marginInlineStart: "25%",
      },
    },
  }),

  markdown: style({
    background: vars.colors.background.surfaceHighlight,
    borderRadius: vars.borders.radius.xl,
    padding: vars.spacing._4,
    marginBlockEnd: vars.spacing._0_5,
  }),

  actions: style({
    display: "flex",
    justifyContent: "end",
    opacity: 0,
    transition: "opacity 500ms",
    transitionDelay: "100ms",
    color: vars.colors.text.secondary,
    selectors: {
      "div:hover > &": {
        opacity: 1,
      },
      "&:has(:focus)": {
        opacity: 1,
      },
    },
  }),

  action: style({
    fontSize: vars.typography.fontSizes.sm,
    padding: 0,
    width: vars.spacing._6,
    height: vars.spacing._6,
  }),
};

export const FileParts = {
  root: style({
    width: "100%",
    display: "flex",
    justifyContent: "end",
    flexWrap: "wrap",
    gap: vars.spacing._1,
    marginBlockEnd: `calc(-1 * ${vars.spacing._2})`,
  }),
};

export const FilePart = {
  root: style({
    width: vars.spacing._36,
    height: vars.spacing._36,
    padding: 0,
    background: vars.colors.background.secondarySurface,
    borderRadius: vars.borders.radius.md,
    border: 0,
    overflow: "hidden",
    selectors: {
      "&:hover": {
        border: 0,
      },
    },
  }),

  image: style({
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }),

  file: style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: vars.spacing._2,
  }),

  iconContainer: style({
    display: "flex",
    alignItems: "center",
    fontSize: vars.typography.fontSizes.xl4,
  }),

  nameContainer: style({
    justifySelf: "flex-end",
    paddingInline: vars.spacing._4,
    overflowWrap: "anywhere",
    width: "100%",
    fontSize: vars.typography.fontSizes.sm,
  }),
};
