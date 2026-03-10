import type {
  Collection,
  CollectionId,
  ToolCall,
  ToolResult,
} from "@superego/backend";
import { FormattedMessage } from "react-intl";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import * as cs from "./ToolCallResult.css.js";

interface Props {
  toolCall: ToolCall;
  toolResult: ToolResult | null;
}
export default function Title({ toolCall, toolResult }: Props) {
  const { collections } = useGlobalData();
  let title = (
    <FormattedMessage
      defaultMessage="Call tool: {tool}"
      values={{ tool: toolCall.tool }}
    />
  );
  if (ConversationUtils.isCreateDocumentsToolCall(toolCall)) {
    title = <FormattedMessage defaultMessage="Create documents" />;
  }
  if (ConversationUtils.isExecuteTypescriptFunctionToolCall(toolCall)) {
    title = (
      <FormattedMessage
        defaultMessage="Execute TypeScript function on {collections}"
        values={{ collections: getCollections(collections, toolCall) }}
      />
    );
  }
  if (ConversationUtils.isCreateNewDocumentVersionToolCall(toolCall)) {
    title = (
      <FormattedMessage
        defaultMessage="Create new document version in {collection}"
        values={{ collection: getCollection(collections, toolCall) }}
      />
    );
  }
  if (ConversationUtils.isGetCollectionTypescriptSchemaToolCall(toolCall)) {
    title = (
      <FormattedMessage
        defaultMessage="Get TypeScript schema for {collection}"
        values={{ collection: getCollection(collections, toolCall) }}
      />
    );
  }
  if (ConversationUtils.isCreateChartToolCall(toolCall)) {
    title = (
      <FormattedMessage
        defaultMessage="Create chart from {collections}"
        values={{ collections: getCollections(collections, toolCall) }}
      />
    );
  }
  if (ConversationUtils.isCreateGeoJSONMapToolCall(toolCall)) {
    title = (
      <FormattedMessage
        defaultMessage="Create map from {collections}"
        values={{ collections: getCollections(collections, toolCall) }}
      />
    );
  }
  if (ConversationUtils.isCreateDocumentsTablesToolCall(toolCall)) {
    title = (
      <FormattedMessage
        defaultMessage="Create documents table from {collections}"
        values={{
          collections: getCollections(collections, toolCall),
        }}
      />
    );
  }
  return (
    <h5 className={cs.Title.root}>
      {"⚡\u2002"}
      {title}
      {"\u2002→\u2002"}
      {toolResult ? (
        toolResult.output.success ? (
          <FormattedMessage defaultMessage="Succeeded" />
        ) : (
          <FormattedMessage defaultMessage="Failed" />
        )
      ) : (
        <FormattedMessage defaultMessage="No response" />
      )}
    </h5>
  );
}

function getCollection(
  collections: Collection[],
  toolCall: ToolCall & { input: { collectionId: CollectionId } },
): string {
  const { collectionId } = toolCall.input;
  return (
    CollectionUtils.findCollection(collections, collectionId)?.settings.name ??
    collectionId
  );
}

function getCollections(
  collections: Collection[],
  toolCall: ToolCall & { input: { collectionIds: CollectionId[] } },
): string {
  return toolCall.input.collectionIds
    .map(
      (collectionId: CollectionId) =>
        CollectionUtils.findCollection(collections, collectionId)?.settings
          .name ?? collectionId,
    )
    .join(", ");
}
