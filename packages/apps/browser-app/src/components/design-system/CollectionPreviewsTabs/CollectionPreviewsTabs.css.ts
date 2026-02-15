import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";
import { ExcalidrawInput } from "../ExcalidrawInput/ExcalidrawInput.css.js";

export const CollectionPreviewsTabs = {
  root: style({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
  }),

  tabs: style({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
  }),

  tabList: style({
    display: "flex",
    flexShrink: 0,
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  tab: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._1,
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.secondary,
    paddingInline: vars.spacing._3,
    paddingBlock: vars.spacing._2,
    border: "none",
    borderBlockEnd: `${vars.borders.width.medium} solid transparent`,
    cursor: "pointer",
    background: "transparent",
    selectors: {
      '&[data-selected="true"]': {
        color: vars.colors.text.primary,
        borderBlockEndColor: vars.colors.border.focus,
      },
      "&:hover": {
        color: vars.colors.text.primary,
      },
    },
  }),

  tabPanel: style({
    paddingBlockStart: vars.spacing._3,
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  }),
};

export const CollectionPreview = {
  root: style({
    position: "relative",
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    background: vars.colors.background.secondarySurface,
    borderRadius: vars.borders.radius.md,
    paddingBlock: vars.spacing._4,
    paddingInline: vars.spacing._8,
    zoom: 0.9,
    height: "100%",
    overflow: "auto",
  }),
};

globalStyle(`${CollectionPreview.root} > *`, {
  marginBlockEnd: vars.spacing._2,
});

globalStyle(`${CollectionPreview.root} ${ExcalidrawInput.root}`, {
  zoom: 1 / 0.9,
  width: "100%",
  height: `calc(${vars.spacing._120} * 0.9)`,
});
