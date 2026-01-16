import { readFileSync } from "node:fs";
import { join } from "node:path";
import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url&no-inline";
import {
  newQuickJSWASMModuleFromVariant,
  newVariant,
  RELEASE_SYNC,
} from "quickjs-emscripten";

const variant = newVariant(RELEASE_SYNC, {
  wasmBinary: readFileSync(
    import.meta.env.DEV
      ? wasmLocation.replace("/@fs", "").replace("?no-inline", "")
      : join(import.meta.dirname, wasmLocation),
  ).buffer,
});
export default function getQuickJS() {
  return newQuickJSWASMModuleFromVariant(variant);
}
