import type * as monaco from "monaco-editor";

export default function stringifyDiagnostic(
  diagnostic: monaco.languages.typescript.Diagnostic,
  model: monaco.editor.ITextModel,
  basePath: string,
): string {
  const parts: string[] = [];

  // Add file location with line:column.
  if (diagnostic.file) {
    const fileName = diagnostic.file.fileName.replace(`vfs:/${basePath}`, "");
    if (diagnostic.start !== undefined) {
      const { lineNumber, column } = model.getPositionAt(diagnostic.start);
      parts.push(`${fileName}:${lineNumber}:${column}`);
    } else {
      parts.push(fileName);
    }
  }

  // Add error code and category.
  const category =
    diagnostic.category === 1
      ? "error"
      : diagnostic.category === 2
        ? "warning"
        : "message";
  parts.push(`${category} TS${diagnostic.code}:`);

  // Add the flattened message.
  parts.push(flattenDiagnosticMessageText(diagnostic.messageText));

  return parts.join(" ");
}

function flattenDiagnosticMessageText(
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
    result += "    ".repeat(indent);
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
