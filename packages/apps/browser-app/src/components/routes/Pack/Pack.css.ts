import { style } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../../themes.css.js";

export const PackMainPanel = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._4,
    paddingBlockEnd: vars.spacing._12,
  }),

  collectionsLayout: style({
    display: "flex",
    flexDirection: "row",
    gap: vars.spacing._8,
    paddingBlockStart: "0 !important",
  }),

  contentWrapper: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._4,
    flex: 1,
    minWidth: 0,
  }),

  contentWrapperCollectionsLayout: style({
    paddingBlockStart: vars.spacing._4,
    flex: "2 1 0",
    "@media": {
      [`(max-width: ${breakpoints.medium})`]: {
        flex: "1 1 0",
      },
    },
  }),

  collections: style({
    display: "flex",
    flexDirection: "column",
    flex: "1 1 0",
    minWidth: 0,
    position: "sticky",
    top: vars.shell.panelHeaderHeight,
    paddingBlockStart: vars.spacing._4,
    alignSelf: "flex-start",
    maxHeight: `calc(100dvh - ${vars.shell.panelHeaderHeight} - ${vars.spacing._8})`,
    overflow: "hidden",
  }),

  titleContainer: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._1,
    marginBlockStart: vars.spacing._4,
    marginBlockEnd: vars.spacing._2,
  }),

  name: style({
    marginBlockEnd: vars.spacing._0,
    fontSize: vars.typography.fontSizes.xl2,
  }),

  counts: style({
    display: "flex",
    alignItems: "center",
    margin: 0,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
  }),

  longDescription: style({
    marginBlockStart: vars.spacing._4,
    flex: 1,
  }),

  installButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};
