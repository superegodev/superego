# Note on the e2e tests

These e2e scenario tests use Midscene (`@midscene/web`) as the primary
interaction and assertion layer.

Key principles:

- Use Midscene actions (for example `aiTap`, `aiInput`) for UI interactions.
- Use Midscene assertions (`aiAssert`) for verification.
- Use `createCollection` and `createContact` routines only for setup through
  programmatic backend calls.
- Do not use screenshot-based assertions.
