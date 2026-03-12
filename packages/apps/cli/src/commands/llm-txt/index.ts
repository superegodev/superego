import { DataType, formats } from "@superego/schema";
import SchemaTypescriptSchema from "@superego/schema/SchemaTypescriptSchema";
import llmTxtMd from "./llm-txt.md?raw";

export default function llmTxtAction(): void {
  const output = llmTxtMd
    .replaceAll("$SUPEREGO_SCHEMA_TYPESCRIPT_SCHEMA", SchemaTypescriptSchema)
    .replaceAll(
      "$WELL_KNOWN_FORMATS_STRINGS",
      wellKnownFormats(DataType.String),
    )
    .replaceAll(
      "$WELL_KNOWN_FORMATS_NUMBERS",
      wellKnownFormats(DataType.Number),
    )
    .replaceAll(
      "$WELL_KNOWN_FORMATS_JSON_OBJECTS",
      wellKnownFormats(DataType.JsonObject),
    );

  process.stdout.write(output);
}

function wellKnownFormats(dataType: DataType): string {
  return formats
    .filter((format) => format.dataType === dataType)
    .map((format) => `- \`${format.id}\`: ${format.description}`)
    .join("\n");
}
