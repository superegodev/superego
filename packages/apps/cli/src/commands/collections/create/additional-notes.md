## Input Notes

`definition.versionSettings.defaultDocumentViewUiOptions` defines the default
document form layout for this collection version. Use `null` for the default
schema-order vertical layout.

Top-level shape:

```json
{
  "fullWidth": false,
  "alwaysCollapsePrimarySidebar": false,
  "rootLayout": {
    "(min-width: 65rem)": [],
    "all": []
  }
}
```

- `rootLayout` is a map: CSS media feature expression -> layout node array.
- The first matching `rootLayout` key wins. `"all"` always matches; put it last.
- In each `rootLayout` value, every root Struct property must appear exactly
  once, either directly or inside a `DivNode`.

Layout node types:

- `FieldNode`: renders one schema property.

```json
{ "propertyPath": "propName" }
```

- `propertyPath` uses dot notation for nested fields and `$` for list items.
- Use `layout` only on a Struct `FieldNode`; it replaces that Struct field's
  internal layout.
- Other optional `FieldNode` keys: `hideLabel`, `allowCollapsing`, `flexGrow`.

- `DivNode`: layout-only wrapper; does not render a schema property.

```json
{ "style": { "display": "grid" }, "children": [] }
```

- Use `children` for nested layout nodes inside a `DivNode`.
- `style` uses React-style CSS property names.
- Useful CSS vars: `--visible-area-height`, `--visible-area-top`,
  `--section-vertical-gap`, `--section-horizontal-gap`, `--field-vertical-gap`,
  `--field-horizontal-gap`.

Example:

```json
{
  "fullWidth": true,
  "rootLayout": {
    "(min-width: 65rem)": [
      {
        "style": {
          "display": "grid",
          "gridTemplateColumns": "2fr 1fr",
          "gap": "var(--section-horizontal-gap)"
        },
        "children": [
          { "propertyPath": "body", "flexGrow": true },
          {
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "gap": "var(--field-vertical-gap)"
            },
            "children": [
              { "propertyPath": "title" },
              { "propertyPath": "tags" }
            ]
          }
        ]
      }
    ],
    "all": [
      { "propertyPath": "title" },
      { "propertyPath": "body" },
      { "propertyPath": "tags" }
    ]
  }
}
```
