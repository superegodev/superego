import * as v from "valibot";
import createBackend from "../utils/createBackend.js";
import readJsonArgs from "../utils/readJsonArgs.js";

const argsSchema = v.tuple([]);

export default async function collectionsListAction(): Promise<void> {
  const args = await readJsonArgs();
  v.parse(argsSchema, args);

  const backend = createBackend();
  const result = await backend.collections.list();

  process.stdout.write(JSON.stringify(result));
}
