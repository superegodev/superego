### Input Rules

#### Content Summary Getter

`definition.versionSettings.contentSummaryGetter` is a TypeScript module whose
default export derives a document summary from document content.

- A TypeScript module value is `{ "source": "...", "compiled": "..." }`.
  `compiled` must be executable JavaScript. If `source` is already valid
  JavaScript, use the same string for both fields. Prefer that for CLI usage.
- Return a `Record<string, string | number | boolean | null>`.
- Include 1 to 5 of the most salient values.
- Summary properties can be derived from multiple document properties.
- Always return the same properties; use `null` for empty values.
- Return date-like strings with formats `dev.superego:String.Instant`,
  `dev.superego:String.PlainDate`, or `dev.superego:String.PlainTime` as-is. The
  frontend formats them.
- Prefix summary property names with attributes to configure table rendering:
  `"{position:0,sortable:true,default-sort:asc} Title"`.
- Use `default-sort` on at most one summary property.

Template for both `source` and `compiled`:

```js
export default function getContentSummary(content) {
  return {
    "{position:0,sortable:true,default-sort:asc} Title": content.title,
  };
}
```

#### Content Blocking Keys Getter

`definition.versionSettings.contentBlockingKeysGetter` is optional. Use `null`
to disable duplicate detection, or provide a TypeScript module whose default
export derives an array of duplicate-detection keys from document content.

- Generate a key only when two documents sharing that key are probably the same
  real-world entity.
- Do not generate keys from common fields alone, such as only city or first
  name.
- Normalize inputs strictly: lowercase, trim whitespace, and strip punctuation
  where appropriate.
- Generate one key per independent identifier. For example, a contact with email
  and phone should return separate email and phone keys, not one combined key.
- Do not generate a key that is a strict superset of another key.
- Prefer the minimum fields needed to identify the entity; false positives are
  less harmful than missed duplicates.
- Output must be deterministic.

Template for both `source` and `compiled`:

```js
export default function getContentBlockingKeys(content) {
  return content.email ? [`email:${content.email.trim().toLowerCase()}`] : [];
}
```

#### Default Document View UI Options

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

- `fullWidth` uses the full width of the main panel content.
- `alwaysCollapsePrimarySidebar` keeps the primary sidebar collapsed, like on
  mobile.
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
- Use `hideLabel` carefully: labels can contain controls such as nullify/add
  buttons.

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
