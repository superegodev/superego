import { DataType, formats } from "@superego/schema";
import SchemaTypescriptSchema from "@superego/schema/SchemaTypescriptSchema";
import agentsMd from "./agent-instructions/AGENTS.md?raw";
import writingCollectionSchemasMd from "./agent-instructions/writing-collection-schemas.md?raw";
import writingCollectionViewAppsMd from "./agent-instructions/writing-collection-view-apps.md?raw";
import writingContentBlockingKeysGettersMd from "./agent-instructions/writing-content-blocking-keys-getters.md?raw";
import writingContentSummaryGettersMd from "./agent-instructions/writing-content-summary-getters.md?raw";
import writingDefaultDocumentViewUiOptionsMd from "./agent-instructions/writing-default-document-view-ui-options.md?raw";

export default [
  { path: "AGENTS.md", content: agentsMd },
  {
    path: ".agents/skills/writing-collection-schemas/SKILL.md",
    content: writingCollectionSchemasMd
      .replaceAll("\n<!-- prettier-ignore-start -->", "")
      .replaceAll("\n<!-- prettier-ignore-end -->", "")
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
      ),
  },
  {
    path: ".agents/skills/writing-collection-view-apps/SKILL.md",
    content: writingCollectionViewAppsMd,
  },
  {
    path: ".agents/skills/writing-content-blocking-keys-getters/SKILL.md",
    content: writingContentBlockingKeysGettersMd,
  },
  {
    path: ".agents/skills/writing-content-summary-getters/SKILL.md",
    content: writingContentSummaryGettersMd,
  },
  {
    path: ".agents/skills/writing-default-document-view-ui-options/SKILL.md",
    content: writingDefaultDocumentViewUiOptionsMd,
  },
];

function wellKnownFormats(dataType: DataType): string {
  return formats
    .filter((format) => format.dataType === dataType)
    .map((format) => `- \`${format.id}\`: ${format.description}`)
    .join("\n");
}
