import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const Ask = {
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
    fontSize: vars.typography.fontSizes.md,
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
    height: vars.spacing._40,
  }),

  title: style({
    fontSize: vars.typography.fontSizes.xl3,
    fontWeight: vars.typography.fontWeights.regular,
    marginBlockEnd: vars.spacing._0,
  }),

  tagLine: style({
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xl,
    fontWeight: vars.typography.fontWeights.regular,
    marginBlockStart: vars.spacing._2,
    marginBlockEnd: vars.spacing._24,
  }),
};

export const Welcome = {
  root: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    fontSize: vars.typography.fontSizes.lg,
    width: "100%",
    paddingInline: vars.spacing._4,
    marginBlockStart: `calc(-1 * ${vars.spacing._24} + ${vars.spacing._8})`,
    marginBlockEnd: vars.spacing._16,
  }),

  heading: style({
    width: "100%",
    textAlign: "left",
    color: vars.colors.text.secondary,
    marginBlockEnd: vars.spacing._4,
  }),

  steps: style({
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing._3,
    textAlign: "left",
    alignSelf: "stretch",
  }),

  stepLink: style({
    color: vars.colors.text.secondary,
    textDecorationLine: "underline",
    textDecorationStyle: "dashed",
  }),
};

export const WelcomeStep = {
  root: styleVariants({
    completed: {
      display: "flex",
      alignItems: "baseline",
      gap: vars.spacing._2,
      color: vars.colors.semantic.success.text,
    },
    enabled: {
      display: "flex",
      alignItems: "baseline",
      gap: vars.spacing._2,
      color: vars.colors.text.secondary,
    },
    disabled: {
      display: "flex",
      alignItems: "baseline",
      gap: vars.spacing._2,
      color: vars.colors.text.secondary,
      opacity: 0.5,
      pointerEvents: "none",
    },
  }),

  icon: style({
    flexShrink: 0,
    position: "relative",
    top: "2px",
  }),
};
