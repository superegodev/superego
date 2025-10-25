import {
  AssistantName,
  type Backend,
  type Collection,
  type CollectionId,
  type Conversation,
  ConversationFormat,
  ConversationStatus,
  type Document,
  type DocumentId,
  MessageContentPartType,
} from "@superego/backend";
import type { Schema } from "@superego/schema";
import pMap from "p-map";
import { assert, expect, vi } from "vitest";
import assertIsContentAssistantMessage from "./assertIsContentAssistantMessage.js";
import assertSuccessfulResult from "./assertSuccessfulResult.js";
import Evaluator from "./Evaluator.js";

/** Why the name? Akin to https://martinfowler.com/bliki/PageObject.html */
class FactotumObject {
  private conversation: Conversation | null = null;
  constructor(
    private backend: Backend,
    private evaluator: Evaluator,
  ) {}

  /////////////////////////////////////
  // createCollections + aux methods //
  /////////////////////////////////////

  async createCollections<
    const Definitions extends readonly FactotumObject.CollectionDefinition[],
  >(
    ...definitions: Definitions
  ): Promise<{
    [Index in keyof Definitions]: FactotumObject.CreatedCollection;
  }> {
    return pMap(
      definitions,
      (definition) => this.createCollection(definition),
      { concurrency: 1 },
    ) as { [Index in keyof Definitions]: FactotumObject.CreatedCollection };
  }

  private async createCollection(
    definition: FactotumObject.CollectionDefinition,
  ): Promise<FactotumObject.CreatedCollection> {
    const createCollectionResult = await this.backend.collections.create(
      {
        name: definition.name,
        icon: null,
        collectionCategoryId: null,
        description: definition.description ?? null,
        assistantInstructions: definition.assistantInstructions ?? null,
        defaultCollectionViewAppId: null,
      },
      definition.schema,
      {
        contentSummaryGetter: {
          source:
            'export default function getValue() { return { name: "name" }; }',
          compiled:
            'export default function getValue() { return { name: "name" }; }',
        },
      },
    );
    assertSuccessfulResult(
      `Error creating collection ${definition.name}`,
      createCollectionResult,
    );
    const { data: collection } = createCollectionResult;

    const documents = await pMap(
      definition.documentContents,
      async (documentContent, index) => {
        const createDocumentResult = await this.backend.documents.create(
          collection.id,
          documentContent,
        );
        assertSuccessfulResult(
          `Error creating document ${index} in collection ${definition.name}`,
          createDocumentResult,
        );
        return createDocumentResult.data;
      },
      { concurrency: 1 },
    );

    return { collection, documents };
  }

  ///////////////////////////
  // expectCollectionState //
  ///////////////////////////

  async expectCollectionState(
    collectionId: CollectionId,
    expectedDocumentsState: FactotumObject.ExpectedDocumentsState,
  ) {
    const listDocumentsResult = await this.backend.documents.list(collectionId);
    assertSuccessfulResult(
      `Error listing documents for collection ${collectionId}`,
      listDocumentsResult,
    );
    const foundDocuments = await pMap(
      listDocumentsResult.data,
      async ({ id }) => {
        const getDocumentResult = await this.backend.documents.get(
          collectionId,
          id,
        );
        assertSuccessfulResult(
          `Error getting document ${id} for collection ${collectionId}`,
          getDocumentResult,
        );
        return getDocumentResult.data;
      },
    );

    expect(
      foundDocuments.length,
      "Collection in database contains an unexpected number of documents",
    ).toEqual(
      expectedDocumentsState.created.length +
        expectedDocumentsState.updated.length +
        expectedDocumentsState.unmodified.length,
    );

    const foundDocumentsById: Record<DocumentId, Document> = {};
    for (const document of foundDocuments) {
      foundDocumentsById[document.id] = document;
    }

    expectedDocumentsState.unmodified.forEach((document, index) => {
      const supposedlyUnmodifiedDocument = foundDocumentsById[document.id];
      assert.isDefined(
        supposedlyUnmodifiedDocument,
        `Document at unmodified[${index}] should have been unmodified, but it was not found in the database.`,
      );
      expect(
        supposedlyUnmodifiedDocument.latestVersion.id,
        `Document at unmodified[${index}] should have been unmodified, but it was updated.`,
      ).toEqual(document.latestVersion.id);
      delete foundDocumentsById[document.id];
    });

    expectedDocumentsState.updated.forEach(
      ({ document, newContentMatching }, index) => {
        const supposedlyUpdatedDocument = foundDocumentsById[document.id];
        assert.isDefined(
          supposedlyUpdatedDocument,
          `Document at updated[${index}] should have been updated, but it was not found in the database.`,
        );
        expect(
          supposedlyUpdatedDocument.latestVersion.id,
          `Document at updated[${index}] should have been updated, but it was not.`,
        ).not.toEqual(document.latestVersion.id);
        expect(supposedlyUpdatedDocument.latestVersion.content).toMatchObject(
          newContentMatching,
        );
        delete foundDocumentsById[document.id];
      },
    );

    // The updated and unmodified documents have now been deleted from the record.
    const supposedlyCreatedDocuments = Object.values(foundDocumentsById);
    expectedDocumentsState.created.forEach((contentMatching, index) => {
      expect(
        supposedlyCreatedDocuments.map(
          (supposedlyCreatedDocument) =>
            supposedlyCreatedDocument.latestVersion.content,
        ),
        `Document at created[${index}] should have been created, but it was not.`,
      ).toContainEqual(expect.objectContaining(contentMatching));
    });
  }

  ///////////////////////
  // say + aux methods //
  ///////////////////////

  async say(message: string): Promise<void> {
    if (this.conversation === null) {
      await this.startConversation(message);
    } else {
      await this.continueConversation(message);
    }
    await this.waitForIdleConversation();
  }

  private async startConversation(message: string) {
    const startConversationResult =
      await this.backend.assistants.startConversation(
        AssistantName.Factotum,
        ConversationFormat.Text,
        [{ type: MessageContentPartType.Text, text: message }],
      );
    assertSuccessfulResult(
      "Failed to start conversation",
      startConversationResult,
    );
    this.conversation = startConversationResult.data;
  }

  private async continueConversation(message: string) {
    const continueConversationResult =
      await this.backend.assistants.continueConversation(
        this.conversation!.id,
        [{ type: MessageContentPartType.Text, text: message }],
      );
    assertSuccessfulResult(
      "Failed to continue conversation",
      continueConversationResult,
    );
    this.conversation = continueConversationResult.data;
  }

  private async waitForIdleConversation() {
    this.conversation = await vi.waitUntil(() => this.getIdleConversation(), {
      timeout: 60_000,
    });
  }

  private async getIdleConversation(): Promise<Conversation | null> {
    const getConversationResult = await this.backend.assistants.getConversation(
      this.conversation!.id,
    );
    assertSuccessfulResult("Error getting conversation", getConversationResult);
    const { data: conversation } = getConversationResult;
    return conversation.status === ConversationStatus.Idle
      ? conversation
      : null;
  }

  //////////////////////////
  // assertAssistantReply //
  //////////////////////////

  async assertAssistantIs(
    expectedReplyDescription: string,
    scoreThreshold = 0.5,
  ): Promise<void> {
    assert.isNotNull(
      this.conversation,
      "You must say something before expecting a reply",
    );
    const lastMessage =
      this.conversation.messages[this.conversation.messages.length - 1];
    assertIsContentAssistantMessage(lastMessage);

    const reply = lastMessage.content[0].text;

    // EVOLUTION: pass in the context of the conversation, so that the evaluator
    // can do a better job.
    const { score, reason } = await this.evaluator.score(
      `
Consider this reply given by an LLM:

<reply>
${reply}
</reply>

How well does it satisfy this description of what the expected reply should be?

<expected-reply-description>
The LLM is ${expectedReplyDescription}
</expected-reply-description>

Give a score from 0 to 1 by calling the ${Evaluator.ToolName.GiveScore} tool.
      `
        .trim()
        .replaceAll(/^ {6}/gm, ""),
    );

    assert.isTrue(
      score >= scoreThreshold,
      [
        "Reply does not match expected reply description.",
        `Expected reply description: ${expectedReplyDescription}`,
        `Reply: ${reply}`,
        `Score: ${score}`,
        `Reason: ${reason}`,
        "",
      ].join("\n"),
    );
  }

  /////////////////////
  // getConversation //
  /////////////////////

  getConversation() {
    return this.conversation;
  }
}

namespace FactotumObject {
  export interface CollectionDefinition {
    name: string;
    description?: string | null;
    assistantInstructions?: string | null;
    schema: Schema;
    documentContents: object[];
  }

  export interface CreatedCollection {
    collection: Collection;
    documents: Document[];
  }

  export interface ExpectedDocumentsState {
    created: object[];
    updated: { document: Document; newContentMatching: object }[];
    unmodified: Document[];
  }
}

export default FactotumObject;
