import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const RHFSummaryPropertyDefinitionsField = {
  description: style({
    marginBlockStart: vars.spacing._2,
    fontSize: vars.typography.fontSizes.sm,
  }),

  item: style({
    position: "relative",
  }),

  itemActions: style({
    position: "absolute",
    top: `calc(-1 * ${vars.spacing._1})`,
    transform: "translateX(-100%)",
    paddingInlineEnd: vars.spacing._2,
    opacity: 0,
    selectors: {
      ":hover > &": {
        opacity: 1,
        transition: "opacity 300ms ease",
      },
      "&:has(:focus)": {
        opacity: 1,
      },
    },
  }),

  itemAction: style({
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.secondary,
    selectors: {
      "&:hover": {
        color: vars.colors.text.secondary,
      },
    },
  }),
};
