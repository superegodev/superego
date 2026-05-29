### Content Change Rules

- `contentChange` must be either `{ "type": "full", "content": ... }` for full
  replacement or `{ "type": "patch", "patch": [...] }` for an RFC 6902 JSON
  Patch.
- Same content rules as `superego documents create --help`.
