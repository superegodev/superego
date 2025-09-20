import { ConversationStatus as ConversationStatusB } from "@superego/backend";
import { style, styleVariants } from "@vanilla-extract/css";
import { dark, vars } from "../../../themes.css.js";

const conversationStatusRootBase = style({
  borderWidth: vars.borders.width.thin,
  borderStyle: "solid",
  borderRadius: vars.borders.radius.lg,
  paddingBlock: vars.spacing._0_5,
  paddingInline: vars.spacing._4,
  textTransform: "uppercase",
  fontSize: vars.typography.fontSizes.xs2,
  selectors: {
    [`${dark} &`]: {
      borderColor: "transparent",
    },
  },
});
export const ConversationStatus = {
  root: styleVariants({
    [ConversationStatusB.Idle]: [
      conversationStatusRootBase,
      {
        color: vars.colors.semantic.success.text,
        borderColor: vars.colors.semantic.success.border,
        background: vars.colors.semantic.success.background,
      },
    ],
    [ConversationStatusB.Processing]: [
      conversationStatusRootBase,
      {
        color: vars.colors.semantic.pending.text,
        borderColor: vars.colors.semantic.pending.border,
        background: vars.colors.semantic.pending.background,
      },
    ],
    [ConversationStatusB.Error]: [
      conversationStatusRootBase,
      {
        color: vars.colors.semantic.error.text,
        borderColor: vars.colors.semantic.error.border,
        background: vars.colors.semantic.error.background,
      },
    ],
  }),
};
