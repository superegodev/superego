import {
  AssistantName,
  CompletionModel,
  type Conversation,
  ConversationFormat,
  type Message,
  MessageContentPartType,
  Theme,
} from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { RoutingInferenceServiceFactory } from "@superego/inference-services";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/browser";
import { QueryClient } from "@tanstack/react-query";
import { renderBrowserApp } from "../src/index.js";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager({
    appearance: { theme: Theme.Auto },
    assistant: {
      providers: { groq: { apiKey: null, baseUrl: null } },
      completions: { defaultModel: CompletionModel.GroqKimiK2Instruct },
    },
  }),
  new QuickjsJavascriptSandbox(),
  new RoutingInferenceServiceFactory(),
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

// TODO: remove
class DevAssistant {
  private conversation: Conversation | null = null;

  async say(message: string) {
    const messageContent: Message.User["content"] = [
      {
        type: MessageContentPartType.Text,
        text: message,
      },
    ];
    const result =
      this.conversation === null
        ? await backend.assistants.startConversation(
            AssistantName.DocumentCreator,
            ConversationFormat.Text,
            messageContent,
          )
        : await backend.assistants.continueConversation(
            this.conversation.id,
            messageContent,
          );
    if (result.error) {
      console.log("ERROR CALLING BACKEND");
      console.log(result.error);
      return;
    }
    this.conversation = result.data;
    console.log(this.conversation);
  }
}
(window as any).assistant = new DevAssistant();
