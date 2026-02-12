# Writing Apps In Superego

This guide explains how collection-view apps are authored in Superego, how they
are packaged in bazaar packs, and which runtime APIs are available inside the
app sandbox.

## Where Collection-View Apps Live

A bazaar pack usually includes app files in the same folder as pack
collections/schemas.

Example folder structure:

```text
packages/misc/bazaar/src/packs/dev/superego/bazaar/<pack-name>/
  pack.ts
  <collection>.ts
  <collection>Schema.ts
  <appName>App.ts
  <appName>.appSource.tsx
  <appName>.appCompiled.js
```

## App Definition Shape

Collection-view apps are declared with `AppType.CollectionView` and include a
`/main.tsx` entry in `files`.

```ts
import { type AppDefinition, AppType } from "@superego/backend";
import appCompiled from "./example.appCompiled.js?raw";
import appSource from "./example.appSource.tsx?raw";

export default {
  type: AppType.CollectionView,
  name: "Example App",
  targetCollectionIds: ["ProtoCollection_0"],
  files: {
    "/main.tsx": {
      source: appSource,
      compiled: appCompiled,
    },
  },
} as const satisfies AppDefinition<true>;
```

## How Packs Wire Apps

A pack lists its apps in `pack.ts`:

```ts
apps: [exampleApp];
```

and the pack must be exported from:

`packages/misc/bazaar/src/index.ts`

so it appears in `@superego/bazaar` exported `packs`.

## Runtime Imports Available Inside Sandbox Apps

At runtime, app code is transpiled and imports are resolved from a controlled
dependency map.

Supported module specifiers for runtime code:

- `react`
- `@superego/app-sandbox/components`
- `@superego/app-sandbox/hooks`
- `@superego/app-sandbox/theme`

These are registered in:

- `packages/apps/app-sandbox/src/sandbox/Sandbox/registerDependencies.ts`

TypeScript libs exposed in the app editor include:

- React types
- ECharts types
- App sandbox declaration files for components/hooks/theme
- Generated `ProtoCollection_*` types for each target collection

See:

- `packages/apps/app-sandbox/src/typescript-libs/index.ts`
- `packages/apps/browser-app/src/components/widgets/RHFAppVersionFilesField/useTypescriptLibs.ts`

## App Props Contract

Collection-view app component receives:

```ts
interface Props {
  collections: {
    [collectionId: string]: {
      id: `Collection_${string}` | string;
      versionId: `CollectionVersion_${string}` | string;
      displayName: string;
      documents: {
        id: `Document_${string}`;
        versionId: `DocumentVersion_${string}`;
        href: string;
        content: any;
      }[];
    };
  };
}
```

Key details:

- `documents[*].versionId` is required when calling
  `useCreateNewDocumentVersion`.
- `href` points to document details in host app (useful for links).

Source of truth:

- `packages/apps/app-sandbox/src/types/AppComponentProps.ts`
- `packages/apps/browser-app/src/components/widgets/AppRenderer/AppRenderer.tsx`

## Core Components And Hooks

Frequently used components:

- Layout/structure: `Grid`, `Tile`, `Text`, `Alert`
- Inputs/actions: `Select`, `TextField`, `NumberField`, `RadioGroup`,
  `ToggleButton`, `Button`
- Data viz: `Echart`
- Calendar: `SimpleMonthCalendar`

Mutation hooks:

- `useCreateDocument()` for new documents
- `useCreateNewDocumentVersion()` for immutable updates

Component and hook typing:

- `packages/apps/app-sandbox/src/sandbox/components/index.d.ts`
- `packages/apps/app-sandbox/src/sandbox/hooks/index.d.ts`

## Using `SimpleMonthCalendar`

`SimpleMonthCalendar` is a full-page calendar component.

Rules from typings:

- Use as root (do not wrap inside `Grid`/`Tile`).
- `renderDayCell(day)` must return `<SimpleMonthCalendar.DayCell />`.
- If `renderDayPopover` is provided, do not place interactive elements inside
  `DayCell`; put them in `<SimpleMonthCalendar.DayPopover />`.

Reference typings:

- `packages/apps/app-sandbox/src/sandbox/components/index.d.ts`

## Source + Compiled Files Must Stay In Sync

Each app file stores both source and compiled JS. Keep them synchronized:

- `*.appSource.tsx`: authored source
- `*.appCompiled.js`: compiled JavaScript stored in repo

Compiler compatibility expectations match the editor setup:

- module: `ESNext`
- target: `ESNext`
- jsx: React runtime-compatible emit used by Superego app editor/tooling

Relevant implementation:

- `packages/apps/browser-app/src/monaco.ts`
- `packages/apps/browser-app/src/components/widgets/CodeInput/typescript/getCompilationOutput.ts`

## Concrete Bazaar Examples

Use these as references when implementing a new app:

- `/Users/pscanf/code/github.com/superegodev/superego/packages/misc/bazaar/src/packs/dev/superego/bazaar/car/fuelLogs.appSource.tsx`
- `/Users/pscanf/code/github.com/superegodev/superego/packages/misc/bazaar/src/packs/dev/superego/bazaar/finance/expenses.appSource.tsx`
- `/Users/pscanf/code/github.com/superegodev/superego/packages/apps/app-sandbox/src/sandbox/components/index.d.ts`

## Practical Checklist For A New Bazaar App

1. Define/update collection schema and collection settings.
2. Add `*.appSource.tsx` and `*.appCompiled.js`.
3. Add app wrapper file (`*App.ts`) with `targetCollectionIds`.
4. Register app in pack `apps` list.
5. Export pack from `packages/misc/bazaar/src/index.ts`.
6. Run typecheck for bazaar workspace.
