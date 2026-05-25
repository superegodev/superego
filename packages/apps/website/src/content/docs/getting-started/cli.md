---
title: CLI
---

The Superego CLI is for using Superego through agents such as OpenClaw, Codex,
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
