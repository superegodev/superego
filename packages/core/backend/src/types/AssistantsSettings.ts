import type AssistantName from "../enums/AssistantName.js";

export default interface AssistantsSettings {
  userInfo: string | null;
  userPreferences: string | null;
  developerPrompts: {
    [assistant in AssistantName]: string | null;
  };
}
