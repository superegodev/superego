import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const FullPageTabs = {
  tabList: style({
    display: "flex",
    fontSize: vars.typography.fontSizes.md,
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  tab: style({
    textAlign: "center",
    color: vars.colors.text.secondary,
    paddingInline: vars.spacing._4,
    paddingBlockEnd: vars.spacing._2,
    border: 0,
    borderBlockEndWidth: vars.borders.width.medium,
    borderStyle: "solid",
    borderBlockEndColor: "transparent",
    cursor: "pointer",
    textDecoration: "none",
    selectors: {
      '&[data-selected="true"]': {
        borderBlockEndColor: vars.colors.border.focus,
        color: vars.colors.text.primary,
      },
      '&[aria-disabled="true"]': {
        cursor: "not-allowed",
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
