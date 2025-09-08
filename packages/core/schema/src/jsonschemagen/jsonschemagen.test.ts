import { readdirSync } from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { JSONSchema7 } from "json-schema";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import schema from "../valibot-schemas/schema/schema.js";
import jsonschemagen from "./jsonschemagen.js";

describe("generates JSON Schema from a schema", () => {
  const testSchemasDir = `${__dirname}/../test-schemas`;
  const schemaExtension = ".schema.ts";
  const generatedExtension = ".generated.json";
  it.each(
    readdirSync(testSchemasDir).filter((file) =>
      file.endsWith(schemaExtension),
    ),
  )("case: %s", async (schemaFile) => {
    // Setup SUT
    const schemaName = schemaFile.replace(schemaExtension, "");
    const { default: testSchema } = await import(
      `${testSchemasDir}/${schemaFile}`
    );
    // Ensure that the test schema is valid.
    expect(v.is(schema(), testSchema)).toEqual(true);

    // Exercise
    const jsonSchema = jsonschemagen(testSchema);

    // Verify
    expect(validateJsonSchema(jsonSchema)).toEqual([]);
    await expect(JSON.stringify(jsonSchema, null, 2)).toMatchFileSnapshot(
      `${testSchemasDir}/${schemaName}${generatedExtension}`,
    );
  });
});

function validateJsonSchema(jsonSchema: JSONSchema7) {
  const ajv = new Ajv({ strict: true, allErrors: true });
  addFormats(ajv);
  const isValid = ajv.validateSchema(jsonSchema);
  return isValid ? [] : ajv.errors;
}
