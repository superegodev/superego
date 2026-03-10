import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const FullPageTabs = {
  tabList: style({
    display: "flex",
    fontSize: vars.typography.fontSizes.xl,
    position: "sticky",
    top: vars.shell.panelHeaderHeight,
    paddingBlockStart: vars.spacing._4,
    background: vars.colors.background.surface,
    zIndex: 99,
    selectors: {
      "&::after": {
        content: "",
        position: "absolute",
        borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
        insetInline: 0,
        top: "100%",
        height: vars.spacing._4,
        background: `
          linear-gradient(
            180deg,
            ${vars.colors.background.surface} 0%,
            rgb(from ${vars.colors.background.surface} r g b / 0) 100%
          )
        `,
        pointerEvents: "none",
      },
    },
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
