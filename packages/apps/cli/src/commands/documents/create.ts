import type { DocumentDefinition } from "@superego/backend";
import * as v from "valibot";
import convertBase64ToUint8Array from "../utils/convertBase64ToUint8Array.js";
import createBackend from "../utils/createBackend.js";
import readJsonArgs from "../utils/readJsonArgs.js";

const argsSchema = v.tuple([
  v.object({
    collectionId: v.string(),
    content: v.any(),
    options: v.optional(v.object({ skipDuplicateCheck: v.boolean() })),
  }),
]);

export default async function documentsCreateAction(): Promise<void> {
  const args = await readJsonArgs();
  const [definition] = v.parse(argsSchema, args);

  convertBase64ToUint8Array(definition.content);

  const backend = createBackend();
  const result = await backend.documents.create(
    definition as unknown as DocumentDefinition,
  );

  process.stdout.write(JSON.stringify(result));
}
