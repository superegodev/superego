---
title: CLI
---

The Superego CLI is for using Superego through agents such as OpenCode, Codex,
or Claude Code.

You can then ask your agent to manage Superego collections, change data, or
build apps.

To install the CLI, click the **Install CLI** button in the **Developer** menu
of the app, after which you'll have the `superego` command in your terminal.

You can then use it to install a skill for your agent:

```sh
superego agents install-skill --agent claude
```

(Supported agents: `claude`, `codex`, `copilot`, `cursor`, `gemini`, `windsurf`,
`kiro`, `opencode`.)

You can then ask your agent to do almost everything Superego allows you to do
(you can run `superego --help` to see all available commands).

## Agent rules

- Agents must never read or write the Superego SQLite database directly. They
  must use the `superego` CLI.
- Agents must not run Superego CLI commands in parallel. The app and CLI share
  one SQLite database.
- Commands with inputs take `--args <file>`, where `<file>` contains a JSON
  object keyed by camelCase argument names.
- `documents create-many` and `collections create-many` are atomic: if any item
  fails, no item is created.

Example args file:

```json
{
  "collectionId": "Collection_...",
  "id": "Document_..."
}
```

Document file fields can use a file placeholder:

```json
{
  "definition": {
    "collectionId": "Collection_...",
    "content": {
      "photo": { "$file": "/Users/me/Downloads/plant.jpg" }
    }
  }
}
```
