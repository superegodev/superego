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
    vars: {
      // Height of the visible area in which RHFContentField is rendered. Can be
      // used to define "sticky" custom layouts.
      "--visible-area-height": `
        calc(
          100dvh - (
            ${vars.shell.panelHeaderHeight}
            + ${vars.spacing._4}
            + ${vars.spacing._8}
          )
        )
      `,
      // Distance from the top of the visible area.
      "--visible-area-top": `
        calc(
          ${vars.shell.panelHeaderHeight}
          + ${vars.spacing._4}
        )
      `,
      // Standard gap to use between columns.
      "--column-gap": vars.spacing._8,
      // Standard gap to use between fields.
      "--field-gap": vars.spacing._6,
    },
    selectors: {
      [`${Document.historyLayout} &`]: {
        vars: {
          "--visible-area-height": `
            calc(
              100dvh - (
                ${vars.shell.panelHeaderHeight}
                + ${vars.spacing._4}
                + ${vars.spacing._8}
                + ${vars.spacing._14}
                + ${vars.spacing._6}
              )
            )
          `,
          "--visible-area-top": `
            calc(
              ${vars.shell.panelHeaderHeight}
              + ${vars.spacing._4}
              + ${vars.spacing._14}
              + ${vars.spacing._6}
            )
          `,
        },
      },
    },
  }),

  readOnlyAlert: style({
    position: "sticky",
    top: `calc(${vars.shell.panelHeaderHeight} + ${vars.spacing._4})`,
    zIndex: 1,
    height: vars.spacing._14,
    margin: 0,
    // Hack to hide the form scrolling below.
    boxShadow: `0 calc(-1 * ${vars.spacing._8}) 0 0 ${vars.colors.background.surface}`,
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
