import { generateText, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import removeMarkdown from "remove-markdown";
import DataType from "../DataType.js";
import FormatId from "../formats/FormatId.js";
import type Schema from "../Schema.js";
import type { AnyTypeDefinition } from "../typeDefinitions.js";
import type JsonObject from "../types/JsonObject.js";
import getRootType from "./getRootType.js";
import getType from "./getType.js";

export interface TextChunks {
  [path: string]: string[];
}

/**
 * Extracts text chunks from document content according to the schema.
 *
 * Text chunks are extracted from:
 *
 * - String properties that DON'T have date/time formats (PlainDate, PlainTime,
 *   Instant).
 * - JsonObject properties with TiptapRichText format.
 *
 * For List properties, the path uses "$" to indicate "each element index"
 * (e.g., `a.b.$.c` for elements inside a list).
 */
export default function extractTextChunks(
  schema: Schema,
  content: any,
): TextChunks {
  const chunks: TextChunks = {};
  _extractTextChunks(schema, content, getRootType(schema), [], chunks);
  return chunks;
}

const nonTextStringFormats = new Set<string>([
  FormatId.String.PlainDate,
  FormatId.String.PlainTime,
  FormatId.String.Instant,
]);

function _extractTextChunks(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  pathSegments: string[],
  chunks: TextChunks,
): void {
  if (value === null) {
    return;
  }

  // Resolve type refs.
  if ("ref" in typeDefinition) {
    _extractTextChunks(
      schema,
      value,
      getType(schema, typeDefinition),
      pathSegments,
      chunks,
    );
    return;
  }

  const path = pathSegments.join(".");

  if (typeDefinition.dataType === DataType.String) {
    if (
      typeDefinition.format &&
      nonTextStringFormats.has(typeDefinition.format)
    ) {
      return;
    }
    if (typeDefinition.format === FormatId.String.Markdown) {
      const text = removeMarkdown(value);
      addChunk(chunks, path, text);
    } else {
      addChunk(chunks, path, value);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.JsonObject) {
    if (typeDefinition.format === FormatId.JsonObject.TiptapRichText) {
      const text = extractTextFromTiptap(value);
      if (text) {
        addChunk(chunks, path, text);
      }
    }
    if (typeDefinition.format === FormatId.JsonObject.ExcalidrawDrawing) {
      const text = extractTextFromExcalidraw(value);
      if (text) {
        addChunk(chunks, path, text);
      }
    }
    return;
  }

  if (typeDefinition.dataType === DataType.Struct) {
    for (const [propertyName, propertyTypeDefinition] of Object.entries(
      typeDefinition.properties,
    )) {
      _extractTextChunks(
        schema,
        value[propertyName],
        propertyTypeDefinition,
        [...pathSegments, propertyName],
        chunks,
      );
    }
    return;
  }

  if (typeDefinition.dataType === DataType.List) {
    // For list items, use "$" in path instead of individual indices, and merge
    // all items' text into a single array at the path with "$".
    const listPath = [...pathSegments, "$"];
    for (const item of value as any[]) {
      _extractTextChunks(schema, item, typeDefinition.items, listPath, chunks);
    }
    return;
  }
}

function addChunk(chunks: TextChunks, path: string, text: string): void {
  if (!chunks[path]) {
    chunks[path] = [];
  }
  chunks[path].push(text);
}

function extractTextFromTiptap(jsonObject: JsonObject): string {
  const { __dataType, ...tiptapContent } = jsonObject;
  return generateText(tiptapContent as JSONContent, [StarterKit], {
    blockSeparator: "\n",
  });
}

function extractTextFromExcalidraw({ elements }: JsonObject): string | null {
  if (!Array.isArray(elements)) {
    return null;
  }
  return elements
    .map((element: unknown) =>
      typeof element === "object" &&
      element != null &&
      "type" in element &&
      element.type === "text" &&
      "text" in element &&
      typeof element.text === "string"
        ? element.text
        : null,
    )
    .filter((text) => text !== null)
    .join(" ");
}
