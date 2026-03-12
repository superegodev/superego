import type { CollectionId, DocumentId } from "@superego/backend";
import * as v from "valibot";
import createBackend from "../utils/createBackend.js";
import readJsonArgs from "../utils/readJsonArgs.js";

const argsSchema = v.tuple([v.string(), v.string()]);

export default async function documentsGetAction(): Promise<void> {
  const args = await readJsonArgs();
  const [collectionId, id] = v.parse(argsSchema, args);

  const backend = createBackend();
  const result = await backend.documents.get(
    collectionId as CollectionId,
    id as DocumentId,
  );

  process.stdout.write(JSON.stringify(result));
}
