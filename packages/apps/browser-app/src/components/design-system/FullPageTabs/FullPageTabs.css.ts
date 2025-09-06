import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const FullPageTabs = {
  tabList: style({
    display: "flex",
    fontSize: vars.typography.fontSizes.md,
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  tab: style({
    width: vars.spacing._40,
    textAlign: "center",
    color: vars.colors.text.secondary,
    paddingBlockEnd: vars.spacing._2,
    border: 0,
    borderBlockEndWidth: vars.borders.width.medium,
    borderStyle: "solid",
    borderBlockEndColor: "transparent",
    cursor: "pointer",
    selectors: {
      '&[data-selected="true"]': {
        borderBlockEndColor: vars.colors.border.focus,
        color: vars.colors.text.primary,
      },
    },
  }),

  tabPanel: style({
    paddingBlockStart: vars.spacing._8,
  }),

  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};
