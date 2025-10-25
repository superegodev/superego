import dependenciesGlobalVar from "./dependenciesGlobalVar.js";

/**
 * Transpiles the ESM imports in the passed-in source code, turning them into
 * variable declarations "reading" from the global object `${dependenciesGlobalVar}`.
 * See tests for examples.
 */
export default function transpileImports(source: string): string {
  const importRegex = /^(\s*)import\s+([\s\S]*?)\s+from\s+["']([^"']+)["'];?/gm;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const transformed: string[] = [];

  while (true) {
    match = importRegex.exec(source);
    if (match === null) {
      break;
    }
    const [fullMatch = "", indent = "", clause = "", moduleSpecifier = ""] =
      match;
    const startIndex = match.index;
    const endIndex = startIndex + fullMatch.length;

    transformed.push(source.slice(lastIndex, startIndex));
    transformed.push(buildReplacement(clause, moduleSpecifier, indent ?? ""));

    lastIndex = endIndex;
  }

  transformed.push(source.slice(lastIndex));

  return transformed.join("");
}

type ParsedImportClause = {
  defaultImport?: string;
  namespaceImport?: string;
  namedImports: NamedImportSpecifier[];
} | null;

type NamedImportSpecifier = {
  imported: string;
  local: string;
};

function buildReplacement(
  clause: string,
  moduleSpecifier: string,
  indent: string,
): string {
  const parsed = parseImportClause(clause);
  if (!parsed) {
    return "";
  }

  const statements: string[] = [];

  if (parsed.defaultImport) {
    statements.push(
      `${indent}const ${parsed.defaultImport} = ${dependenciesGlobalVar}["${moduleSpecifier}"];`,
    );
  }

  if (parsed.namespaceImport) {
    statements.push(
      `${indent}const ${parsed.namespaceImport} = ${dependenciesGlobalVar}["${moduleSpecifier}"];`,
    );
  }

  if (parsed.namedImports.length > 0) {
    const specifiers = parsed.namedImports
      .map(({ imported, local }) =>
        imported === local ? imported : `${imported}: ${local}`,
      )
      .join(", ");
    statements.push(
      `${indent}const { ${specifiers} } = ${dependenciesGlobalVar}["${moduleSpecifier}"];`,
    );
  }

  return statements.join("\n");
}

function parseImportClause(clause: string): ParsedImportClause {
  const trimmed = clause.trim();

  if (trimmed === "" || trimmed.startsWith("type ")) {
    return null;
  }

  let rest = trimmed;
  const result: Exclude<ParsedImportClause, null> = {
    namedImports: [],
  };

  if (!rest.startsWith("{") && !rest.startsWith("*")) {
    const commaIndex = rest.indexOf(",");
    const defaultSegment = commaIndex === -1 ? rest : rest.slice(0, commaIndex);
    const defaultName = defaultSegment.trim();

    if (defaultName && !defaultName.startsWith("type")) {
      const defaultIdentifierMatch = defaultName.match(/^[A-Za-z_$][\w$]*$/);
      if (defaultIdentifierMatch) {
        result.defaultImport = defaultIdentifierMatch[0];
      }
    } else if (defaultName.startsWith("type")) {
      return null;
    }

    rest = commaIndex === -1 ? "" : rest.slice(commaIndex + 1);
  }

  rest = rest.trim();

  if (rest === "") {
    return result;
  }

  if (rest.startsWith("*")) {
    const namespaceMatch = rest.match(/^\*\s+as\s+([A-Za-z_$][\w$]*)$/);
    if (namespaceMatch) {
      result.namespaceImport = namespaceMatch[1];
    }
    return result;
  }

  if (rest.startsWith("{")) {
    const closingIndex = rest.lastIndexOf("}");
    if (closingIndex === -1) {
      return result;
    }

    const namedContent = rest.slice(1, closingIndex).trim();
    if (namedContent === "") {
      return result;
    }

    const specifiers = namedContent
      .split(",")
      .map((specifier) => specifier.trim())
      .filter(Boolean);

    for (const specifier of specifiers) {
      if (specifier.startsWith("type ")) {
        continue;
      }

      const aliasMatch = specifier.match(
        /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/,
      );

      if (aliasMatch) {
        const imported = aliasMatch[1];
        const local = aliasMatch[2];
        if (!imported || !local) {
          continue;
        }

        if (imported === "default") {
          if (!result.defaultImport) {
            result.defaultImport = local;
          }
        } else {
          result.namedImports.push({ imported, local });
        }
        continue;
      }

      const defaultOnlyMatch = specifier.match(/^default$/);
      if (defaultOnlyMatch) {
        continue;
      }

      const identifierMatch = specifier.match(/^[A-Za-z_$][\w$]*$/);
      if (identifierMatch && identifierMatch[0]) {
        const identifier = identifierMatch[0];
        result.namedImports.push({ imported: identifier, local: identifier });
      }
    }

    return result;
  }

  return result;
}
