import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const sectionTitleBase = style({
  paddingBlockEnd: vars.spacing._2,
  margin: 0,
  borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  fontWeight: vars.typography.fontWeights.regular,
  selectors: {
    "&:first-child": {
      marginBlockStart: 0,
    },
  },
});
export const Section = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._6,
  }),

  title: styleVariants({
    2: [
      sectionTitleBase,
      {
        fontSize: vars.typography.fontSizes.xl,
      },
    ],
    3: [
      sectionTitleBase,
      {
        fontSize: vars.typography.fontSizes.lg,
      },
    ],
    4: [
      sectionTitleBase,
      {
        fontSize: vars.typography.fontSizes.md,
      },
    ],
  }),
};
