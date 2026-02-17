import type JsonObject from "../../types/JsonObject.js";

export default function extractTextFromTiptap(jsonObject: JsonObject): string {
  return extractText(jsonObject as unknown as TiptapNode);
}

interface TiptapNode {
  type: string;
  text?: string;
  content?: TiptapNode[];
}

const inlineTypes = new Set(["text", "hardBreak"]);

function extractText(node: TiptapNode): string {
  if (node.type === "text") {
    return node.text ?? "";
  }

  if (node.type === "hardBreak") {
    return " ";
  }

  if (!Array.isArray(node.content)) {
    return "";
  }

  const childTexts = node.content
    .map((child) => extractText(child))
    .filter((text) => text !== "");
  const hasBlockChildren = node.content.some(
    (child) => !inlineTypes.has(child.type),
  );
  return childTexts.join(hasBlockChildren ? " " : "");
}
