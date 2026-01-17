import {
  type Conversation,
  ConversationStatus,
  type ToolCall,
  type ToolResult,
} from "@superego/backend";
import { utils } from "@superego/schema";
import { useId } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { FormattedMessage, useIntl } from "react-intl";
import makeContentSummaryGetter from "../../../../../business-logic/assistant/makeContentSummaryGetter.js";
import { useCreateManyCollections } from "../../../../../business-logic/backend/hooks.js";
import ToastType from "../../../../../business-logic/toasts/ToastType.js";
import toasts from "../../../../../business-logic/toasts/toasts.js";
import Button from "../../../../design-system/Button/Button.js";
import Title from "../Title.js";
import * as cs from "../ToolResult.css.js";
import CollectionPreview from "./CollectionPreview.jsx";

interface Props {
  conversation: Conversation;
  toolCall: ToolCall.SuggestCollectionsDefinitions;
  toolResult: ToolResult.SuggestCollectionsDefinitions & {
    output: { success: true };
  };
}
export default function SuggestCollectionsDefinitions({
  conversation,
  toolCall,
}: Props) {
  const intl = useIntl();
  const { collections } = toolCall.input;

  const { mutate, isPending } = useCreateManyCollections();
  const createAllCollections = async () => {
    const result = await mutate(
      collections.map(({ settings, schema, tableColumns }) => ({
        settings: {
          ...settings,
          defaultCollectionViewAppId: null,
          assistantInstructions: null,
        },
        schema,
        versionSettings: {
          contentSummaryGetter: makeContentSummaryGetter(schema, tableColumns),
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
  const suggestedCollections = collections.map((collection, index) => ({
    id: utils.makeSuggestedCollectionId(index),
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
              key={utils.makeSuggestedCollectionId(index)}
              id={`${tabsId}-${index}`}
              className={cs.SuggestCollectionsDefinitions.tab}
            >
              {collection.settings.icon} {collection.settings.name}
            </Tab>
          ))}
        </TabList>
        {collections.map((collection, index) => (
          <TabPanel
            key={utils.makeSuggestedCollectionId(index)}
            id={`${tabsId}-${index}`}
            className={cs.SuggestCollectionsDefinitions.tabPanel}
          >
            <CollectionPreview
              collection={collection}
              suggestedCollections={suggestedCollections}
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
