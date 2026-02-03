import { globalStyle, style } from "@vanilla-extract/css";
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

  tabList: style({
    display: "flex",
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
  }),

  tab: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._1,
    fontSize: vars.typography.fontSizes.sm,
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
    outline: "none",
    paddingBlockStart: vars.spacing._3,
  }),

  createButton: style({
    alignSelf: "end",
    fontSize: vars.typography.fontSizes.sm,
  }),
};

export const CollectionPreview = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),

  form: style({
    position: "relative",
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    background: vars.colors.background.secondarySurface,
    borderRadius: vars.borders.radius.md,
    paddingBlock: vars.spacing._4,
    paddingInlineStart: vars.spacing._8,
    paddingInlineEnd: 0,
    overflow: "hidden",
    zoom: 0.9,
    marginBlockEnd: vars.spacing._1,
  }),

  scrollContainer: style({
    paddingInlineEnd: vars.spacing._8,
    maxHeight: vars.spacing._140,
    overflow: "auto",
  }),
};

globalStyle(`${CollectionPreview.scrollContainer} > *`, {
  marginBlockEnd: vars.spacing._2,
});

export const CreateChart = {
  chart: style({
    marginBlockStart: vars.spacing._6,
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
