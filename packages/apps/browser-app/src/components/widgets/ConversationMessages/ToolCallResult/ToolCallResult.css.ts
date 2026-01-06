import { style, styleVariants } from "@vanilla-extract/css";
import { dark, vars } from "../../../../themes.css.js";

const rootTollCallResultBase = style({
  position: "relative",
  borderWidth: vars.borders.width.thin,
  borderStyle: "solid",
  borderRadius: vars.borders.radius.md,
  overflow: "hidden",
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
});
export const ToolCallResult = {
  root: styleVariants({
    succeeded: [
      rootTollCallResultBase,
      {
        background: vars.colors.greens._1,
        borderColor: vars.colors.greens._5,
        selectors: {
          [`${dark} &`]: {
            background: vars.colors.greens._5,
          },
        },
      },
    ],
    failed: [
      rootTollCallResultBase,
      {
        background: vars.colors.reds._1,
        borderColor: vars.colors.reds._5,
        selectors: {
          [`${dark} &`]: {
            background: vars.colors.reds._5,
          },
        },
      },
    ],
    noResult: [
      rootTollCallResultBase,
      {
        background: vars.colors.yellows._1,
        borderColor: vars.colors.yellows._5,
        selectors: {
          [`${dark} &`]: {
            background: vars.colors.yellows._5,
          },
        },
      },
    ],
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
    fontSize: vars.typography.fontSizes.md,
    fontWeight: vars.typography.fontWeights.semibold,
    padding: vars.spacing._3,
    margin: 0,
  }),
};
