## Input Notes

`definition.versionSettings.defaultDocumentViewUiOptions` customizes the default
document editing UI. Use `null` for the default schema-order vertical layout.

Shape:

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

- `rootLayout` keys are CSS media feature expressions. Values are arrays of
  layout nodes. The first matching expression wins at runtime.
- `"all"` always matches; place it last as a fallback.
- Every root Struct property must appear exactly once in every layout variant.

Layout node types:

```json
{ "propertyPath": "propName" }
```

```json
{
  "style": { "display": "grid", "gridTemplateColumns": "1fr 1fr" },
  "children": []
}
```

- Field nodes use `propertyPath`; dot notation addresses nested properties, and
  `$` addresses list items.
- Field nodes may also use `layout`, `hideLabel`, `allowCollapsing`, and
  `flexGrow`.
- Container nodes use `children` and optional React-style CSS `style`.
