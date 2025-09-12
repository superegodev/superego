import { LocalInstant } from "@superego/javascript-sandbox-global-utils";
import type { QuickJSContext, Scope } from "quickjs-emscripten";
import LocalInstantSource from "./LocalInstant.quickjs.js?raw";

interface Operation {
  name: "startOf" | "endOf" | "plus" | "minus" | "set";
  arguments: any[];
}

export default function setLocalInstant(vm: QuickJSContext, scope: Scope) {
  const HostLocalInstantHandle = scope.manage(vm.newObject());
  vm.setProp(vm.global, "HostLocalInstant", HostLocalInstantHandle);

  vm.newFunction("toISO", (instant, operations) =>
    vm.newString(
      applyOperations(vm.dump(instant), vm.dump(operations)).toISO(),
    ),
  ).consume((fnHandle) =>
    vm.setProp(HostLocalInstantHandle, "toISO", fnHandle),
  );

  vm.newFunction("toFormat", (instant, operations, options) =>
    vm.newString(
      applyOperations(vm.dump(instant), vm.dump(operations)).toFormat(
        options ? vm.dump(options) : undefined,
      ),
    ),
  ).consume((fnHandle) =>
    vm.setProp(HostLocalInstantHandle, "toFormat", fnHandle),
  );

  vm.evalCode(LocalInstantSource);
}

function applyOperations(
  instant: string,
  operations: Operation[],
): LocalInstant {
  return operations.reduce(
    (localInstant, operation) =>
      // TypeScript is not understanding, but spreading the args is correct.
      (localInstant[operation.name] as any)(...operation.arguments),
    LocalInstant.fromISO(instant),
  );
}
