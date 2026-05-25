### Input Rules

- `definition.content` must match the latest schema for
  `definition.collectionId`.
- Never invent document fields. Use only fields defined by the collection
  schema.
- Fill required non-nullable fields. Use `null` only when the schema allows it.
