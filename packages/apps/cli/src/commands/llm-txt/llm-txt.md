# Superego

## What is Superego

Superego is an open-source personal database. Personal means **for one single
user**. It allows the user to store their data (any kind) and to write personal
apps to interact with and manage that data.

## Data model

Data is organized in **collections** and **documents**.

- A **collection** is a container for documents. Each collection has a strict
  **schema**: all documents in the collection must conform to the schema.
- A **document** belongs to a collection. Its content is a JSON object whose
  shape is defined by the collection's schema.
- Documents are versioned. Each edit creates a new **document version**.
- Collections are versioned too. When the schema changes, a new **collection
  version** is created and all documents are migrated.
- **Files** can be attached to documents. In the schema they are represented by
  properties with `dataType: DataType.File`. File content is stored as binary
  data; in JSON representations (e.g. when creating documents via the CLI), file
  content is encoded as base64 strings.

## Schema

The schema uses a custom format (**not** JSON Schema). It satisfies the
following TypeScript definition:

```ts
$SUPEREGO_SCHEMA_TYPESCRIPT_SCHEMA;
```

### Well-known formats

For `DataType.String`:

$WELL_KNOWN_FORMATS_STRINGS

For `DataType.Number`:

$WELL_KNOWN_FORMATS_NUMBERS

For `DataType.JsonObject`:

$WELL_KNOWN_FORMATS_JSON_OBJECTS

## CLI commands

The following commands are available. Each reads a JSON array of arguments from
stdin and writes the result as JSON to stdout (except `files get-content` which
writes raw binary).

- `superego collections list` — no args; returns all collections
- `superego documents list` — args: `[collectionId]`; returns documents in a
  collection
- `superego documents get` — args: `[collectionId, documentId]`; returns a
  single document
- `superego documents create` — args: `[{collectionId, content, options?}]`;
  creates a document
- `superego documents create-many` — args: `[definitions[]]`; creates multiple
  documents
- `superego documents create-new-version` — args:
  `[collectionId, documentId, latestVersionId, content]`; creates a new version
  of a document
- `superego documents delete` — args:
  `[collectionId, documentId, commandConfirmation]`; deletes a document
  (commandConfirmation must be `"delete"`)
- `superego documents search` — args: `[collectionId | null, query, {limit}]`;
  full-text search
- `superego files get-content` — args: `[fileId]`; returns raw binary content
