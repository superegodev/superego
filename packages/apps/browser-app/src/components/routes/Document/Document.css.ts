import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const DeleteDocumentModalForm = {
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

export const RemoteDocumentInfoModal = {
  infoProperties: style({
    display: "inline-table",
    width: "auto",
    fontSize: vars.typography.fontSizes.sm,
    margin: 0,
  }),

  infoProperty: style({
    display: "table-row",
    marginBlockEnd: vars.spacing._2,
  }),

  infoPropertyName: style({
    display: "table-cell",
    verticalAlign: "middle",
    paddingBlock: vars.spacing._1,
    paddingInlineEnd: vars.spacing._2,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xs,
    whiteSpace: "nowrap",
  }),

  infoPropertyValue: style({
    display: "table-cell",
    minWidth: vars.spacing._40,
    verticalAlign: "middle",
    paddingInlineEnd: vars.spacing._8,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.sm,
  }),
};
