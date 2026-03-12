import type { CollectionId } from "@superego/backend";
import * as v from "valibot";
import createBackend from "../utils/createBackend.js";
import readJsonArgs from "../utils/readJsonArgs.js";

const argsSchema = v.tuple([v.string()]);

export default async function documentsListAction(): Promise<void> {
  const args = await readJsonArgs();
  const [collectionId] = v.parse(argsSchema, args);

  const backend = createBackend();
  const result = await backend.documents.list(collectionId as CollectionId);

  process.stdout.write(JSON.stringify(result));
}
