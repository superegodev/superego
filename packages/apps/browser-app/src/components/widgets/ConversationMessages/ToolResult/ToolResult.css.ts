import { style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";
import { narrowContainerWidth } from "../ConversationMessages.css.js";

export const Title = {
  root: style({
    color: vars.colors.text.primary,
    marginBlockEnd: vars.spacing._2,
    fontSize: vars.typography.fontSizes.md,
  }),
};

export const CreateDocuments = {
  root: style({
    display: "block",
    textDecoration: "none",
    marginBlock: vars.spacing._2,
    color: vars.colors.text.primary,
  }),

  tableContainer: style({
    marginBlockEnd: vars.spacing._6,
  }),

  table: style({
    maxHeight: vars.spacing._80,
  }),
};

export const CreateNewDocumentVersion = {
  root: style({
    display: "block",
    textDecoration: "none",
    marginBlock: vars.spacing._2,
    color: vars.colors.text.primary,
  }),
};

export const SuggestCollectionsDefinitions = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._2,
    "@container": {
      [`(min-width: ${narrowContainerWidth})`]: {
        marginInlineEnd: "40%",
      },
    },
  }),

  collectionPreviewsTab: style({
    fontSize: vars.typography.fontSizes.sm,
  }),

  collectionPreviewsTabs: style({
    maxHeight: vars.spacing._140,
  }),

  createButton: style({
    alignSelf: "end",
    fontSize: vars.typography.fontSizes.sm,
  }),
};

export const CreateChart = {
  chart: style({
    marginBlockStart: vars.spacing._6,
  }),
};

export const CreateGeoJSONMap = {
  root: style({
    marginBlockStart: vars.spacing._6,
    borderRadius: vars.borders.radius.md,
    overflow: "hidden",
  }),
};

export const CreateDocumentsTables = {
  root: style({
    marginBlockEnd: vars.spacing._6,
  }),

  table: style({
    maxHeight: vars.spacing._80,
  }),
};
