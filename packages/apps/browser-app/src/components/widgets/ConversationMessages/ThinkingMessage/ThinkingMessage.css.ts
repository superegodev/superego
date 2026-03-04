import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const ThinkingMessageContent = {
  root: style({
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: vars.spacing._4,
  }),

  header: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
  }),

  reasoningTrace: style({
    fontSize: vars.typography.fontSizes.sm,
    color: vars.colors.text.secondary,
    fontStyle: "italic",
    display: "-webkit-box",
    WebkitLineClamp: 10,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  }),

  spinner: style({
    width: "auto",
    height: vars.spacing._4,
    flexShrink: 0,
  }),

  summary: style({
    fontSize: vars.typography.fontSizes.sm,
    color: vars.colors.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
};
