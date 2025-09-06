import type AssistantName from "../enums/AssistantName.js";

type DeveloperPrompts = {
  [assistant in AssistantName]: string;
};
export default DeveloperPrompts;
