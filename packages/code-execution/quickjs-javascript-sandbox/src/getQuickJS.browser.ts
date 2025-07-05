import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url";
import {
  newQuickJSWASMModuleFromVariant,
  newVariant,
  RELEASE_SYNC,
} from "quickjs-emscripten";

const variant = newVariant(RELEASE_SYNC, {
  wasmLocation,
});

export default async function getQuickJS() {
  return await newQuickJSWASMModuleFromVariant(variant);
}
