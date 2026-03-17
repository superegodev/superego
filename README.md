<br />

![Superego: a personal database you can extend with apps](./docs/media/logo.light.avif#gh-light-mode-only)
![Superego: a personal database you can extend with apps](./docs/media/logo.dark.avif#gh-dark-mode-only)

<br />

### Designed to respect your digital rights

- Open-source, local-first, no-login.
- Everything in a **single SQLite file**.
- Bring-your-own LLM.
- CLI to integrate with other tools (e.g., your coding agent to write apps).

### Watch the demo

[![Watch the video](./docs/media/demo-thumbnail.avif)](https://www.youtube.com/watch?v=vB3xo2qn_g4)

### Screenshots

<table border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td>
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./docs/media/holdings-app.dark.avif">
        <img alt="Holdings app" src="./docs/media/holdings-app.light.avif" width="100%">
      </picture>
    </td>
    <td>
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./docs/media/plants-app.dark.avif">
        <img alt="Plants app" src="./docs/media/plants-app.light.avif" width="100%">
      </picture>
    </td>
  </tr>
</table>

### Roadmap

- [x] Document versioning.
- [x] Full-text search.
- [ ] CLI. 🚧
- [ ] AI-assisted data import.
- [ ] Mobile app.
- [ ] Sync via file-syncing service.
- [ ] Database encryption.
- [ ] Database hooks.

### Is This Vibe-Coded Slop?

Short answer: **no**.

Longer answer: most of the project was developed without any assistance. Around
Dec 2025, I started using coding agents, but — as Freud would put it — I'm
particularly anal when it comes to architecture and coding style, so it's very
difficult for me to just accept stock AI-generated code.

Currently (Feb 2026), my AI-assisted workflow (which you can see in PR commits)
is the following:

1. I ask Claude or Codex to implement small feature X. They open a draft PR.
2. I test that the feature "more or less works", and keep asking for changes
   until it does.
3. I comb through the generated files, changing names, simplifying loops,
   removing overly defensive code, adding missing automated tests, etc. I do
   this over and over (combined with manual testing) until I'm satisfied with
   the result, and I push a "fix vibed code" commit.
4. I ask AIs to review the PR, go through the comments, and address the
   meaningful ones.

It often happens that, around step 1 or step 2, I realize that, architecturally,
the coding agent's implementation is just wrong. So I bin the PR, draw up a
better prompt laying out the architecture I have in mind, and start over.

Does this speed me up? I feel like it, but it's hard to tell for sure. It
definitely makes me more productive, though, because it lowers the effort
required to get started on something.

### License

Unless otherwise specified, all files in this repository are licensed under the
**GNU Affero General Public License, Version 3 (AGPL-3.0-only)**.

You can find a copy of the full license text in the `LICENSE` file at the root
of this repository.

### Contributing

Check the [docs/setup.md](./docs/setup.md) for instructions on how to setup your
local dev environment.
