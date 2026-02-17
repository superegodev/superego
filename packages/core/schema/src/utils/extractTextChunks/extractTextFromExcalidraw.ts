import type JsonObject from "../../types/JsonObject.js";

export default function extractTextFromExcalidraw({
  elements,
}: JsonObject): string | null {
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
