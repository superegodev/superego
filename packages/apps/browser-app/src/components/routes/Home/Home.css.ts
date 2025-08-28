import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const homeRootBase = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});
export const Home = {
  root: styleVariants({
    withConversation: [homeRootBase, {}],
    withoutConversation: [homeRootBase, {}],
  }),

  spinner: style({
    marginBlock: vars.spacing._4,
  }),

  userMessageContentInput: style({}),

  conversationMessages: style({
    maxHeight: `calc(100% - ${vars.spacing._64})`,
  }),
};

const heroRootBase = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});
const heroLogoBase = style({
  marginBlockEnd: vars.spacing._6,
});
export const Hero = {
  root: styleVariants({
    minified: [
      heroRootBase,
      {
        paddingBlockStart: 0,
      },
    ],
    nonMinified: [
      heroRootBase,
      {
        paddingBlockStart: vars.spacing._32,
      },
    ],
  }),

  logo: styleVariants({
    minified: [
      heroLogoBase,
      {
        height: vars.spacing._16,
      },
    ],
    nonMinified: [
      heroLogoBase,
      {
        height: vars.spacing._32,
      },
    ],
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
