---
name: writing-collection-view-apps
description: How to write apps with type = CollectionView
---

# Writing Collection View Apps

## Overview

An app is a React component rendered inside superego. The entry file is
`main.tsx` in the app directory.

## Available imports

- `@superego/app-sandbox/components` — UI components (layout, inputs, data
  display, charts). Read `node_modules/@superego/app-sandbox/components.d.ts`
  for the full list and props.
- `@superego/app-sandbox/hooks` — Hooks for creating documents and document
  versions. Read `node_modules/@superego/app-sandbox/hooks.d.ts` for the full
  list and signatures.
- `@superego/app-sandbox/theme` — Theme tokens (colors, typography, spacing,
  borders). Read `node_modules/@superego/app-sandbox/theme.d.ts` for available
  tokens.
- `react` — React library.
- `echarts/*` — ECharts types (used with the Echart component).

## Structure

- Default-export a function component from `main.tsx`.
- Import collection types from `../generated/ProtoCollection_N.js` for type
  safety.

## Settings

`settings.json`:

```json
{
  "type": "CollectionView",
  "name": "My App",
  "targetCollectionIds": ["ProtoCollection_0"]
}
```

- `type`: Currently only `"CollectionView"` is supported.
- `targetCollectionIds`: Array of collection IDs this app operates on.
