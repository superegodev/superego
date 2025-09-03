import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const ConversationMessages = {
  root: style({
    width: "100%",
  }),
};

export const UserMessage = {
  root: style({
    background: vars.colors.background.surfaceHighlight,
    borderRadius: vars.borders.radius.xl,
    padding: vars.spacing._4,
    marginInlineStart: "40%",
    marginBlock: vars.spacing._8,
    fontSize: vars.typography.fontSizes.sm,
  }),
};

export const ToolMessage = {};

export const AssistantContentMessage = {
  root: style({
    marginBlock: vars.spacing._8,
  }),
};

export const TechnicalToolCallOrResult = {
  disclosureTrigger: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._1,
    marginBlockEnd: vars.spacing._05,
    fontSize: vars.typography.fontSizes.xs,
  }),

  pre: style({
    padding: vars.spacing._4,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    marginBlock: 0,
    marginBlockEnd: vars.spacing._4,
    maxHeight: vars.spacing._64,
    overflow: "scroll",
    width: "100%",
  }),

  code: style({
    whiteSpace: "pre-wrap",
  }),
};

export const CreateDocument = {
  root: style({
    display: "block",
    textDecoration: "none",
    marginBlock: vars.spacing._2,
  }),

  title: style({
    color: vars.colors.text.primary,
    marginBlockEnd: vars.spacing._2,
  }),

  summaryProperties: style({
    display: "inline-table",
    width: "auto",
    padding: vars.spacing._4,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    margin: 0,
  }),

  summaryProperty: style({
    display: "table-row",
    marginBlockEnd: vars.spacing._2,
  }),

  summaryPropertyName: style({
    display: "table-cell",
    verticalAlign: "middle",
    paddingBlock: vars.spacing._1,
    paddingInlineEnd: vars.spacing._8,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xs,
    whiteSpace: "nowrap",
  }),

  summaryPropertyValue: style({
    display: "table-cell",
    verticalAlign: "middle",
    paddingInlineEnd: vars.spacing._8,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.sm,
  }),
};
