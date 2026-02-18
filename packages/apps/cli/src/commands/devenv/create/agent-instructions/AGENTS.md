# Superego Development Environment

## What is Superego

- Superego is an open-source personal database. Personal means **for one single
  user**.
- It allows the user to store their data (any kind) and to write personal apps
  to interact and manage that data.
- Data is stored in json documents, organized into collections.
- Each collection has a strict schema: all documents in the collection match the
  schema.
- The schema uses a custom format (**not** JSON Schema). TypeScript types can be
  generated from the schema.
- The user can write apps to extend Superego. Apps are written in TypeScript.

**This is a development environment for building Superego collections and
apps.** Help the user create what they want.

## Packs

A pack is a self-contained bundle that packages collections and apps together
for distribution. The `pack.json` file in the root of the development
environment defines pack metadata (id, name, description, and collection
categories). Run `superego devenv pack` to compile the development environment
into a single `pack.mpk` file.

## Directory structure

- `pack.json` - Pack metadata (id, name, description, collection categories)
- `ProtoCollection_*/` - Collection definitions
  - `settings.json` - Collection name, icon, description
  - `schema.json` - Document schema (defines the shape of documents)
  - `contentSummaryGetter.ts` - Function to derive a summary from document
    content
  - `contentBlockingKeysGetter.ts` - (optional) Function to derive
    duplicate-detection keys
  - `defaultDocumentViewUiOptions.json` - (optional) Custom UI layout for the
    document view
  - `test-documents.json` - (optional) Array of test documents to validate
    against the schema
- `ProtoApp_*/` - App definitions
  - `settings.json` - App name, type, target collections
  - `main.tsx` - App implementation
- `generated/` - Auto-generated TypeScript types from collection schemas (do not
  edit)
- `node_modules/` - TypeScript type definitions (do not edit)

## Workflow

1. Edit collection schemas and settings
2. Run `superego devenv generate-types` to regenerate TypeScript types
3. Edit content summary getters, apps, etc.
4. Run `superego devenv check` to validate everything

## Naming conventions

- Collections: `ProtoCollection_0`, `ProtoCollection_1`, etc.
- Apps: `ProtoApp_0`, `ProtoApp_1`, etc.
- Generated types: `generated/ProtoCollection_0.ts`, etc.

## Available skills

- writing-collection-schemas
- writing-content-summary-getters
- writing-content-blocking-keys-getters
- writing-default-document-view-ui-options
- writing-collection-view-apps
