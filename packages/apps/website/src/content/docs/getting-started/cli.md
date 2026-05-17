---
title: CLI
---

The Superego CLI helps you create and update apps from your editor or coding
agent.

## Getting started

To install the CLI, just click the **Install CLI** button in the **Developer**
menu of the app. You can then create a new development environment with:

```sh
superego apps create my-app --name "My App"
```

This scaffolds a folder with source files, generated Superego files, and a
runnable static app in `dist/`.

## Commands

- `superego apps create <folder> --name <name>`: scaffolds a local app folder.
- `superego apps checkout <app>`: checks out an installed app into a folder.
- `superego apps status`: compares the current folder with the latest app
  version.
- `superego apps check`: validates the current app folder.
- `superego apps commit`: creates the app or commits a new app version.
- `superego apps install-deps`: writes bundled Superego helper packages into the
  app folder and installs them as local `file:` dependencies.
- `superego apps add-collection <collection>` /
  `remove-collection <collection>`: updates target collections and generated
  local types.
