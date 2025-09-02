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

export const CreateDocumentForCollection = {
  summaryProperties: style({
    display: "inline-grid",
    rowGap: vars.spacing._2,
    width: "fit-content",
    padding: vars.spacing._4,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
  }),

  summaryProperty: style({
    display: "grid",
    gridTemplateColumns: `${vars.spacing._32} auto`,
    columnGap: vars.spacing._6,
    alignItems: "center",
  }),

  summaryPropertyName: style({
    minWidth: vars.spacing._32,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.sm,
  }),

  summaryPropertyValue: style({
    minWidth: vars.spacing._32,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.md,
    marginInlineStart: 0,
  }),
};
