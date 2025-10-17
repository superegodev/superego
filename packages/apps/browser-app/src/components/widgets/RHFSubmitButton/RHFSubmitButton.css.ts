import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const rhfSubmitButtonSpinnerBase = style({
  transition: "all 500ms ease",
});

export const RHFSubmitButton = {
  root: style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }),

  spinner: styleVariants({
    visible: [
      rhfSubmitButtonSpinnerBase,
      {
        width: 16,
        height: 8,
        marginInlineEnd: vars.spacing._1,
        transitionDelay: "200ms",
      },
    ],
    hidden: [rhfSubmitButtonSpinnerBase, { width: 0, height: 0 }],
  }),
};
