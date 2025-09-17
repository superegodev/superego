import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CreateCollectionAssisted = {
  panelContent: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }),
};

export const Hero = {
  root: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBlockStart: vars.spacing._16,
  }),

  logo: style({
    marginBlockEnd: vars.spacing._6,
    height: vars.spacing._32,
  }),

  title: style({
    fontSize: vars.typography.fontSizes.xl2,
    fontWeight: vars.typography.fontWeights.regular,
    marginBlockEnd: vars.spacing._0,
  }),

  tagLine: style({
    fontSize: vars.typography.fontSizes.xl,
    fontWeight: vars.typography.fontWeights.regular,
    marginBlockEnd: vars.spacing._24,
  }),
};
