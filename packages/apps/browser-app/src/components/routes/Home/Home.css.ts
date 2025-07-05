import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Home = {
  root: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBlockStart: vars.spacing._32,
  }),
  logo: style({
    height: vars.spacing._32,
    marginBlockEnd: vars.spacing._6,
  }),
  title: style({
    fontSize: vars.typography.fontSizes.xl2,
    fontWeight: vars.typography.fontWeights.regular,
    marginBlockEnd: vars.spacing._0,
  }),
  tagLine: style({
    fontSize: vars.typography.fontSizes.xl,
    fontWeight: vars.typography.fontWeights.regular,
  }),
};
