### Lite and Full Output

Omit `lite` to return lightweight documents. Lightweight documents include
document id, collection id, createdAt, latest version metadata, and
contentSummary. They do not include `latestVersion.content`.

Pass `{ "lite": false }` to include full document content.

`{ "lite": true }` is not accepted. Omission is the lite mode.
