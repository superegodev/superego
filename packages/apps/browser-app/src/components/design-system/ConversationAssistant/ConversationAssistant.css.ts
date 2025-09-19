import { AssistantName } from "@superego/backend";
import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

const conversationAssistantRootBase = style({
  borderWidth: vars.borders.width.thin,
  borderStyle: "solid",
  borderRadius: vars.borders.radius.lg,
  paddingBlock: vars.spacing._0_5,
  paddingInline: vars.spacing._4,
  textTransform: "uppercase",
  fontSize: vars.typography.fontSizes.xs2,
});
export const ConversationAssistant = {
  root: styleVariants({
    [AssistantName.Factotum]: [
      conversationAssistantRootBase,
      {
        color: vars.colors.cyans._5,
        borderColor: vars.colors.cyans._5,
        background: vars.colors.cyans._1,
      },
    ],
    [AssistantName.CollectionCreator]: [
      conversationAssistantRootBase,
      {
        color: vars.colors.oranges._5,
        borderColor: vars.colors.oranges._5,
        background: vars.colors.oranges._1,
      },
    ],
  }),
};
