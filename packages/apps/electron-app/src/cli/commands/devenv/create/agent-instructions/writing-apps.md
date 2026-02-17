# Writing Apps

## Overview

An app is a React component rendered inside superego. The entry file is
`main.tsx` in the app directory.

## Available imports

- `@superego/app-sandbox/components` — UI components: Alert, Button, Echart,
  Grid, IconButton, Image, Link, NumberField, PlainDatePicker, RadioGroup,
  Select, SimpleMonthCalendar, Table, Text, TextField, Tile, ToggleButton.
- `@superego/app-sandbox/hooks` — useCreateDocument,
  useCreateNewDocumentVersion.
- `@superego/app-sandbox/theme` — Theme tokens (colors, typography, spacing,
  borders).
- `react` — React library.
- `echarts/*` — ECharts types (used with the Echart component).

## Structure

- Default-export a function component from `main.tsx`.
- Use `Grid` as the root layout component.
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
