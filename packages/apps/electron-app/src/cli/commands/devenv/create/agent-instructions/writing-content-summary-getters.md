# Writing Content Summary Getters

## Overview

A content summary getter is a TypeScript function that extracts the most
important information from a document, returning it as a flat
`Record<string, string | number | boolean | null>`.

The file is `contentSummaryGetter.ts` in the collection directory.

## Template

```typescript
import type { RootType } from "../generated/ProtoCollection_N.js";

export default function getContentSummary(
  item: RootType,
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true,default-sort:asc} Name": item.name,
    "{position:1} Description": item.description ?? null,
  };
}
```

Replace `RootType` with the actual root type name from the generated types and
`ProtoCollection_N` with the collection directory name.

## Rules

- Return between 1 and 5 properties.
- Only include the most salient information.
- Properties must always exist in the return value; use `null` for empty values.
- Keys can include metadata prefixes in curly braces.

## Key metadata attributes

- `position:N` - Display order (0-based).
- `sortable:true` - Column is sortable in tables.
- `default-sort:asc|desc` - Default sort direction (use on at most one
  property).
