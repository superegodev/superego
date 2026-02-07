import {
  type Conversation,
  ConversationStatus,
  type ToolCall,
  type ToolResult,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { useId } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { FormattedMessage, useIntl } from "react-intl";
import { useCreateManyCollections } from "../../../../../business-logic/backend/hooks.js";
import ToastType from "../../../../../business-logic/toasts/ToastType.js";
import toasts from "../../../../../business-logic/toasts/toasts.js";
import Button from "../../../../design-system/Button/Button.js";
import Title from "../Title.js";
import * as cs from "../ToolResult.css.js";
import CollectionPreview from "./CollectionPreview.js";

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

  const tabsId = useId();
  const protoCollections = collections.map((collection, index) => ({
    id: Id.generate.protoCollection(index),
    settings: {
      name: collection.settings.name,
      icon: collection.settings.icon,
    },
  }));

  return (
    <div className={cs.SuggestCollectionsDefinitions.root}>
      <Title>
        <FormattedMessage defaultMessage="Suggested collections" />
      </Title>
      <Tabs>
        <TabList className={cs.SuggestCollectionsDefinitions.tabList}>
          {collections.map((collection, index) => (
            <Tab
              key={Id.generate.protoCollection(index)}
              id={`${tabsId}-${index}`}
              className={cs.SuggestCollectionsDefinitions.tab}
            >
              {collection.settings.icon} {collection.settings.name}
            </Tab>
          ))}
        </TabList>
        {collections.map((collection, index) => (
          <TabPanel
            key={Id.generate.protoCollection(index)}
            id={`${tabsId}-${index}`}
            className={cs.SuggestCollectionsDefinitions.tabPanel}
          >
            <CollectionPreview
              collection={collection}
              protoCollections={protoCollections}
            />
          </TabPanel>
        ))}
      </Tabs>
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
