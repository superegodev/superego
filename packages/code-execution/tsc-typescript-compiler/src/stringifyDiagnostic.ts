import ts from "typescript";

export default function stringifyDiagnostic(diagnostic: ts.Diagnostic): string {
  const parts: string[] = [];

  // Add file location with line and column.
  if (diagnostic.file && diagnostic.start !== undefined) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start,
    );
    const fileName = diagnostic.file.fileName;
    parts.push(`${fileName}:${line + 1}:${character + 1}`);
  }

  // Add error code and category.
  const category =
    diagnostic.category === ts.DiagnosticCategory.Error
      ? "error"
      : diagnostic.category === ts.DiagnosticCategory.Warning
        ? "warning"
        : "message";
  parts.push(`${category} TS${diagnostic.code}:`);

  // Format the message text (handle nested messages).
  const message = ts.flattenDiagnosticMessageText(
    diagnostic.messageText,
    "\n  ",
  );
  parts.push(message);

  return parts.join(" ");
}
