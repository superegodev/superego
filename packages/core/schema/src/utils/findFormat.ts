import type Format from "../Format.js";
import type {
  JsonObjectTypeDefinition,
  NumberTypeDefinition,
  StringTypeDefinition,
} from "../typeDefinitions.js";

export default function findFormat<
  TypeDefinition extends
    | StringTypeDefinition
    | NumberTypeDefinition
    | JsonObjectTypeDefinition,
>(
  typeDefinition: TypeDefinition,
  formats: Format[],
): Format<TypeDefinition["dataType"]> | null {
  return (formats.find(
    (format) =>
      typeDefinition.dataType === format.dataType &&
      typeDefinition.format === format.id,
  ) ?? null) as Format<TypeDefinition["dataType"]> | null;
}
