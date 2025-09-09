import {
  type Backend,
  type CollectionId,
  type Conversation,
  ConversationStatus,
} from "@superego/backend";
import { assert, vi } from "vitest";
import assertSuccessfulResult from "../../utils/assertSuccessfulResult.js";
import type Evaluator from "../../utils/Evaluator.js";
import createCollection, {
  type CollectionDefinition,
} from "./createCollection.js";
import expectCollectionState, {
  type ExpectedDocumentsState,
} from "./expectCollectionState.js";
import replyMustSatisfy from "./replyMustSatisfy.js";
import say from "./say.js";

/** Why the name? Akin to https://martinfowler.com/bliki/PageObject.html */
export default class FactotumObject {
  private conversation: Conversation | null = null;
  constructor(
    private backend: Backend,
    private evaluator: Evaluator,
  ) {}

  async createCollection(definition: CollectionDefinition) {
    return createCollection(this.backend, definition);
  }

  async expectCollectionState(
    collectionId: CollectionId,
    expectedDocumentsState: ExpectedDocumentsState,
  ) {
    await expectCollectionState(
      this.backend,
      collectionId,
      expectedDocumentsState,
    );
  }

  async say(message: string): Promise<void> {
    this.conversation = await say(
      this.backend,
      this.conversation?.id ?? null,
      message,
    );
    await this.waitForIdleConversation();
  }

  async replyMustSatisfy(
    requirements: string,
    scoreThreshold = 0.5,
  ): Promise<void> {
    assert.isNotNull(
      this.conversation,
      "You must say something before expecting a reply",
    );
    await replyMustSatisfy(
      this.evaluator,
      this.conversation,
      requirements,
      scoreThreshold,
    );
  }

  private async waitForIdleConversation() {
    this.conversation = await vi.waitUntil(() => this.getIdleConversation(), {
      timeout: 20_000,
      interval: 200,
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
}
