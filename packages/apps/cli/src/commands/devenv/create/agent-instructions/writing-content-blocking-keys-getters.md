---
name: writing-content-blocking-keys-getters
description: How to write a collection's contentBlockingKeyGetter function
---

# Writing Content Blocking Keys Getters

## Overview

Blocking keys are unique signatures derived from a document's content. They are
the sole mechanism for warning the user about duplicates.

Golden Rule: If two documents share a blocking key, the user will be warned
immediately. Generate a key only when sharing that key would make a human
reviewer say "these are probably the same thing" without needing to inspect
further details.

The file `contentBlockingKeysGetter.ts` in the collection directory (optional)
implements and default-exports the function that derives these keys.

## Guidelines

1. Reason about the domain first
   - Before generating keys, consider: what makes two documents represent the
     same real-world entity in this domain?
   - Focus on identifying characteristics, not details that might vary between
     duplicate entries.

2. Prioritize specificity
   - Do not generate keys from common/generic fields alone (e.g., not just
     "City" or "First Name").
   - Prefer combining fields to form a specific signature (e.g., "First Name +
     Last Name", "Date + Amount").

3. Normalize to handle variations
   - Inputs may be messy; apply strict normalization.
   - Lowercase everything; trim whitespace; strip punctuation from phone
     numbers.

4. Use multiple independent identifiers
   - A document may have several fields that independently identify it.
   - Generate one key per independent identifier, not combinations of them.
   - Example: A contact with email AND phone should yield two keys (one for
     email, one for phone), not one key combining both.
   - Bad: ["email:phone:name"] - requires all three to match
   - Bad: ["name", "name:email", "name:email:phone"] - redundant hierarchy
   - Good: ["email", "phone", "name:dob"] - independent matching paths

5. Keys must be independent matching paths
   - Each key should represent a distinct way two documents could be duplicates.
   - Never generate a key that is a strict superset of another key (if key A
     matching implies key B matching, don't generate key A).
   - Think of keys as OR conditions: you want keys that catch different
     duplicate scenarios, not increasingly strict versions of the same scenario.
   - CRITICAL: A key that adds fields to an existing key is USELESS. If key B
     contains all the fields of key A plus more, then whenever B matches, A also
     matches. Key B can never catch a duplicate that A wouldn't already catch.
     It adds nothing and should not be generated.

6. Prefer broader keys when in doubt
   - When uncertain whether to include a field, leave it out.
   - A false positive (warning about non-duplicates) is less harmful than a
     false negative (missing a true duplicate).
   - Use the minimum number of fields needed to identify the entity.

7. Deterministic output
   - The same content must always produce the exact same array of strings.
