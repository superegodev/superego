import { style, styleVariants } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../../themes.css.js";

export const Document = {
  historyLayout: style({
    display: "flex",
    gap: vars.spacing._8,
    paddingBlockStart: "0 !important",
  }),

  contentWrapper: styleVariants({
    base: {
      height: "100%",
    },
    historyLayout: {
      paddingBlockStart: vars.spacing._4,
      flex: "2 1 0",
      "@media": {
        [`(max-width: ${breakpoints.medium})`]: {
          flex: "1 1 0",
        },
      },
    },
  }),

  history: style({
    flex: "1 1 0",
    position: "sticky",
    top: vars.shell.panelHeaderHeight,
    paddingBlockStart: vars.spacing._4,
    alignSelf: "flex-start",
    maxHeight: `calc(100dvh - ${vars.shell.panelHeaderHeight} - ${vars.spacing._8} - ${vars.spacing._4})`,
  }),
};

export const CreateNewDocumentVersionForm = {
  root: style({
    height: "100%",
  }),

  readOnlyAlert: style({
    marginBlockEnd: vars.spacing._8,
  }),
};

export const RemoteDocumentInfoModal = {
  infoProperties: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
    fontSize: vars.typography.fontSizes.md,
  }),

  infoProperty: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
  }),

  infoPropertyName: style({
    verticalAlign: "middle",
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
    whiteSpace: "nowrap",
  }),

  infoPropertyValue: style({
    minWidth: vars.spacing._40,
    verticalAlign: "middle",
    marginInlineStart: 0,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.md,
    textWrap: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  }),
};
