enum ConversationStatus {
  /*
   * State of the conversation:
   *
   * - All past messages have been processed.
   * - The last message in the `messages` array is an assistant message.
   * - The user can **continue** the conversation (by sending a new message).
   * - The user cannot **recover** the conversation.
   */
  Idle = "Idle",
  /**
   * State of the conversation:
   *
   * - A message has been sent by the user and it's being processed.
   * - The last message in the `messages` array is a user message.
   * - The user cannot **continue** the conversation.
   * - The user can **recover** the conversation only when last message is "old
   *   enough", which suggests that processing failed silently.
   */
  Processing = "Processing",
  /**
   * State of the conversation:
   *
   * - A message was sent by the user and its processing failed.
   * - Error details are attached to the conversation.
   * - The last message in the `messages` array is a user message.
   * - The user cannot **continue** the conversation.
   * - The user can **recover** the conversation.
   */
  Error = "Error",
}
export default ConversationStatus;
