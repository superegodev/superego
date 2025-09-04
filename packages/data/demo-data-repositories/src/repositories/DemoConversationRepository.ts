import type { ConversationId } from "@superego/backend";
import type {
  ConversationEntity,
  ConversationRepository,
} from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoConversationRepository
  extends Disposable
  implements ConversationRepository
{
  constructor(
    private conversations: Data["conversations"],
    private onWrite: () => void,
  ) {
    super();
  }

  async upsert(conversation: ConversationEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.conversations[conversation.id] = clone(conversation);
  }

  async delete(id: ConversationId): Promise<ConversationId> {
    this.ensureNotDisposed();
    this.onWrite();
    delete this.conversations[id];
    return id;
  }

  async exists(id: ConversationId): Promise<boolean> {
    this.ensureNotDisposed();
    return this.conversations[id] !== undefined;
  }

  async find(id: ConversationId): Promise<ConversationEntity | null> {
    this.ensureNotDisposed();
    return clone(this.conversations[id] ?? null);
  }

  async findAll(): Promise<ConversationEntity[]> {
    this.ensureNotDisposed();
    return clone(
      Object.values(this.conversations).sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : 1,
      ),
    );
  }
}
