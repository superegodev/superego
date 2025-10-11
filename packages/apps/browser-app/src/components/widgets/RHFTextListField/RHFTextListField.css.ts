import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFTextListField = {
  root: style({
    marginBlockEnd: vars.spacing._6,
  }),

  emptyItemsAddButton: style({
    width: "100%",
    // Pixel adjustment to make it the same height as the text field.
    height: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin} + 0.5px)`,
    marginBlockEnd: vars.spacing._2,
  }),

  item: style({
    position: "relative",
  }),

  itemTextField: style({
    marginBlockEnd: 0,
  }),

  itemRemoveButton: style({
    position: "absolute",
    top: `calc(${vars.spacing._1} + ${vars.borders.width.thin})`,
    left: `calc(-1 * ${vars.spacing._8})`,
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.secondary,
    opacity: 0,
    selectors: {
      "&:hover": {
        color: vars.colors.text.secondary,
      },
      ":hover > &": {
        opacity: 1,
        transition: "opacity 300ms ease",
      },
      ":has(:focus) > &": {
        opacity: 1,
      },
    },
  }),
};
