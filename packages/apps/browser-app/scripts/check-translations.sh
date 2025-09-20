#!/bin/bash
set -euo pipefail

# Verify that all messages in the source locale (en) are present in the other
# locales.
yarn translations:verify

# Verify that other locales don't have "leftover" messages that are not in the
# source locale.
# TODO

# Verify that all locales have been compiled.
# TODO
