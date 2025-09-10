import type AssistantName from "../enums/AssistantName.js";

export default interface AssistantsSettings {
  userName: string | null;
  // EVOLUTION: preferences.
  // EVOLUTION: prompts by model.
  developerPrompts: {
    [assistant in AssistantName]: string | null;
  };
}
