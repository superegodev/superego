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

  vm.newFunction("toISO", (iso, operations) =>
    vm.newString(applyOperations(vm.dump(iso), vm.dump(operations)).toISO()),
  ).consume((fnHandle) =>
    vm.setProp(HostLocalInstantHandle, "toISO", fnHandle),
  );

  vm.newFunction("toPlainDate", (iso, operations) =>
    vm.newString(
      applyOperations(vm.dump(iso), vm.dump(operations)).toPlainDate(),
    ),
  ).consume((fnHandle) =>
    vm.setProp(HostLocalInstantHandle, "toPlainDate", fnHandle),
  );

  vm.newFunction("fromISO", (iso) =>
    vm.newString(LocalInstant.fromISO(vm.dump(iso)).toISO()),
  ).consume((fnHandle) =>
    vm.setProp(HostLocalInstantHandle, "fromISO", fnHandle),
  );

  vm.newFunction("fromInstant", (instant) =>
    vm.newString(LocalInstant.fromInstant(vm.dump(instant)).toISO()),
  ).consume((fnHandle) =>
    vm.setProp(HostLocalInstantHandle, "fromInstant", fnHandle),
  );

  vm.newFunction("fromPlainDate", (plainDate) =>
    vm.newString(LocalInstant.fromPlainDate(vm.dump(plainDate)).toISO()),
  ).consume((fnHandle) =>
    vm.setProp(HostLocalInstantHandle, "fromPlainDate", fnHandle),
  );

  vm.evalCode(LocalInstantSource);
}

function applyOperations(iso: string, operations: Operation[]): LocalInstant {
  return operations.reduce(
    (localInstant, operation) =>
      // TypeScript is not understanding, but spreading the args is correct.
      (localInstant[operation.name] as any)(...operation.arguments),
    LocalInstant.fromISO(iso),
  );
}
