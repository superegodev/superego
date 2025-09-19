import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";
import { narrowContainerWidth } from "../ConversationMessages.css.js";

export const Title = {
  root: style({
    color: vars.colors.text.primary,
    marginBlockEnd: vars.spacing._2,
  }),
};

export const CreateDocumentOrVersion = {
  root: style({
    display: "block",
    textDecoration: "none",
    marginBlock: vars.spacing._2,
    color: vars.colors.text.primary,
  }),

  contentSummarySkeleton: style({
    width: vars.spacing._80,
    padding: vars.spacing._4,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    margin: 0,
    overflow: "hidden",
  }),
};

export const SuggestCollectionDefinition = {
  root: style({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    "@container": {
      [`(min-width: ${narrowContainerWidth})`]: {
        marginInlineEnd: "40%",
      },
    },
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
    maxHeight: vars.spacing._120,
    overflow: "scroll",
  }),

  createButton: style({
    alignSelf: "end",
    fontSize: vars.typography.fontSizes.xs,
    paddingBlock: `${vars.spacing._1} !important`,
  }),
};

globalStyle(`${SuggestCollectionDefinition.scrollContainer} > *`, {
  marginBlockEnd: vars.spacing._2,
});

export const RenderChart = {
  root: style({
    width: "100%",
  }),
};
