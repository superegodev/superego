import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFTextListField = {
  fields: style({
    gap: vars.spacing._2,
  }),

  emptyItemsPlaceholder: style({
    display: "flex",
    justifyContent: "center",
    height: `calc(${vars.spacing._9} + 1px)`,
    fontSize: vars.typography.fontSizes.md,
    fontStyle: "italic",
    color: vars.colors.text.secondary,
  }),

  item: style({
    position: "relative",
    marginInlineEnd: vars.spacing._9,
  }),

  itemTextField: style({
    marginBlockEnd: 0,
  }),

  itemRemoveButton: style({
    position: "absolute",
    top: `calc((${vars.spacing._9} + 1px) / 2)`,
    transform: "translateY(-50%)",
    right: `calc(-1 * ${vars.spacing._9})`,
    fontSize: vars.typography.fontSizes.xl,
    color: vars.colors.text.secondary,
    selectors: {
      "&:hover": {
        color: vars.colors.text.secondary,
      },
    },
  }),
};
