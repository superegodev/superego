import { AssistantName } from "@superego/backend";
import { style, styleVariants } from "@vanilla-extract/css";
import { dark, vars } from "../../../themes.css.js";

const conversationAssistantRootBase = style({
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
export const ConversationAssistant = {
  root: styleVariants({
    [AssistantName.Factotum]: [
      conversationAssistantRootBase,
      {
        color: vars.colors.cyans._5,
        borderColor: vars.colors.cyans._5,
        background: vars.colors.cyans._1,
        selectors: {
          [`${dark} &`]: {
            color: vars.colors.blues._1,
            background: vars.colors.blues._5,
          },
        },
      },
    ],
    [AssistantName.CollectionCreator]: [
      conversationAssistantRootBase,
      {
        color: vars.colors.oranges._5,
        borderColor: vars.colors.oranges._5,
        background: vars.colors.oranges._1,
        selectors: {
          [`${dark} &`]: {
            color: vars.colors.oranges._1,
            background: vars.colors.oranges._5,
          },
        },
      },
    ],
  }),
};
