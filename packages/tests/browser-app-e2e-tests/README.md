# Note on the e2e tests

These e2e scenario tests only use visual comparisons of screenshots against
"golden snapshots" for assertions. This approach has some pros and cons.

Pros:

- It's easy to write assertions: just call the `VisualEvaluator.expectToSee`
  method.
- It's easy to verify that assertions are correct: just verify that the snapshot
  satisfies the conditions passed to `expectToSee`.

Cons:

- Even minor style changes can break tests.
- Full-page assertions are not fine-grained: they don't just verify one thing
  looks correct, they verify the whole page looks correct.
- When a snapshot is (re)generated, the developer has to remember to (re)verify
  that the snapshot satisfies the conditions passed to `expectToSee`.
