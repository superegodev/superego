### Lite and Full Output

Omit `lite` to return lightweight collections. Lightweight collections include
collection id, settings, createdAt, and latest version metadata. They do not
include `latestVersion.schema`, `latestVersion.settings`, or
`latestVersion.migration`.

Pass `{ "lite": false }` to include the full latest collection version.

`{ "lite": true }` is not accepted. Omission is the lite mode.
