# Superego CLI

Superego is a local-first personal database. It stores collections, documents,
files, conversations, and React-based collection-view apps in the local Superego
database.

Use `superego` to inspect and mutate the local Superego database.

Rules:

- Commands output JSON unless invoked with `--help`.
- `agents install-skill` is user-facing and outputs normal text; other commands
  are for agent/tool use.
- Backend object commands output backend `Result` JSON.
- Local workflow commands output `{ "success": true, "data": ... }` or
  `{ "success": false, "error": ... }`.
- Run `superego <domain> <command> --help` before using an unfamiliar command.
- Never read or write the Superego SQLite database directly. Use the `superego`
  CLI only.
- Do not run Superego CLI commands in parallel. The app and CLI share one SQLite
  database.
- Commands with inputs take `--args <file>`, where `<file>` contains a JSON
  object keyed by camelCase argument names.

Command map:

- `collection-categories`: `create`, `update`, `delete`, `list`
- `collections`: `create`, `create-many`, `update-settings`,
  `create-new-version`, `update-latest-version-settings`, `delete`, `list`,
  `get-typescript-schema`
- `documents`: `create`, `create-many`, `create-new-version`, `delete`, `list`,
  `list-versions`, `get`, `get-version`, `search`, `execute-typescript-function`
- `files`: `get-content`
- `agents`: `install-skill`
- `apps`: `init`, `checkout`, `check`, `status`, `diff`, `commit`,
  `add-collection`, `remove-collection`, `delete`, `list`

Common workflows:

- Inspect command docs: `superego <domain> <command> --help`
- Create/list/update backend objects with `--args ./args.json`.
- Create an app project: `superego apps init --args ./args.json`
- Validate an app project: `superego apps check`
- Commit an app project: `superego apps commit`
