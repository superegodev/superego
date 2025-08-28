import type { Message } from "@superego/backend";
import Markdown from "markdown-to-jsx";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.ContentAssistant;
}
export default function AssistantContentMessage({ message }: Props) {
  return (
    <div className={cs.AssistantContentMessage.root}>
      {message.content.map(({ text }) => (
        <Markdown
          key={text}
          options={{
            overrides: {
              iframe: () => null,
              a: { props: { target: "_blank", rel: "noopener noreferrer" } },
            },
          }}
        >
          {text}
        </Markdown>
      ))}
    </div>
  );
}
