## Input Notes

Use this for structured filtering, joins, sorting, or aggregation across all
documents in one or more collections. Use `documents search` for simple text
lookup.

Before writing the function, call `collections get-typescript-schema` for each
target collection.

`typescript-function` must be a TypeScript module with one synchronous default
function:

```ts
// Replace Collection_abc with the full id of the target collection.
import type * as Collection_abc from "./Collection_abc.ts";

interface Document<Content> {
  id: string;
  versionId: string;
  content: Content;
}

type DocumentsByCollection = {
  // Replace RootTypeName with the actual root type exported by
  // `collections get-typescript-schema`.
  Collection_abc: Document<Collection_abc.RootTypeName>[];
};

export default function main(
  documentsByCollection: DocumentsByCollection,
): unknown {
  return documentsByCollection.Collection_abc.map((document) => ({
    id: document.id,
    content: document.content,
  }));
}
```

- Import only collection types, using exact collection ids as module names.
- Use the exported root type from `collections get-typescript-schema`; its
  generated doc comment marks it as the root type of the schema.
- No `async`, timers, network, filesystem, `import` values, or `require`.
- Return JSON-safe values only.
- `LocalInstant` is available globally for date/time parsing, math, and
  formatting in the user's timezone.
