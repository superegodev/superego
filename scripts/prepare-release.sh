#!/bin/bash
set -euo pipefail

# Get package version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Ensure we're on the main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo -e "You need to be on the main branch to release a new version. Current branch is $BRANCH." >&2
  exit 1
fi

# Get the next version
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
CURRENT_MAJOR="${VERSION_PARTS[0]}"
CURRENT_MINOR="${VERSION_PARTS[1]}"
CURRENT_PATCH="${VERSION_PARTS[2]}"

# Calculate next version based on current date
NEXT_MAJOR=$(date -u +%Y)
NEXT_MINOR=$(date -u +%-m)
if [ "$NEXT_MAJOR" = "$CURRENT_MAJOR" ] && [ "$NEXT_MINOR" = "$CURRENT_MINOR" ]; then
  NEXT_PATCH=$((CURRENT_PATCH + 1))
else
  NEXT_PATCH=0
fi
NEXT_VERSION="${NEXT_MAJOR}.${NEXT_MINOR}.${NEXT_PATCH}"

# Bump all packages to the next version
yarn workspaces foreach --all --topological-dev version "$NEXT_VERSION"

# Commit and tag changes
git commit -am "$NEXT_VERSION"
git tag -m "v$NEXT_VERSION" "v$NEXT_VERSION"
