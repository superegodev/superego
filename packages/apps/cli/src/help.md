## Concepts

- A collection stores documents with the same shape.
- A document stores `content`; that content must match the latest schema of its
  collection.
- A collection version has a `schema` and `versionSettings`. New collection
  versions can change document shape and behavior over time.

## Superego Schema

A Superego Schema defines the JSON shape of documents in a collection. It is
Superego's own schema format, not JSON Schema.

Schema shape:

```json
{
  "types": {},
  "rootType": "Root"
}
```

- `types` is a map of named type definitions.
- `rootType` is the name of the root document content type. It must refer to a
  Struct type in `types`.
- Struct properties are all required. Use `nullableProperties` to allow `null`;
  missing properties and `undefined` are not valid content.
- Use named types and refs to reuse structures.

Common type definitions:

```json
{ "dataType": "Struct", "properties": {}, "nullableProperties": [] }
```

```json
{ "dataType": "List", "items": { "dataType": null, "ref": "TypeName" } }
```

```json
{ "dataType": "String" }
```

```json
{ "dataType": "Number" }
```

```json
{ "dataType": "Boolean" }
```

```json
{ "dataType": "Enum", "members": { "MemberName": { "value": "Member Value" } } }
```

```json
{ "dataType": "DocumentRef", "collectionId": "Collection_..." }
```

```json
{ "dataType": "File", "accept": { "image/*": [".png", ".jpg"] } }
```

```json
{ "dataType": "JsonObject" }
```

Use `description` on types, properties, and enum members when names are not
self-explanatory.
