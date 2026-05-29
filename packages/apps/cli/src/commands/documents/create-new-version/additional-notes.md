### Input Rules

- `contentChange` must be either `{ "type": "full", "content": ... }` for full
  replacement or `{ "type": "patch", "patch": [...] }` for an RFC 6902 JSON
  Patch.
- Prefer `{ "type": "patch", "patch": [...] }` for small edits.
- Same content rules as `superego documents create --help`.
