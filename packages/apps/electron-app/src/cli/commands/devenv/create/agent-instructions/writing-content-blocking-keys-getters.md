# Writing Content Blocking Keys Getters

## Overview

A content blocking keys getter derives unique signatures from document content
for duplicate detection. Documents sharing any blocking key are flagged as
potential duplicates.

The file is `contentBlockingKeysGetter.ts` in the collection directory
(optional).

## Template

```typescript
import type { RootType } from "../generated/ProtoCollection_N.js";

export default function getContentBlockingKeys(item: RootType): string[] {
  return [];
}
```

Replace `RootType` with the actual root type name from the generated types and
`ProtoCollection_N` with the collection directory name.

## Guidelines

- Each key represents an independent way two documents could be duplicates.
- Normalize inputs: lowercase, trim whitespace, strip punctuation.
- Prefix keys with the field name for clarity (e.g., `email:john@example.com`).
- The same content must always produce the same array of keys.
