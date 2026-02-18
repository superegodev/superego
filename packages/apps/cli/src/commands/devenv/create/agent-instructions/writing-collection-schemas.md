---
name: writing-collection-schemas
description: How to write collection schemas
---

# Writing Collection Schemas

## Overview

A collection schema defines the structure of documents in a collection. It is
stored as `schema.json` in the collection directory.

## Superego Schema anatomy

A Superego Schema is a custom schema, conceptually similar to JSON schema,
but—crucially—with a different syntax. A Superego Schema satisfies the following
TypeScript definition:

<!-- prettier-ignore-start -->

```ts
$SUPEREGO_SCHEMA_TYPESCRIPT_SCHEMA
```

<!-- prettier-ignore-end -->

## Well-known formats

For `DataType.String`:

$WELL_KNOWN_FORMATS_STRINGS

For `DataType.Number`:

$WELL_KNOWN_FORMATS_NUMBERS

For `DataType.JsonObject`:

$WELL_KNOWN_FORMATS_JSON_OBJECTS

Note: document properties with `dataType: DataType.JsonObject` MUST be objects
branded by the `"__dataType": "JsonObject"` property.

## Tips for writing a good schema

1. Unless the user asks otherwise, generate the simplest possible schema that
   contains just enough info to satisfy the user request.
2. Define and reuse common types whenever possible.
3. Group closely related information into Structs.
4. Use lists whenever it makes sense.
5. Unless a property or type name is fully self-explanatory, include a
   description for it.
6. Use PascalCase for enum member names.
7. Use Title Case for enum member values (they can contain spaces).
8. Use PascalCase for type names.
9. Use camelCase for property names.

## After editing

Run `superego devenv generate-types` to regenerate TypeScript types.
