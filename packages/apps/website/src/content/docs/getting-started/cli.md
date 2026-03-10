---
title: CLI
---

The Superego CLI helps you create and develop packs. A **pack** is a bundle of
collections and apps that you can distribute and install into Superego.

## Getting started

To install the CLI, just click the **Install CLI** button in the **Developer**
menu of the app. You can then create a new development environment with:

```sh
superego devenv create my-pack
```

This scaffolds a project with a sample collection, a sample app, and everything
you need to start developing.

The project also contains instructions for a coding agent, so you can just tell
your coding agent what collections / apps you want to create, and it will take
it from there.

## Commands

- `superego devenv create <path>`: scaffolds a new development environment at
  the given path.
- `superego devenv generate-types`: reads each collection's `schema.json` and
  generates TypeScript type definitions in the `generated/` directory. Run this
  after changing any schema.
- `superego devenv check`: validates the entire development environment:
  schemas, settings, TypeScript compilation, and demo documents. Exits with an
  error if anything is invalid.
- `superego devenv preview [--watch]`: compiles the pack and opens it in a dev
  instance of Superego. With `--watch`, the preview reloads automatically when
  you change any file.
- `superego devenv pack`: compiles the development environment into a `pack.mpk`
  file, which you can install from the Boutique.
