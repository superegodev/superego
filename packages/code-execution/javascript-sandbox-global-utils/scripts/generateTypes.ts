import { $ } from "zx";

$.sync`tsc --project tsconfig.types.json`;
$.sync`sed -i '' '/^export default LocalInstant;$/d' types/LocalInstant.d.ts`;
$.sync`yarn workspace @superego/root fix-formatting`;
