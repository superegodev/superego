import {
  CompletionModel,
  type Conversation,
  ConversationType,
  MessagePartType,
  Theme,
} from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/browser";
import { RoutingAssistantManager } from "@superego/routing-assistant-manager";
import { QueryClient } from "@tanstack/react-query";
import { renderBrowserApp } from "../src/index.js";
import last from "../src/utils/last.js";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager({
    appearance: { theme: Theme.Auto },
    assistant: {
      providers: { groq: { apiKey: null, baseUrl: null } },
      completions: { defaultModel: CompletionModel.GroqKimiK2Instruct },
    },
  }),
  new QuickjsJavascriptSandbox(),
  new RoutingAssistantManager(),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: "always",
    },
    mutations: {
      networkMode: "always",
    },
  },
});

renderBrowserApp(backend, queryClient);

class DevAssistant {
  private conversation: Conversation | null = null;

  async say(message: string) {
    const messagePart = {
      type: MessagePartType.Text,
      content: message,
      contentType: "text/plain",
    } as const;
    const result =
      this.conversation === null
        ? await backend.assistant.startConversation(
            ConversationType.Text,
            messagePart,
          )
        : await backend.assistant.continueConversation(
            this.conversation.id,
            messagePart,
          );
    if (result.error) {
      console.log("ERROR CALLING BACKEND");
      console.log(result.error);
      return;
    }
    this.conversation = result.data;
    console.log(this.conversation);
    this.logLastMessage();
  }

  private logLastMessage() {
    const conversation = this.conversation!;
    if (conversation.nextMessageGenerationError) {
      console.log("NEXT MESSAGE GENERATION ERROR");
      console.log(conversation.nextMessageGenerationError);
      return;
    }
    console.log("RESPONSE");
    const lastMessage = last(conversation.messages);
    lastMessage?.parts.forEach((part) => {
      if (part.type === MessagePartType.Text) {
        console.log("Text part");
        console.log(part.content);
      }
      if (part.type === MessagePartType.DocumentCreated) {
        console.log("DocumentCreated part");
        console.log(part.documentContent);
      }
    });
  }
}
(window as any).assistant = new DevAssistant();
