import DataType from "../DataType.js";
import formats from "../formats/formats.js";
import type Schema from "../Schema.js";
import type { AnyTypeDefinition, EnumMember } from "../typeDefinitions.js";
import findFormat from "../utils/findFormat.js";
import joinLines from "../utils/joinLines.js";
import generateBuiltInTypes from "./generateBuiltInTypes.js";
import indent from "./indent.js";
import makeTsDoc from "./makeTsDoc.js";
import type ReferencedBuiltInTypes from "./ReferencedBuiltInTypes.js";

function generateEnumMemberTsDoc({ description }: EnumMember): string {
  return description ? makeTsDoc(description) : "";
}

function generateTypeDefinitionTsDoc(
  typeDefinition: AnyTypeDefinition,
  isRootType: boolean,
): string {
  const commentLines: string[] = [];
  if (typeDefinition.description) {
    commentLines.push(typeDefinition.description);
  }
  if ("format" in typeDefinition) {
    const format = findFormat(typeDefinition, formats);
    if (format) {
      commentLines.push(
        "",
        `#### Format \`${format.id}\``,
        "",
        format.description,
        "",
        "Format examples:",
        ...format.validExamples
          .slice(0, 2)
          .map((example) => `- ${JSON.stringify(example)}`),
      );
    }
  }
  if (isRootType) {
    commentLines.push("", "Note: This is the root type of this schema.");
  }
  return commentLines.length > 0
    ? makeTsDoc(joinLines(commentLines).trim())
    : "";
}

function generateType(
  typeDefinition: AnyTypeDefinition,
  schema: Schema,
  referencedBuiltInTypes: ReferencedBuiltInTypes,
): string {
  switch (typeDefinition.dataType) {
    case DataType.String:
      return "string";
    case DataType.Enum: {
      const lines = joinLines(
        Object.entries(typeDefinition.members).map(([_memberName, member]) => {
          const memberTsDoc = indent(generateEnumMemberTsDoc(member));
          return `${memberTsDoc}  | ${JSON.stringify(member.value)}`;
        }),
      );
      return `\n${lines}`;
    }
    case DataType.Number:
      return "number";
    case DataType.Boolean:
      return "boolean";
    case DataType.StringLiteral:
      return JSON.stringify(typeDefinition.value);
    case DataType.NumberLiteral:
      return `${typeDefinition.value}`;
    case DataType.BooleanLiteral:
      return `${typeDefinition.value}`;
    case DataType.JsonObject:
      referencedBuiltInTypes.add("JsonObject");
      return "JsonObject";
    case DataType.File:
      referencedBuiltInTypes.add("File");
      return "ProtoFile | FileRef";
    case DataType.Struct: {
      const properties = joinLines(
        Object.entries(typeDefinition.properties).map(
          ([propertyName, propertyTypeDefinition]) => {
            const isNullable =
              typeDefinition.nullableProperties?.includes(propertyName);
            const tsDoc = generateTypeDefinitionTsDoc(
              propertyTypeDefinition,
              false,
            );
            const typeString = generateType(
              propertyTypeDefinition,
              schema,
              referencedBuiltInTypes,
            );
            return `${tsDoc}${propertyName}: ${typeString}${isNullable ? " | null" : ""};`;
          },
        ),
      );
      return joinLines(["{", indent(properties), "}"]);
    }
    case DataType.List: {
      const itemsType = generateType(
        typeDefinition.items,
        schema,
        referencedBuiltInTypes,
      );
      return `Array<${itemsType}>`;
    }
    case null:
      return typeDefinition.ref;
  }
}

/**
 * Generates the type declaration of a schema type. That is,
 * `export type $TYPE;` or `export enum $ENUM`.
 */
function generateTypeDeclaration(
  typeName: string,
  typeDefinition: AnyTypeDefinition,
  isRootType: boolean,
  schema: Schema,
  referencedBuiltInTypes: ReferencedBuiltInTypes,
): string {
  const tsDoc = generateTypeDefinitionTsDoc(typeDefinition, isRootType);
  const type = generateType(typeDefinition, schema, referencedBuiltInTypes);
  return `${tsDoc}export type ${typeName} = ${type};`;
}

export default function codegen(schema: Schema): string {
  const referencedBuiltInTypes: ReferencedBuiltInTypes = new Set();
  const compiledTypeDefinitions = Object.entries(schema.types)
    .map(([typeName, typeDefinition]) =>
      generateTypeDeclaration(
        typeName,
        typeDefinition,
        typeName === schema.rootType,
        schema,
        referencedBuiltInTypes,
      ),
    )
    .join("\n\n");
  return joinLines([
    ...(referencedBuiltInTypes.size !== 0
      ? [
          "/////////////////////////////",
          "// Superego built-in types //",
          "/////////////////////////////",
          generateBuiltInTypes(referencedBuiltInTypes),
        ]
      : []),
    "//////////////////",
    "// Schema types //",
    "//////////////////",
    "",
    compiledTypeDefinitions,
    "",
  ]);
}
