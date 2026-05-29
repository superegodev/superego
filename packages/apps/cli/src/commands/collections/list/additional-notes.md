### Input Rules

If `--args` is omitted, this command returns lightweight collections.
Lightweight collections include collection id, settings, createdAt, and latest
version metadata. They do not include `latestVersion.schema`,
`latestVersion.settings`, or `latestVersion.migration`.

To include the full latest collection version, pass an args file with:

```json
{ "lite": false }
```

`{ "lite": true }` is not accepted. Omission is the lite mode.
