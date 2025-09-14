import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Assistant = {
  panelContent: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }),

  historyLink: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
    marginBlockStart: vars.spacing._8,
    fontSize: vars.typography.fontSizes.sm,
    textDecoration: "none",
    color: vars.colors.text.primary,
    fontStyle: "italic",
  }),

  historyLinkIcon: style({
    fontSize: vars.typography.fontSizes.xl,
    position: "relative",
    // Pixel adjustment to align the icon with the text.
    top: "1px",
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
