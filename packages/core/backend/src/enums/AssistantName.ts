import * as v from "valibot";

enum AssistantName {
  CollectionCreator = "CollectionCreator",
  Factotum = "Factotum",
}
export default AssistantName;

export const AssistantNameSchema = v.enum(AssistantName);
