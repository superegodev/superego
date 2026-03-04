import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const ModelActionMenu = {
  menuItem: style({
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: vars.spacing._2,
  }),

  modelName: style({
    overflow: "hidden",
    textOverflow: "ellipsis",
    textWrap: "nowrap",
    flexShrink: 0,
  }),

  modelDescription: style({
    flexGrow: 1,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
    textAlign: "left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textWrap: "nowrap",
  }),
};
