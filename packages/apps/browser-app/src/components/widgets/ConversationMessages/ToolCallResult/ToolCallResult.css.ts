import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const ToolCallResult = {
  root: style({
    position: "relative",
    width: "100%",
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    marginBlockEnd: vars.spacing._2,
  }),

  tabs: style({
    display: "flex",
    width: "100%",
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  tabsList: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._4,
    padding: vars.spacing._3,
    fontSize: vars.typography.fontSizes.sm,
    borderInlineEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  tab: style({
    cursor: "pointer",
    color: vars.colors.text.secondary,
    selectors: {
      '&:hover, &[data-selected="true"]': {
        color: vars.colors.text.primary,
      },
    },
  }),

  tabPanel: style({
    paddingInline: vars.spacing._2,
    paddingBlock: 0,
    flexGrow: 1,
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
