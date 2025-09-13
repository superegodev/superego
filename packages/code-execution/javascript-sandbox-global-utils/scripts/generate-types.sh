#!/bin/bash
set -euo pipefail

tsc --project tsconfig.types.json
sed -i '' '/^export default LocalInstant;$/d' types/LocalInstant.d.ts
