import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CollectionCreatorConversation = {
  panelContent: style({
    position: "relative",
    display: "grid",
    gridTemplateAreas: '"Chat Preview"',
    gridTemplateColumns: "1fr 1fr",
    paddingBlock: "0 !important",
    gap: vars.spacing._24,
  }),

  chat: style({
    gridArea: "Chat",
  }),
};

export const Preview = {
  root: style({
    display: "flex",
    flexDirection: "column",
    gridArea: "Preview",
    position: "sticky",
    alignSelf: "start",
    top: vars.shell.panelHeaderHeight,
    height: `calc(100vh - ${vars.shell.panelHeaderHeight})`,
    paddingBlockEnd: vars.spacing._8,
  }),

  title: style({
    marginBlockStart: 0,
  }),

  createButton: style({
    width: vars.spacing._36,
    alignSelf: "end",
  }),
};

export const PreviewDocumentForm = {
  root: style({
    position: "relative",
    flexGrow: 1,
    overflow: "hidden",
    marginBlockEnd: vars.spacing._4,
  }),

  title: style({
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.medium,
    marginBlock: vars.spacing._4,
  }),

  form: style({
    position: "relative",
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    background: vars.colors.background.secondarySurface,
    borderRadius: vars.borders.radius.md,
    paddingBlock: vars.spacing._4,
    paddingInlineStart: vars.spacing._8,
    paddingInlineEnd: 0,
    height: `calc(100% - ${vars.spacing._16})`,
    zoom: 0.95,
  }),

  scrollContainer: style({
    paddingInlineEnd: vars.spacing._8,
    height: "100%",
    overflow: "scroll",
  }),
};

globalStyle(`${PreviewDocumentForm.scrollContainer} > *`, {
  marginBlockEnd: vars.spacing._2,
});
