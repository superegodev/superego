# Writing Collection Schemas

## Overview

A collection schema defines the structure of documents in a collection. It is
stored as `schema.json` in the collection directory.

## Schema format

The schema is a JSON object with two fields:

- `types`: A record of named type definitions.
- `rootType`: The name of the top-level type (must be a Struct defined in
  `types`).

## Type definitions

Each type definition has a `dataType` discriminator:

- `Struct` - Object with fixed named properties. All properties are required.
  Use `nullableProperties` to allow `null` on specific properties.
- `List` - Ordered array of items: `{ "dataType": "List", "items": <type> }`
- `Enum` - Set of allowed string values:
  `{ "dataType": "Enum", "members": { "MemberName": { "value": "member_value" } } }`
- `String` - Text value. Optional `format`: `"dev.superego:String.PlainDate"`,
  `"dev.superego:String.PlainTime"`, `"dev.superego:String.Instant"`,
  `"dev.superego:String.Markdown"`, `"dev.superego:String.Url"`.
- `Number` - Numeric value. Optional `format`: `"dev.superego:Number.Integer"`.
- `Boolean` - True/false value.
- `File` - File attachment. Optional `accept` to restrict mime types.
- `DocumentRef` - Reference to a document in another collection.
- `JsonObject` - Arbitrary JSON object.
- TypeDefinitionRef - Reference to another type:
  `{ "dataType": null, "ref": "TypeName" }`

All type definitions support an optional `description` field.

## Example

```json
{
  "types": {
    "Contact": {
      "description": "A person's contact information.",
      "dataType": "Struct",
      "properties": {
        "name": { "dataType": "String" },
        "email": { "dataType": "String" },
        "age": {
          "dataType": "Number",
          "format": "dev.superego:Number.Integer"
        },
        "notes": {
          "dataType": "String",
          "format": "dev.superego:String.Markdown"
        }
      },
      "nullableProperties": ["notes"]
    }
  },
  "rootType": "Contact"
}
```

## After editing

Run `superego devenv generate-types` to regenerate TypeScript types, then
`superego devenv check` to validate.
