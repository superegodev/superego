![main-and-tags workflow status](https://github.com/superegodev/superego/actions/workflows/main-and-tags.yml/badge.svg)

<p align="center">
  <img alt="Superego logo" src="./docs/images/logo.svg" style="height: 150px;" />
</p>

# Superego: Your Digital Freedom

Superego is an **open-source _personal_ database** where you can store
_anything_ you want about your life.

Your data is stored **locally**, in files you can back up and sync with Dropbox,
Google Drive, or any service you already use. **No accounts, no middlemen.**

Superego is also:

1. An **app platform** for building (or vibe-coding) your own personal apps.
2. An **AI assistant** with a precise and detailed understanding of your data
   that can extract meaningful answers from it.

[Try the demo @ demo.superego.dev](https://demo.superego.dev).

![Demo Screenshots](./docs/images/demo-screenshots-light.png#gh-light-mode-only)
![Demo Screenshots](./docs/images/demo-screenshots-dark.png#gh-dark-mode-only)

## Why

**I'm tired** of apps that hold my data hostage and make me jump through hoops
to get it. Apps that drop features, enshittify, and go on incredible journeys.

I want **access to my data** and apps that **serve _me_**.

I also want **an AI assistant that actually knows me**, not one that slops out
bland, canned responses.

## Core Philosophy

Ownership requires awareness. To truly own your data you first need to know what
it is.

**Superego puts your data right in front of you.** You can view it all and you
have unrestricted access to it.

You can have nicer interfaces to manage it – that's what _apps_ are for – but
the database foundation is always visible. You own it.

## Roadmap

- [x] Document versioning.
- [x] Search.
- [x] Collection view apps.
- [x] Data-aware AI assistant.
- [ ] Write apps with your coding agent.
- [ ] MCP/HTTP server.
- [ ] Database hooks.
- [ ] AI-powered data import.
- [ ] Mobile app.
- [ ] Sync between devices.
- [ ] Database encryption.

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
