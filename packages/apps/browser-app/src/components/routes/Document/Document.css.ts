import { style } from "@vanilla-extract/css";
import { breakpoints, vars } from "../../../themes.css.js";

export const Document = {
  historyLayout: style({
    display: "flex",
    gap: vars.spacing._8,
  }),

  contentWrapper: style({
    width: "66.666%",
    "@media": {
      [`(max-width: ${breakpoints.medium})`]: {
        width: "50%",
      },
    },
  }),

  history: style({
    width: "33.333%",
    "@media": {
      [`(max-width: ${breakpoints.medium})`]: {
        width: "50%",
      },
    },
  }),
};

export const CreateNewDocumentVersionForm = {
  readOnlyAlert: style({
    marginBlockEnd: vars.spacing._8,
  }),
};

export const DeleteDocumentModalForm = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
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
