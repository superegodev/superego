---
name: writing-default-document-view-ui-options
description: How to write a collection's defaultDocumentViewUiOptions object
---

# Writing Default Document View UI Options

## Overview

`defaultDocumentViewUiOptions.json` customizes the document editing UI layout.
Without it, fields render in schema order, stacked vertically.

## Structure

```json
{
  "fullWidth": false,
  "alwaysCollapsePrimarySidebar": false,
  "rootLayout": {
    "(min-width: 65rem)": [
      /* nodes */
    ],
    "all": [
      /* nodes */
    ]
  }
}
```

- `fullWidth` — use the full width of the main panel content.
- `alwaysCollapsePrimarySidebar` — keep the primary sidebar collapsed (like on
  mobile).
- `rootLayout` — responsive layout; see below.

## Responsive root layout

`rootLayout` keys are CSS media feature expressions. Values are layouts (arrays
of nodes). The first matching expression (in insertion order) wins at runtime.

`"all"` always matches; place it last as a fallback. Example keys:

- `"(min-width: 65rem)"` — viewport >= 65rem
- `"(min-width: 45rem)"` — viewport >= 45rem
- `"all"` — fallback

Every property of the root Struct must appear exactly once in every layout
variant.

## Node types

A layout is an array of nodes. Each node is a **FieldNode** or a **DivNode**.

### FieldNode

References a schema property and renders it.

```json
{ "propertyPath": "propName" }
```

- `propertyPath` (string, **required**) — path to a schema property. Dot
  notation; `$` for list items (e.g. `"phones.$"`).
- `layout` (node[]) — nested layout. Only for Struct fields.
- `hideLabel` (boolean, default `false`) — hide the label section. Warning:
  labels can contain controls (nullify/add buttons).
- `allowCollapsing` (boolean, default `true`) — whether the field can be
  collapsed. Only for Struct/List fields.
- `flexGrow` (boolean, default `false`) — flex-grow height to fill available
  space.

### DivNode

Generic container. Use it to group fields and apply CSS styles (e.g.
multi-column layouts with grid/flexbox).

```json
{
  "style": { "display": "grid", "gridTemplateColumns": "1fr 1fr" },
  "children": [
    /* nodes */
  ]
}
```

- `style` (CSSProperties) — CSS properties (same keys as React CSSProperties).
- `children` (node[]) — nested layout nodes.

### Available CSS variables

Reference these in DivNode `style` values via `var(...)`:

- `--visible-area-height` — height of the visible area containing the document
  form.
- `--visible-area-top` — distance from viewport top to the visible area top.
- `--section-vertical-gap` — standard vertical gap between sections.
- `--section-horizontal-gap` — standard horizontal gap between sections.
- `--field-vertical-gap` — standard vertical gap between fields.
- `--field-horizontal-gap` — standard horizontal gap between fields.

## Example

Responsive two-column layout: wide screens get a sticky notes editor on the left
and remaining fields on the right; narrow screens stack everything vertically.

```json
{
  "fullWidth": true,
  "alwaysCollapsePrimarySidebar": true,
  "rootLayout": {
    "(min-width: 65rem)": [
      {
        "style": {
          "display": "grid",
          "gridTemplateColumns": "5fr 3fr",
          "columnGap": "var(--section-horizontal-gap)",
          "height": "100%"
        },
        "children": [
          {
            "style": {
              "position": "sticky",
              "height": "var(--visible-area-height)",
              "top": "var(--visible-area-top)",
              "display": "flex",
              "flexDirection": "column",
              "gap": "var(--field-vertical-gap)"
            },
            "children": [{ "propertyPath": "notes", "flexGrow": true }]
          },
          {
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "gap": "var(--field-vertical-gap)"
            },
            "children": [
              { "propertyPath": "type" },
              { "propertyPath": "name" },
              { "propertyPath": "relation" },
              { "propertyPath": "phones" },
              { "propertyPath": "emails" }
            ]
          }
        ]
      }
    ],
    "all": [
      { "propertyPath": "type" },
      { "propertyPath": "name" },
      { "propertyPath": "relation" },
      { "propertyPath": "phones" },
      { "propertyPath": "emails" },
      { "propertyPath": "notes" }
    ]
  }
}
```
