import type { Backend, CollectionId, Conversation } from "@superego/backend";
import { assert } from "vitest";
import type { BooleanOracle } from "../../Dependencies.js";
import createCollection, {
  type CollectionDefinition,
} from "./createCollection.js";
import expectCollectionState, {
  type ExpectedDocumentsState,
} from "./expectCollectionState.js";
import expectReply from "./expectReply.js";
import say from "./say.js";

/** Why the name? Akin to https://martinfowler.com/bliki/PageObject.html */
export default class FactotumAssistantObject {
  private conversation: Conversation | null = null;
  constructor(
    private backend: Backend,
    private booleanOracle: BooleanOracle,
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
  }

  async replyMust(requirement: string): Promise<void> {
    assert.isNotNull(
      this.conversation,
      "You must say something before expecting a reply",
    );
    await expectReply(
      this.backend,
      this.booleanOracle,
      this.conversation.id,
      requirement,
    );
  }
}
