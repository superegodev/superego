---
name: writing-default-document-view-ui-options
description: How to write a collection's defaultDocumentViewUiOptions object
---

# Writing Default Document View UI Options

## Overview

`defaultDocumentViewUiOptions.json` customizes the document editing UI layout
(optional).

## Structure

```json
{
  "fullWidth": false,
  "alwaysCollapsePrimarySidebar": false,
  "rootLayout": {
    // A media feature expression. E.g.
    "(min-width: 65rem)": [
      // ...nodes
    ],
    "all": [
      // ...nodes
    ]
  }
}
```

## Node types

**FieldNode** — references a schema property:

```json
{ "propertyPath": "propName" }
```

Optional fields: `layout` (sub-layout for Struct fields), `hideLabel` (boolean),
`allowCollapsing` (boolean, for Struct/List fields), `grow` (boolean).

**DivNode** — layout container:

```json
{
  "style": { "display": "grid", "gridTemplateColumns": "1fr 1fr" },
  "children": [
    // ...nodes
  ]
}
```

## Rules

- `rootLayout` keys are CSS media feature expressions. `"all"` is a catch-all.
- The first matching media expression (in insertion order) wins at runtime.
- Every property of the root Struct must appear exactly once in every layout.
- `propertyPath` uses dot notation. Use `$` for list items (e.g., `"phones.$"`).
