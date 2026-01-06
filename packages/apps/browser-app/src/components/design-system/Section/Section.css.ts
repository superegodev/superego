import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const sectionTitleBase = style({
  paddingBlockEnd: vars.spacing._2,
  marginBlockEnd: vars.spacing._8,
  borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  fontWeight: vars.typography.fontWeights.regular,
});
export const Section = {
  root: style({
    marginBlockEnd: vars.spacing._8,
  }),
  title: styleVariants({
    2: [
      sectionTitleBase,
      {
        fontSize: vars.typography.fontSizes.lg,
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
