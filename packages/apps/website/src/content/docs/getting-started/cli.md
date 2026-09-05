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

## App specifications

App projects include `spec.md`, the current Markdown description of the app's
requirements, expected behavior, constraints, and rationale. Read it before
editing and update it alongside behavior changes. For a new app, initialize it
from the user's request. Keep it as a current specification, not a changelog.

`superego apps checkout` retrieves the stored spec. `apps status` and
`apps diff` include spec changes, and `apps commit` saves them even when code is
unchanged. An absent `spec.md` in an older checkout preserves the stored spec;
an empty file clears it. Specs are versioned together with the implementation.
