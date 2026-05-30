### Input Rules

If `--args` is omitted, this command returns lightweight documents. Lightweight
documents include document id, collection id, createdAt, latest version
metadata, and contentSummary. They do not include `latestVersion.content`.

To include full document content, pass an args file with:

```json
{ "lite": false }
```

`{ "lite": true }` is not accepted. Omission is the lite mode.
