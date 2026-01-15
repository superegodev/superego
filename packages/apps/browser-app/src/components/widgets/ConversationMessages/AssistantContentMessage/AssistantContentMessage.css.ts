import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const AssistantContentMessage = {
  root: style({
    width: "100%",
    marginBlockStart: vars.spacing._8,
    marginBlockEnd: 0,
  }),

  infoAndActions: style({
    display: "flex",
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
    },
  }),

  infoAndActionsSeparator: style({
    background: vars.colors.border.default,
    height: vars.spacing._4,
    width: vars.borders.width.thin,
    marginInline: vars.spacing._2,
  }),

  infoAndActionsAction: style({
    padding: 0,
    width: vars.spacing._6,
    height: vars.spacing._6,
    color: vars.colors.text.secondary,
  }),
};
