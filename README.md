![main-and-tags workflow status](https://github.com/superegodev/superego/actions/workflows/main-and-tags.yml/badge.svg)

<p align="center">
  <img alt="Superego logo" src="./docs/media/logo.svg" style="height: 150px;" />
</p>

# Superego

A personal database you can extend with apps.

[Try the demo](https://demo.superego.dev) ·
[Download](https://github.com/superegodev/superego/releases/latest)

### Your Apps Don't Fit You

They're built for a generic user and shaped by growth targets, not your needs.

### Your Data Isn't Yours

It's trapped inside apps, leaving you with limited access and no real ownership.

### Superego Puts You Back In Control

It's a private place to store your data and build apps tailored to how you live
and work.

Build a portfolio manager that matches how you invest. Vibe-code a chore
scoreboard for your family. Make niche tools you'll never find in an app store.

### It Makes AI Actually Helpful

Having access to your data, Superego's assistant can answer questions ordinary
tools can't.

> Looking at my finances and my lifestyle, when could I retire?

[Try it in the demo](https://demo.superego.dev/?initialMessage=Looking%20at%20my%20finances%20and%20my%20lifestyle%2C%20when%20could%20I%20retire%3F)
and see how it answers.

<p align="center">
  <img alt="Demo Recording" src="./docs/media/demo-recording.dark.gif#gh-light-mode-only" style="height: 500px;" />
  <img alt="Demo Recording" src="./docs/media/demo-recording.light.gif#gh-dark-mode-only" style="height: 500px;" />
</p>

### What Else?

- Open-source, local-first, no-login.
- Everything in a **single SQLite file**.
- Bring-your-own LLM.
- CLI to integrate with other tools (e.g., your coding agent to write apps).

## Roadmap

- [x] Document versioning.
- [x] Full-text search.
- [ ] CLI. 🚧
- [ ] AI-assisted data import.
- [ ] Mobile app.
- [ ] Sync via file-syncing service.
- [ ] Database encryption.
- [ ] Database hooks.

## Is This Vibe-Coded Slop?

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

## License

Unless otherwise specified, all files in this repository are licensed under the
**GNU Affero General Public License, Version 3 (AGPL-3.0-only)**.

You can find a copy of the full license text in the `LICENSE` file at the root
of this repository.

## Contributing

Check the [docs/setup.md](./docs/setup.md) for instructions on how to setup your
local dev environment.
