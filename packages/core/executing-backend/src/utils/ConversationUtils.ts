import {
  type Collection,
  type ConversationNode,
  type ConversationNodeId,
  type Message,
  MessageRole,
  ToolName,
} from "@superego/backend";
import sha256 from "./sha256.js";

function getActiveBranchNodes(
  nodes: ConversationNode[],
  activeNodeId: ConversationNodeId | null,
): ConversationNode[] {
  if (activeNodeId === null) {
    return [];
  }
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const branch: ConversationNode[] = [];
  let currentNodeId: ConversationNodeId | null = activeNodeId;
  while (currentNodeId !== null) {
    const node = nodesById.get(currentNodeId);
    if (!node) {
      break;
    }
    branch.push(node);
    currentNodeId = node.previousNodeId;
  }
  return branch.reverse();
}

export default {
  getActiveBranchNodes(
    nodes: ConversationNode[],
    activeNodeId: ConversationNodeId | null,
  ): ConversationNode[] {
    return getActiveBranchNodes(nodes, activeNodeId);
  },

  getActiveBranchMessages(
    nodes: ConversationNode[],
    activeNodeId: ConversationNodeId | null,
  ): Message[] {
    return getActiveBranchNodes(nodes, activeNodeId).flatMap((node) =>
      node.type === "Message" ? [node.message] : [],
    );
  },

  findLastUserNode(
    nodes: ConversationNode[],
    activeNodeId: ConversationNodeId | null,
  ): ConversationNode.MessageNode | null {
    const branchNodes = getActiveBranchNodes(nodes, activeNodeId);
    for (let i = branchNodes.length - 1; i >= 0; i--) {
      const node = branchNodes[i]!;
      if (node.type === "Message" && node.message.role === MessageRole.User) {
        return node;
      }
    }
    return null;
  },

  /**
   * Checks if the last response (i.e., all messages since the last user
   * message) had any side effects.
   */
  lastResponseHadSideEffects(messages: Message[]): boolean {
    const toolMessages: Message.Tool[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]!;
      if (message.role === MessageRole.User) {
        break;
      }
      if (message.role === MessageRole.Tool) {
        toolMessages.push(message);
      }
    }

    return toolMessages.some((message) =>
      message.toolResults.some(
        (toolResult) =>
          toolResult.output.success &&
          (toolResult.tool === ToolName.CreateDocuments ||
            toolResult.tool === ToolName.CreateNewDocumentVersion),
      ),
    );
  },

  /**
   * Removes all messages since the last user message, i.e., the last response.
   */
  sliceOffLastResponse(messages: Message[]): Message[] {
    const lastUserMessageIndex = messages.findLastIndex(
      (message) => message.role === MessageRole.User,
    );
    return messages.slice(0, lastUserMessageIndex + 1);
  },

  getContextFingerprint(collections: Collection[]): Promise<string> {
    return sha256(
      collections.map((collection) => collection.latestVersion.id).join(""),
    );
  },
};
