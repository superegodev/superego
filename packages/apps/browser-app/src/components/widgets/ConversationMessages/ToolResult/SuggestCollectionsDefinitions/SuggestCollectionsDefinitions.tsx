import {
  type Conversation,
  ConversationStatus,
  type ToolCall,
  type ToolResult,
} from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import { useCreateManyCollections } from "../../../../../business-logic/backend/hooks.js";
import ToastType from "../../../../../business-logic/toasts/ToastType.js";
import toasts from "../../../../../business-logic/toasts/toasts.js";
import Button from "../../../../design-system/Button/Button.js";
import CollectionPreviewsTabs from "../../../../design-system/CollectionPreviewsTabs/CollectionPreviewsTabs.js";
import Title from "../Title.js";
import * as cs from "../ToolResult.css.js";

interface Props {
  conversation: Conversation;
  toolCall: ToolCall.SuggestCollectionsDefinitions;
  toolResult: ToolResult.SuggestCollectionsDefinitions & {
    output: { success: true };
    artifacts: NonNullable<
      ToolResult.SuggestCollectionsDefinitions["artifacts"]
    >;
  };
}
export default function SuggestCollectionsDefinitions({
  conversation,
  toolCall,
  toolResult,
}: Props) {
  const intl = useIntl();
  const { collections } = toolCall.input;

  const { mutate, isPending } = useCreateManyCollections();
  const createAllCollections = async () => {
    const result = await mutate(
      collections.map(({ settings, schema }, index) => ({
        settings: {
          ...settings,
          defaultCollectionViewAppId: null,
          assistantInstructions: null,
        },
        schema,
        versionSettings: {
          contentBlockingKeysGetter:
            toolResult.artifacts.collections[index]!.contentBlockingKeysGetter,
          contentSummaryGetter:
            toolResult.artifacts.collections[index]!.contentSummaryGetter,
        },
      })),
    );
    if (!result.success) {
      console.error(result.error);
      toasts.add({
        type: ToastType.Error,
        title: intl.formatMessage({
          defaultMessage: "Error creating the collections",
        }),
        error: result.error,
      });
    }
  };

  const collectionPreviews = collections.map((collection) => ({
    settings: {
      name: collection.settings.name,
      icon: collection.settings.icon,
    },
    schema: collection.schema,
    exampleDocument: collection.exampleDocument,
  }));

  return (
    <div className={cs.SuggestCollectionsDefinitions.root}>
      <Title>
        <FormattedMessage defaultMessage="Suggested collections" />
      </Title>
      <CollectionPreviewsTabs
        collections={collectionPreviews}
        className={cs.SuggestCollectionsDefinitions.collectionPreviewsTabs}
        tabClassName={cs.SuggestCollectionsDefinitions.collectionPreviewsTab}
      />
      <Button
        variant="primary"
        className={cs.SuggestCollectionsDefinitions.createButton}
        onPress={createAllCollections}
        isDisabled={
          isPending ||
          conversation.status !== ConversationStatus.Idle ||
          conversation.hasOutdatedContext
        }
      >
        {collections.length === 1 ? (
          <FormattedMessage defaultMessage="Create" />
        ) : (
          <FormattedMessage defaultMessage="Create All" />
        )}
      </Button>
    </div>
  );
}
