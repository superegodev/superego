# Setup

> Note:
>
> - This project uses
>   [yarn (berry) workspaces](https://yarnpkg.com/features/workspaces).
> - This project **does not** use
>   [yarn (berry) plug'n'play](https://yarnpkg.com/features/pnp).

## System requirements

- [nodejs >= 22](https://nodejs.org/en/).
- [corepack](https://github.com/nodejs/corepack) (to install yarn, the package
  manager).

Note: make sure corepack is enabled in your system, or you'll get an error when
running yarn commands. To enable corepack, it should be sufficient to run
`corepack enable`.

## First time setup

After cloning the repository:

- Run `yarn install` to install packages.
- Run `yarn playwright install chromium --with-deps` to install playwright
  browsers (needed to run some tests).

## `package.json` scripts

From the project's root directory, you can run the following scripts:

- `yarn check-linting`
- `yarn fix-linting`
- `yarn check-formatting`
- `yarn fix-formatting`
- `yarn check-translations`
- `yarn check-types`
- `yarn test`
- `yarn workspace package-name run script-name`: run a workspace-specific
  script.

## Editor setup

You should install the biome extension for your editor (see
[instructions](https://biomejs.dev/guides/editors/first-party-extensions/)), so
that you can see linting errors directly in the editor. It's also recommended
that you configure the extension to make it format your code "on save".
