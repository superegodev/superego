### Concepts

- A collection stores documents with the same shape.
- A collection category groups collections for navigation.
- A document stores `content`; that content must match the latest schema of its
  collection.
- A collection version has a `schema` and `versionSettings`. New collection
  versions can change document shape over time. See `Superego Schema` below for
  the schema format.
- An app is a collection-specific UI extension. It targets one or more
  collections and can read/render their schema-valid documents.

### Superego Schema

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
- Use named types and refs to reuse structures. Refs use
  `{ "dataType": null, "ref": "TypeName" }`.

Example schema:

```json
{
  "types": {
    "Task": {
      "dataType": "Struct",
      "properties": {
        "title": { "dataType": "String" },
        "status": {
          "dataType": "Enum",
          "members": {
            "Todo": { "value": "Todo" },
            "Done": { "value": "Done" }
          }
        },
        "dueDate": {
          "dataType": "String",
          "format": "dev.superego:String.PlainDate"
        },
        "priority": {
          "dataType": "Number",
          "format": "dev.superego:Number.Integer"
        },
        "tags": { "dataType": "List", "items": { "dataType": "String" } },
        "relatedTask": { "dataType": null, "ref": "Task" },
        "sourceDocument": {
          "dataType": "DocumentRef",
          "collectionId": "Collection_..."
        },
        "attachment": {
          "dataType": "File",
          "accept": { "image/*": [".png", ".jpg"] }
        },
        "notes": {
          "dataType": "String",
          "format": "dev.superego:String.Markdown"
        },
        "drawing": {
          "dataType": "JsonObject",
          "format": "dev.superego:JsonObject.ExcalidrawDrawing"
        }
      },
      "nullableProperties": [
        "dueDate",
        "relatedTask",
        "sourceDocument",
        "attachment",
        "notes",
        "drawing"
      ]
    }
  },
  "rootType": "Task"
}
```

Schema authoring rules:

- Use the simplest schema that fully represents the data.
- Define and reuse common types instead of duplicating nested structures.
- Group closely related fields into Structs.
- Use Lists for repeated values.
- Use `description` on types, properties, and enum members when names are not
  self-explanatory.
- Use PascalCase type names and enum member names.
- Use Title Case enum member values.
- Use camelCase property names.

Well-known formats:

- String: `dev.superego:String.PlainDate` (`YYYY-MM-DD`),
  `dev.superego:String.PlainTime` (`[T]HH[:mm[:ss[.sss]]]`),
  `dev.superego:String.Instant` (ISO 8601 with milliseconds and offset),
  `dev.superego:String.Markdown`.
- Number: `dev.superego:Number.Integer`.
- JsonObject: `dev.superego:JsonObject.ExcalidrawDrawing`,
  `dev.superego:JsonObject.GeoJSON`, `dev.superego:JsonObject.TiptapRichText`.
- Content values for `dataType: "JsonObject"` must be objects with
  `"__dataType": "JsonObject"`.

### CLI

Run `superego <domain> <command> --help` for command-specific options and args
file schemas.

#### JSON Inputs

Commands with inputs take a single `--args <file>` option. The file must contain
a JSON object keyed by camelCase argument names.

- Example:
  ```json
  {
    "collectionId": "Collection_abc",
    "id": "Document_abc"
  }
  ```
- Relative file paths inside args files are resolved from the args file
  directory.
- For document file fields, use `{ "$file": "/path/to/file" }`; the CLI reads
  the file and sends it as a Superego file value.
- Do not read or write the Superego SQLite database directly. Use the CLI only.
- Do not run Superego CLI commands in parallel. The app and CLI share one SQLite
  database.
- Use `collections get-typescript-schema` before writing document content or
  TypeScript functions for a collection.
