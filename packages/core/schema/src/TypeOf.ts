import type Schema from "./Schema.js";
import type {
  AnyTypeDefinition,
  BooleanLiteralTypeDefinition,
  BooleanTypeDefinition,
  DocumentRefTypeDefinition,
  EnumTypeDefinition,
  FileTypeDefinition,
  JsonObjectTypeDefinition,
  ListTypeDefinition,
  NumberLiteralTypeDefinition,
  NumberTypeDefinition,
  StringLiteralTypeDefinition,
  StringTypeDefinition,
  StructTypeDefinition,
  TypeDefinitionRef,
} from "./typeDefinitions.js";
import type DocumentRef from "./types/DocumentRef.js";
import type FileRef from "./types/FileRef.js";
import type JsonObject from "./types/JsonObject.js";
import type ProtoFile from "./types/ProtoFile.js";

type ApplyIsNullable<Type, IsNullable extends boolean> = IsNullable extends true
  ? Type | null
  : Type;

type ExtractMembers<TypeDefinition extends EnumTypeDefinition> =
  TypeDefinition["members"][keyof TypeDefinition["members"]]["value"];

type NullablePropertyNames<TypeDefinition extends StructTypeDefinition> =
  TypeDefinition["nullableProperties"] extends readonly (infer PropertyName extends
    string)[]
    ? PropertyName
    : never;

type TypeDefinitionsMap = Partial<Record<string, AnyTypeDefinition>>;

type ResolveRef<
  Ref extends string,
  TypeDefinitions extends TypeDefinitionsMap,
> = Ref extends keyof TypeDefinitions
  ? NonNullable<TypeDefinitions[Ref]> extends AnyTypeDefinition
    ? NonNullable<TypeDefinitions[Ref]>
    : never
  : never;

type TypeOfTypeDefinition<
  TypeDefinition extends AnyTypeDefinition,
  TypeDefinitions extends TypeDefinitionsMap,
  IsNullable extends boolean,
> = TypeDefinition extends StringTypeDefinition
  ? ApplyIsNullable<string, IsNullable>
  : TypeDefinition extends NumberTypeDefinition
    ? ApplyIsNullable<number, IsNullable>
    : TypeDefinition extends EnumTypeDefinition
      ? ApplyIsNullable<ExtractMembers<TypeDefinition>, IsNullable>
      : TypeDefinition extends BooleanTypeDefinition
        ? ApplyIsNullable<boolean, IsNullable>
        : TypeDefinition extends StringLiteralTypeDefinition
          ? ApplyIsNullable<TypeDefinition["value"], IsNullable>
          : TypeDefinition extends NumberLiteralTypeDefinition
            ? ApplyIsNullable<TypeDefinition["value"], IsNullable>
            : TypeDefinition extends BooleanLiteralTypeDefinition
              ? ApplyIsNullable<TypeDefinition["value"], IsNullable>
              : TypeDefinition extends JsonObjectTypeDefinition
                ? ApplyIsNullable<JsonObject, IsNullable>
                : TypeDefinition extends FileTypeDefinition
                  ? ApplyIsNullable<ProtoFile | FileRef, IsNullable>
                  : TypeDefinition extends StructTypeDefinition
                    ? ApplyIsNullable<
                        {
                          -readonly [PropertyName in keyof TypeDefinition["properties"]]: TypeOfTypeDefinition<
                            TypeDefinition["properties"][PropertyName],
                            TypeDefinitions,
                            PropertyName extends NullablePropertyNames<TypeDefinition>
                              ? true
                              : false
                          >;
                        },
                        IsNullable
                      >
                    : TypeDefinition extends ListTypeDefinition
                      ? ApplyIsNullable<
                          TypeOfTypeDefinition<
                            TypeDefinition["items"],
                            TypeDefinitions,
                            false
                          >[],
                          IsNullable
                        >
                      : TypeDefinition extends DocumentRefTypeDefinition
                        ? ApplyIsNullable<DocumentRef, IsNullable>
                        : TypeDefinition extends TypeDefinitionRef
                          ? ApplyIsNullable<
                              ResolveRef<
                                TypeDefinition["ref"],
                                TypeDefinitions
                              > extends infer Resolved extends AnyTypeDefinition
                                ? TypeOfTypeDefinition<
                                    Resolved,
                                    TypeDefinitions,
                                    false
                                  >
                                : never,
                              IsNullable
                            >
                          : never;

type SchemaRootType<TSchema extends Schema> =
  TSchema["rootType"] extends keyof TSchema["types"]
    ? TSchema["rootType"]
    : never;

/** Given a Schema, extracts the type of an object abiding by the schema. */
type TypeOf<TSchema extends Schema> = Schema extends TSchema
  ? any
  : SchemaRootType<TSchema> extends infer Root extends keyof TSchema["types"]
    ? TypeOfTypeDefinition<TSchema["types"][Root], TSchema["types"], false>
    : never;
export default TypeOf;
