---
title: Overview
tableOfContents: false
---

Superego is a personal database you can extend with apps. Personal means it's
built for you to store your personal data, such as:

- Expenses
- Health records
- Workouts
- etc

Data is organized into **collections** of **documents**. Each collection has a
**schema** that defines what data each document contains.

Example: the **Expenses** collection contains many **Expense** documents. Each
document contains the date of the expense, the amount, and a description. (This
is the schema.)

Superego, however, doesn't come with any _pre-defined_ collections. **You**
decide what goes in, based on what **you** need.

## Apps

Apps are snippets of code that let you build custom interfaces on top of your
collections. For example, an expense tracker chart, a kanban board, or a
calendar.

Each app targets one or more collections and has full access to their documents.
Once created, an app shows up as an alternative view of its target collections,
replacing the default table of documents with your custom interface.

Under the hood, apps are single-file TypeScript React components. You can create
apps by vibe-coding directly in Superego, or by using the
[CLI](/getting-started/cli/) with your editor and coding agent of choice.
