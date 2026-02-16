---
title: Default document view UI options
---

To customize how the document form looks when viewing or editing documents, you
can configure the collection's **default document view UI options** (_Collection
settings_ -> _Version settings_ tab):

```json
{
  /** Use the full width of the main panel content. */
  "fullWidth": true,
  /** Always collapse the primary sidebar (like it does on mobile). */
  "alwaysCollapsePrimarySidebar": true,
  /** Custom layout for the root Struct type. See [Layout](#layout) below. */
  "layout": []
}
```

## Layout

A **layout** is an array of nodes that controls how fields are arranged inside a
Struct. Each node is either a **Field Node** (renders a schema field) or a **Div
Node** (a container for other nodes, basically a simple AST for an HTML
`<div>`).

If no layout is provided for a Struct, Superego renders its fields in the order
they appear in the schema, stacked vertically.

### Field Node

A **Field Node** references a property in the schema and renders it.

```json
{
  /**
   * Required. Path to a property in the schema (e.g. "myProp", "myList.$",
   * "myList.$.myProp").
   */
  "propertyPath": "myProp",
  /** Nested layout. Only applies to Struct fields. */
  "layout": [],
  /**
   * Hides the label section of the field. Defaults to false. Warning: the label
   * can contain controls (e.g. "nullify" or "add" buttons).
   */
  "hideLabel": false,
  /**
   * Whether the field can be collapsed. Only applies to Struct and List fields.
   * Defaults to true.
   */
  "allowCollapsing": true,
  /**
   * Makes the field grow its height to fill all available space. Defaults to
   * false.
   */
  "grow": false
}
```

### Div Node

A **Div Node** is a generic container. Use it to group fields and apply CSS
styles, for example to create multi-column layouts with flexbox.

```json
{
  /** CSS properties (same as React's CSSProperties). */
  "style": {},
  /** Nested layout nodes. */
  "children": []
}
```

### Available CSS variables

Superego sets a few CSS custom properties on the document form container. You
can reference them in Div Node `style` values via `var(...)`.

```css
/**
 * Height of the visible area in which the document form is rendered. Useful for
 * defining "sticky" layouts.
 */
--visible-area-height

/** Distance from the top of the viewport to the top of the visible area. */
--visible-area-top

/** Standard gap to use between columns. */
--column-gap

/** Standard gap to use between fields. */
--field-gap
```

### Layout example

A two-column layout where the left column is a sticky notes editor and the right
column lists the remaining fields:

```json
{
  "fullWidth": true,
  "alwaysCollapsePrimarySidebar": true,
  "rootLayout": [
    {
      "style": {
        "display": "grid",
        "gridTemplateColumns": "5fr 3fr",
        "columnGap": "var(--column-gap)",
        "height": "100%"
      },
      "children": [
        {
          "style": {
            "position": "sticky",
            "height": "var(--visible-area-height)",
            "top": "var(--visible-area-top)"
          },
          "children": [{ "propertyPath": "notes", "grow": true }]
        },
        {
          "style": {
            "display": "flex",
            "flexDirection": "column",
            "gap": "var(--field-gap)"
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
  ]
}
```

Result:

![Two-column layout](./images/custom-layout.png)
