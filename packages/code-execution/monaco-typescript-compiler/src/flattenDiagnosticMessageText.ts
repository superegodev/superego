import type * as monaco from "monaco-editor";

export default function flattenDiagnosticMessageText(
  diag: string | monaco.languages.typescript.DiagnosticMessageChain | undefined,
  indent = 0,
): string {
  // Handle case: diag is nullish.
  if (diag === undefined || diag === null) {
    return "";
  }

  // Handle case: diag is string.
  if (typeof diag === "string") {
    return diag;
  }

  // Handle case: diag is DiagnosticMessageChain.
  let result = "";

  // Add current message.
  if (indent > 0) {
    result += "\n";
    result += "  ".repeat(indent);
  }
  result += diag.messageText;

  // Add chained messages.
  if (diag.next) {
    for (const next of diag.next) {
      result += flattenDiagnosticMessageText(next, indent + 1);
    }
  }

  return result;
}
