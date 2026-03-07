![main-and-tags workflow status](https://github.com/superegodev/superego/actions/workflows/main-and-tags.yml/badge.svg)

<p align="center">
  <img alt="Superego logo" src="./docs/images/logo.svg" style="height: 150px;" />
</p>

# Superego: Personal Data Store and App Platform

[Try the demo @ demo.superego.dev](https://demo.superego.dev).

## You Deserve Better Software

**You don't have control of your data.** It's scattered, trapped inside apps
that hold it hostage.

**Apps are not serving you.** They serve growth targets, while you get bloat,
banners, enshittification.

## So We Built Superego

A private place to **collect your data** and a platform to **build (or vibe)
your _home-cooked_ apps** around it.

Your portfolio tracker? Don't settle for generic. Make it just like **you** want
it. A chore scoreboard for your family? Too niche for the app stores, but you
can **build it yourself**.

## With an AI That Actually Knows You

Bring your own LLM. Direct access to your data gives it a precise understanding
of your world, so it can answer questions like:

> I need 30k for a car. What stocks should I sell?

![Demo Screenshots](./docs/images/demo-screenshots-light.png#gh-light-mode-only)
![Demo Screenshots](./docs/images/demo-screenshots-dark.png#gh-dark-mode-only)

## Feature Highlights

- Open-source, local-first, no-login.
- Everything in one **single SQLite file**.
- Built-in **version control** for your documents.
- A **CLI** to integrate with your personal
  [_Claw_](https://simonwillison.net/2026/Feb/21/claws/) (for managing data) or
  coding agent (for writing apps).

## Roadmap

- [x] Document versioning.
- [x] Data-aware AI assistant.
- [x] User-defined apps.
- [x] Full-text search.
- [-] CLI. (in progress)
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
**GNU Affero General Public License, Version 3 or later (AGPL-3.0-or-later)**.

You can find a copy of the full license text in the `LICENSE` file at the root
of this repository.

## Contributing

Check the [docs/setup.md](./docs/setup.md) for instructions on how to setup your
local dev environment.
