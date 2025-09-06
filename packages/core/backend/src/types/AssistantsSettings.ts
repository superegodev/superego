import type AssistantName from "../enums/AssistantName.js";

export default interface AssistantsSettings {
  developerPrompts: {
    [assistant in AssistantName]: string | null;
  };
}
