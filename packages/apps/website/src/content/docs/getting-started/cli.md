---
title: CLI
---

The Superego CLI is primarily meant for coding agents, such as OpenClaw, Codex,
Claude Code, or any other agent running in your local workspace.

Agents use it to inspect and mutate the local Superego database, then make
changes through normal files, git commits, and pull requests. The main workflow
is app development: an agent can check out an app, edit it in your editor's
workspace, validate it, and commit the updated app back into Superego.

## Getting started

To install the CLI, just click the **Install CLI** button in the **Developer**
menu of the app.

After installing the CLI, run:

```sh
superego agents install-skill
```

This installs instructions that teach compatible coding agents how to use the
Superego CLI safely. Then point your agent at your project and ask it to create,
inspect, or update Superego apps and data.

Run `superego --help` to inspect the command surface directly.

## Commands

- `superego collection-categories`: create, update, delete, and list collection
  categories.
- `superego collections`: create, update, delete, list, and inspect typed
  collections.
- `superego documents`: create, update, delete, list, search, and inspect
  documents.
- `superego files`: retrieve file content.
- `superego agents`: install agent skills.
- `superego apps`: create, checkout, validate, inspect, commit, and delete
  collection-view apps.
