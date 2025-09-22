import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const ToolCallResult = {
  root: style({
    position: "relative",
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    selectors: {
      // First in any contiguous run of .ToolCallResult.root items.
      ":not(&) + &": {
        marginBlockStart: vars.spacing._8,
        marginBlockEnd: vars.spacing._2,
      },
      // Middle items.
      "& + &:has(+ &)": {
        marginBlock: vars.spacing._2,
      },
      // Last item.
      "&:not(:has(+ &))": {
        marginBlockStart: vars.spacing._2,
        marginBlockEnd: vars.spacing._8,
      },
    },
  }),

  triggerButton: style({
    background: "transparent",
    padding: 0,
    margin: 0,
    border: 0,
    cursor: "pointer",
  }),

  callInput: style({
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  resultOutput: style({
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  resultArtifacts: style({
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),
};

export const Title = {
  root: style({
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.semibold,
    padding: vars.spacing._3,
    margin: 0,
  }),
};
