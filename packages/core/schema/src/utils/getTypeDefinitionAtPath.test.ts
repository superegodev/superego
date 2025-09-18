import type { TypeReferenceType } from "typescript";
import { describe, expect, it } from "vitest";
import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import type { AnyTypeDefinition } from "../typeDefinitions.js";
import getTypeDefinitionAtPath from "./getTypeDefinitionAtPath.js";

describe("gets the type definition for a property at the supplied path", () => {
  const schema = {
    types: {
      Name: {
        dataType: DataType.Struct,
        properties: {
          first: { dataType: DataType.String },
          last: { dataType: DataType.String },
        },
      },
      Phone: {
        dataType: DataType.Struct,
        properties: {
          number: { dataType: DataType.String },
        },
      },
      Contact: {
        dataType: DataType.Struct,
        properties: {
          name: { dataType: null, ref: "Name" },
          age: { dataType: DataType.Number },
          phones: {
            dataType: DataType.List,
            items: { dataType: null, ref: "Phone" },
          },
          friendGroups: {
            dataType: DataType.List,
            items: {
              dataType: DataType.List,
              items: {
                dataType: DataType.String,
              },
            },
          },
        },
      },
    },
    rootType: "Contact",
  } as const satisfies Schema;
  const testCases: {
    name: string;
    path: string;
    expectedTypeDefinition: Exclude<
      AnyTypeDefinition,
      TypeReferenceType
    > | null;
  }[] = [
    {
      name: "simple",
      path: "age",
      expectedTypeDefinition: schema.types.Contact.properties.age,
    },
    {
      name: "through ref",
      path: "name",
      expectedTypeDefinition: schema.types.Name,
    },
    {
      name: "nested through ref",
      path: "name.first",
      expectedTypeDefinition: schema.types.Name.properties.first,
    },
    {
      name: "list item",
      path: "phones.0",
      expectedTypeDefinition: schema.types.Phone,
    },
    {
      name: "nested list item",
      path: "friendGroups.0.0",
      expectedTypeDefinition:
        schema.types.Contact.properties.friendGroups.items.items,
    },
    {
      name: "[] syntax",
      path: "friendGroups[0][0]",
      expectedTypeDefinition:
        schema.types.Contact.properties.friendGroups.items.items,
    },
    {
      name: "non-existing",
      path: "nonExisting",
      expectedTypeDefinition: null,
    },
    {
      name: "nested non-existing",
      path: "name.nonExisting",
      expectedTypeDefinition: null,
    },
  ];

  it.each(testCases)("case: $name", ({ path, expectedTypeDefinition }) => {
    // Exercise
    const typeDefinition = getTypeDefinitionAtPath(schema, path);

    // Verify
    expect(typeDefinition).toEqual(expectedTypeDefinition);
  });
});
