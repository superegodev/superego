---
name: superego-cli
description:
  Use when working with the local Superego database through the `superego` CLI.
---

# Superego CLI

Superego is a local-first personal database. It stores collections, documents,
files, conversations, and React-based collection-view apps in the local Superego
database.

Use `superego` to inspect and mutate the local Superego database.

Rules:

- **NEVER** read or write the Superego SQLite database directly. Use the
  `superego` CLI only.
- Commands output JSON unless invoked with `--help`.
- `agents install-skill` is user-facing and outputs normal text; other commands
  are for agent/tool use.
- Backend object commands output backend `Result` JSON.
- Local workflow commands output `{ "success": true, "data": ... }` or
  `{ "success": false, "error": ... }`.
- Run `superego <domain> <command> --help` before using an unfamiliar command.
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
- `get-deep-link`: create a Superego link for a resource
- `agents`: `install-skill`
- `apps`: `init`, `checkout`, `check`, `status`, `diff`, `commit`,
  `add-collection`, `remove-collection`, `delete`, `list`

Common workflows:

- Inspect command docs: `superego <domain> <command> --help`
- Create/list/update backend objects with `--args ./args.json`.
- Link to a created resource: `superego get-deep-link --args ./args.json`
  returns a `superego://...` desktop link by default. Include
  `"linkFormat": "web"` in the args file when the user needs a clickable
  `https://open.superego.dev/...` redirect link in chat surfaces that block
  custom URL schemes. Web links send the Superego resource IDs in the URL path
  to the redirect service; Superego does not store, analyze, or log them in the
  Worker.
- Create an app project: `superego apps init --args ./args.json`
- Validate an app project: `superego apps check`
- Commit an app project: `superego apps commit`
