---
name: writing-content-summary-getters
description: How to write a collection's contentSummaryGetter function
---

# Writing Content Summary Getters

## Overview

The "content summary" of a document is an object—derived from the document's
content—that contains its most important bits of information. The properties of
the object are displayed when showing a "summary view" of the document; for
example, in tables where each property becomes a column.

The summary object is a `Record<string, string | number | boolean | null>`.

The file `contentSummaryGetter.ts` in the collection directory implements and
default-exports the function that derives the summary from the document content.

### Attributes

The property names of the summary object can include an "attributes" prefix that
configures the behavior of the UIs that render the summary. Examples:

- `"{position:0,sortable:true,default-sort:asc} Prop Zero"`:
  - property displayed first;
  - when rendered in a table, the property's column is sortable;
  - when rendered in a table, the table is—by default—sorted by the property's
    column, in ascending order.
- `"{position:1} Prop One"`:
  - property displayed second;
  - when rendered in a table, the property's column is not sortable.

(Note: it only makes sense to define `default-sort` for one property.)

## Date-like String Properties

You can return Strings with formats Instant, PlainDate, or PlainTime as-is,
without doing any formatting. The frontend takes care of formatting them
correctly.

## Guidelines

- The content summary object should have between 1 and 5 properties.
- Only include the most salient and useful pieces of information.
- A summary property doesn't necessarily need to have a 1-to-1 correspondence
  with a document property: it can be a value derived from more than one
  document properties.
- The properties must always exist, but you can use `null` for empty values.
