# Superego Development Environment

## Overview

This is a development environment for building superego collections and apps.

## Directory structure

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
  - `main.tsx` - React component (the app UI)
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
- writing-apps
