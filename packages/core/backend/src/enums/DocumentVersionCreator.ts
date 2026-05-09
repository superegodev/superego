import * as v from "valibot";

enum DocumentVersionCreator {
  User = "User",
  Migration = "Migration",
  Assistant = "Assistant",
  Connector = "Connector",
}
export default DocumentVersionCreator;

export const DocumentVersionCreatorSchema = v.enum(DocumentVersionCreator);
