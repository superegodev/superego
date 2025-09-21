import type { Conversation, Message } from "@superego/backend";
import Markdown from "markdown-to-jsx";
import { Separator } from "react-aria-components";
import * as cs from "../ConversationMessages.css.js";
import ThinkingTime from "../ThinkingTime.jsx";
import RetryButton from "./RetryButton.jsx";
import SpeakButton from "./SpeakButton.jsx";

interface Props {
  conversation: Conversation;
  message: Message.ContentAssistant;
}
export default function AssistantContentMessage({
  conversation,
  message,
}: Props) {
  const [textPart] = message.content;
  return (
    <div className={cs.AssistantContentMessage.root}>
      <Markdown
        key={textPart.text}
        className={cs.AssistantContentMessage.markdown}
        options={{
          overrides: {
            iframe: () => null,
            a: { props: { target: "_blank", rel: "noopener noreferrer" } },
            table: (props) => (
              <div className={cs.AssistantContentMessage.markdownTableScroller}>
                <table {...props} />
              </div>
            ),
          },
        }}
      >
        {textPart.text}
      </Markdown>
      <div className={cs.AssistantContentMessage.infoAndActions}>
        <ThinkingTime message={message} conversation={conversation} />
        <Separator
          orientation="vertical"
          className={cs.AssistantContentMessage.infoAndActionsSeparator}
        />
        <SpeakButton
          message={message}
          className={cs.AssistantContentMessage.infoAndActionsAction}
        />
        <RetryButton
          conversation={conversation}
          message={message}
          className={cs.AssistantContentMessage.infoAndActionsAction}
        />
      </div>
    </div>
  );
}
