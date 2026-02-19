import type { DocumentDefinition } from "@superego/backend";
import * as v from "valibot";
import convertBase64ToUint8Array from "../utils/convertBase64ToUint8Array.js";
import createBackend from "../utils/createBackend.js";
import readJsonArgs from "../utils/readJsonArgs.js";

const argsSchema = v.tuple([
  v.array(
    v.object({
      collectionId: v.string(),
      content: v.any(),
      options: v.optional(v.object({ skipDuplicateCheck: v.boolean() })),
    }),
  ),
]);

export default async function documentsCreateManyAction(): Promise<void> {
  const args = await readJsonArgs();
  const [definitions] = v.parse(argsSchema, args);

  for (const definition of definitions) {
    convertBase64ToUint8Array(definition.content);
  }

  const backend = createBackend();
  const result = await backend.documents.createMany(
    definitions as unknown as DocumentDefinition[],
  );

  process.stdout.write(JSON.stringify(result));
}
