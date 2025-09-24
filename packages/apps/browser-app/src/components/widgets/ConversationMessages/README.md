# Note on who renders what

- `Message.User` messages are always rendered with a `UserMessage`.
- `Message.ContentAssistant` messages are always rendered with an
  `AssistantContentMessage`.
- Tool calls in `Message.ToolCallAssistant` messages are grouped with the
  corresponding tool result from a `Message.Tool` message (if found), and are
  rendered with a `ToolCallResult`, if `showToolCalls` is true.
- `Message.Tool` messages are rendered with a `ToolMessage`, that renders
  something **only** for successful tool results that produced a side effect.

Additionally, some tools return to the assistant a markdown snippet that the
assistant can use to _inline_ the tool result in its message. These tool results
are rendered by the `AssistantContentMessage` component.
