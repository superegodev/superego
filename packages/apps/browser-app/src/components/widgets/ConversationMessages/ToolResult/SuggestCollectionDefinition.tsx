import {
  type Conversation,
  ConversationStatus,
  type ToolCall,
  type ToolResult,
} from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import makeContentSummaryGetter from "../../../../business-logic/assistant/makeContentSummaryGetter.js";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { useCreateCollection } from "../../../../business-logic/backend/hooks.js";
import ToastType from "../../../../business-logic/toasts/ToastType.js";
import toastQueue from "../../../../business-logic/toasts/toastQueue.js";
import CollectionCategoryUtils from "../../../../utils/CollectionCategoryUtils.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import Button from "../../../design-system/Button/Button.js";
import RHFContentField from "../../RHFContentField/RHFContentField.js";
import Title from "./Title.js";
import * as cs from "./ToolResult.css.js";

interface Props {
  conversation: Conversation;
  toolCall: ToolCall.SuggestCollectionDefinition;
  toolResult: ToolResult.SuggestCollectionDefinition & {
    output: { success: true };
  };
}
export default function SuggestCollectionDefinition({
  conversation,
  toolCall,
}: Props) {
  const intl = useIntl();
  const { collectionCategories } = useGlobalData();

  const { settings, schema, exampleDocument, tableColumns } = toolCall.input;
  const collectionCategory = collectionCategories.find(
    ({ id }) => id === settings.collectionCategoryId,
  );

  const { mutate, isPending } = useCreateCollection();
  const createCollection = async () => {
    const result = await mutate(
      { ...settings, assistantInstructions: null },
      schema,
      { contentSummaryGetter: makeContentSummaryGetter(schema, tableColumns) },
    );
    if (!result.success) {
      console.error(result.error);
      toastQueue.add({
        type: ToastType.Error,
        title: intl.formatMessage({
          defaultMessage: "Error creating the collection",
        }),
        description: result.error.name,
      });
    }
  };

  const { control, handleSubmit } = useForm<any>({
    defaultValues: exampleDocument,
    mode: "onSubmit",
    disabled: true,
  });
  return (
    <div className={cs.SuggestCollectionDefinition.root}>
      <Title>
        <FormattedMessage defaultMessage="Suggested collection" />
        {" » "}
        {CollectionUtils.getDisplayName({ settings })}
        {collectionCategory ? (
          <>
            {" ("}
            {CollectionCategoryUtils.getDisplayName(collectionCategory)}
            {")"}
          </>
        ) : null}
      </Title>
      <Form
        onSubmit={handleSubmit(() => {})}
        className={cs.SuggestCollectionDefinition.form}
      >
        <div className={cs.SuggestCollectionDefinition.scrollContainer}>
          <RHFContentField
            schema={schema}
            control={control}
            document={null}
            showNullability={true}
            zoomLevel={0.9}
          />
        </div>
      </Form>
      <Button
        variant="primary"
        className={cs.SuggestCollectionDefinition.createButton}
        onPress={createCollection}
        isDisabled={
          isPending ||
          conversation.status !== ConversationStatus.Idle ||
          conversation.hasOutdatedContext
        }
      >
        <FormattedMessage defaultMessage="Create" />
      </Button>
    </div>
  );
}
