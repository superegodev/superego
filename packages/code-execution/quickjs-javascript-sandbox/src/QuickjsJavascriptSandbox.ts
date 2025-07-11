import type {
  JavascriptFunctionExecutionError,
  JavascriptFunctionExecutionResult,
  TypescriptModule,
} from "@superego/backend";
import type { JavascriptSandbox } from "@superego/executing-backend";
import {
  type QuickJSContext,
  type QuickJSHandle,
  type QuickJSWASMModule,
  Scope,
} from "quickjs-emscripten";

interface ImportedModule {
  vm: QuickJSContext;
  moduleNamespace: QuickJSHandle;
  defaultExport: QuickJSHandle;
}

export default class QuickjsJavascriptSandbox implements JavascriptSandbox {
  // TODO: consider using an LRU cache to avoid memory ballooning.
  private importCache = new Map<string, ImportedModule>();

  public async moduleDefaultExportsFunction(
    typescriptModule: TypescriptModule,
  ): Promise<boolean> {
    try {
      const { vm, defaultExport } = await this.importModule(typescriptModule);
      return vm.typeof(defaultExport) === "function";
    } catch {
      return false;
    }
  }

  public async executeSyncFunction(
    typescriptModule: TypescriptModule,
    args: any[],
  ): Promise<JavascriptFunctionExecutionResult> {
    let vm: QuickJSContext;
    let defaultExport: QuickJSHandle;
    try {
      ({ vm, defaultExport } = await this.importModule(typescriptModule));
    } catch (error: unknown) {
      return {
        success: false,
        error: QuickjsJavascriptSandbox.extractErrorDetails(
          error,
          "Unknown error importing module",
        ),
      };
    }

    if (vm.typeof(defaultExport) !== "function") {
      return {
        success: false,
        error: {
          message: "The default export of the module is not a function",
        },
      };
    }

    return Scope.withScope((scope) => {
      try {
        const argHandles = args.map((arg) =>
          scope.manage(
            vm.unwrapResult(vm.evalCode(`(${JSON.stringify(arg)})`)),
          ),
        );
        const resultHandle = scope.manage(
          vm.unwrapResult(
            vm.callFunction(defaultExport, vm.undefined, ...argHandles),
          ),
        );
        const returnedValue = vm.dump(resultHandle);
        return { success: true, returnedValue };
      } catch (error: unknown) {
        return {
          success: false,
          error: QuickjsJavascriptSandbox.extractErrorDetails(
            error,
            "Unknown error executing function",
          ),
        };
      }
    });
  }

  static getQuickJS: () => Promise<QuickJSWASMModule>;

  private async importModule(
    typescriptModule: TypescriptModule,
  ): Promise<ImportedModule> {
    const cacheKey = typescriptModule.compiled;
    const cachedImport = this.importCache.get(cacheKey);
    if (cachedImport) {
      return cachedImport;
    }

    const vm = await QuickjsJavascriptSandbox.getQuickJS().then((qjs) =>
      qjs.newContext(),
    );
    try {
      const moduleNamespace = vm.unwrapResult(
        vm.evalCode(typescriptModule.compiled, "module.js", {
          type: "module",
        }),
      );
      const defaultExport = vm.getProp(moduleNamespace, "default");
      const importedModule: ImportedModule = {
        vm,
        moduleNamespace,
        defaultExport,
      };
      this.importCache.set(cacheKey, importedModule);
      return importedModule;
    } catch (error) {
      vm.dispose();
      throw error;
    }
  }

  private static extractErrorDetails(
    error: unknown,
    fallbackMessage: string,
  ): JavascriptFunctionExecutionError {
    return typeof error === "object" && error !== null
      ? {
          message:
            "message" in error && typeof error.message === "string"
              ? error.message
              : fallbackMessage,
          name:
            "name" in error && typeof error.name === "string"
              ? error.name
              : undefined,
          stack:
            "stack" in error && typeof error.stack === "string"
              ? error.stack
              : undefined,
        }
      : { message: fallbackMessage };
  }
}
