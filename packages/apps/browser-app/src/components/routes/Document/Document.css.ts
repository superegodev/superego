import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const DeleteDocumentModalForm = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
    marginBlockEnd: vars.spacing._4,
  }),
};

export const RemoteDocumentInfoModal = {
  infoProperties: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
    fontSize: vars.typography.fontSizes.sm,
  }),

  infoProperty: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
  }),

  infoPropertyName: style({
    verticalAlign: "middle",
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xs,
    whiteSpace: "nowrap",
  }),

  infoPropertyValue: style({
    minWidth: vars.spacing._40,
    verticalAlign: "middle",
    marginInlineStart: 0,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.sm,
    textWrap: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  }),
};
