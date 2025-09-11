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
  llmVariant: boolean,
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
        `## Format \`${format.id}\``,
        "",
        llmVariant && format.llmDescription
          ? format.llmDescription
          : format.description,
        "",
        "### Examples",
        "",
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
  llmVariant: boolean,
  referencedBuiltInTypes: ReferencedBuiltInTypes,
): string {
  switch (typeDefinition.dataType) {
    case DataType.String:
      return "string";
    case DataType.Enum: {
      if (llmVariant) {
        const lines = joinLines(
          Object.entries(typeDefinition.members).map(
            ([_memberName, member]) => {
              const memberTsDoc = indent(generateEnumMemberTsDoc(member));
              return `${memberTsDoc}  | ${JSON.stringify(member.value)}`;
            },
          ),
        );
        return `\n${lines}`;
      }
      const members = joinLines(
        Object.entries(typeDefinition.members).map(([memberName, member]) => {
          const memberTsDoc = generateEnumMemberTsDoc(member);
          return `${memberTsDoc}${memberName} = ${JSON.stringify(member.value)},`;
        }),
      );
      return joinLines(["{", indent(members), "}"]);
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
              llmVariant,
            );
            const typeString = generateType(
              propertyTypeDefinition,
              schema,
              llmVariant,
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
        llmVariant,
        referencedBuiltInTypes,
      );
      return `${itemsType}[]`;
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
  llmVariant: boolean,
  referencedBuiltInTypes: ReferencedBuiltInTypes,
): string {
  const tsDoc = generateTypeDefinitionTsDoc(
    typeDefinition,
    isRootType,
    llmVariant,
  );
  const type = generateType(
    typeDefinition,
    schema,
    llmVariant,
    referencedBuiltInTypes,
  );
  return typeDefinition.dataType === DataType.Enum && !llmVariant
    ? `${tsDoc}export enum ${typeName} ${type}`
    : `${tsDoc}export type ${typeName} = ${type};`;
}

export default function codegen(schema: Schema, llmVariant = false): string {
  const referencedBuiltInTypes: ReferencedBuiltInTypes = new Set();
  const compiledTypeDefinitions = Object.entries(schema.types)
    .map(([typeName, typeDefinition]) =>
      generateTypeDeclaration(
        typeName,
        typeDefinition,
        typeName === schema.rootType,
        schema,
        llmVariant,
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
