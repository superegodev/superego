import type { CollectionId } from "@superego/backend";
import * as v from "valibot";
import createBackend from "../utils/createBackend.js";
import readJsonArgs from "../utils/readJsonArgs.js";

const argsSchema = v.tuple([
  v.nullable(v.string()),
  v.string(),
  v.object({ limit: v.number() }),
]);

export default async function documentsSearchAction(): Promise<void> {
  const args = await readJsonArgs();
  const [collectionId, query, options] = v.parse(argsSchema, args);

  const backend = createBackend();
  const result = await backend.documents.search(
    collectionId as CollectionId | null,
    query,
    options,
  );

  process.stdout.write(JSON.stringify(result));
}
