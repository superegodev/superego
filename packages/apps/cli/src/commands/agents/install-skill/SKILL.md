# Superego CLI

Superego is a local-first personal database. It stores collections, documents,
files, conversations, and React-based collection-view apps in the local Superego
database.

Use `superego` to inspect and mutate the local Superego database.

Rules:

- Commands output JSON unless invoked with `--help`.
- Backend object commands output backend `Result` JSON.
- Local workflow commands output `{ "success": true, "data": ... }` or
  `{ "success": false, "error": ... }`.
- Run `superego <domain> <command> --help` before using an unfamiliar command.
- Prefer CLI commands over direct database edits.

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
- `devenv`: `create`, `generate-types`, `check`, `pack`, `preview`

Common workflows:

- Inspect command docs: `superego <domain> <command> --help`
- Create/list/update backend objects with named JSON options.
- Create an app project:
  `superego apps init ./my-app --collection Collection_...`
- Validate an app project: `superego apps check`
- Commit an app project: `superego apps commit`
- Create a development environment: `superego devenv create ./my-pack`
