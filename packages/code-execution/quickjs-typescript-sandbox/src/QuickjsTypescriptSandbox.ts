import type { TypescriptModule } from "@superego/backend";
import type { TypescriptSandbox } from "@superego/executing-backend";
import type { ResultPromise } from "@superego/global-types";
import {
  type QuickJSContext,
  type QuickJSHandle,
  type QuickJSRuntime,
  type QuickJSWASMModule,
  Scope,
} from "quickjs-emscripten";
import setLocalInstant from "./global-utils/setLocalInstant.js";

interface ImportedModule {
  vm: QuickJSContext;
  moduleNamespace: QuickJSHandle;
  defaultExport: QuickJSHandle;
}

export default class QuickjsTypescriptSandbox implements TypescriptSandbox {
  // TODO: consider using an LRU cache to avoid memory ballooning.
  private importCache = new Map<string, ImportedModule>();
  private runtime: QuickJSRuntime | null = null;
  private runtimePromise: Promise<QuickJSRuntime>;

  constructor() {
    this.runtimePromise = QuickjsTypescriptSandbox.getQuickJS().then(
      (quickJS) => {
        this.runtime = quickJS.newRuntime();
        return this.runtime;
      },
    );
  }

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
  ): ResultPromise<any, TypescriptSandbox.ExecutingFunctionFailed> {
    let vm: QuickJSContext;
    let defaultExport: QuickJSHandle;
    try {
      ({ vm, defaultExport } = await this.importModule(typescriptModule));
    } catch (error: unknown) {
      return {
        success: false,
        data: null,
        error: {
          name: "ExecutingFunctionFailed",
          details: QuickjsTypescriptSandbox.extractErrorDetails(
            error,
            "Unknown error importing module",
          ),
        },
      };
    }

    if (vm.typeof(defaultExport) !== "function") {
      return {
        success: false,
        data: null,
        error: {
          name: "ExecutingFunctionFailed",
          details: {
            message: "The default export of the module is not a function",
          },
        },
      };
    }

    return Scope.withScope((scope) => {
      try {
        // Set global utils.
        setLocalInstant(vm, scope);

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
        return { success: true, data: returnedValue, error: null };
      } catch (error: unknown) {
        return {
          success: false,
          data: null,
          error: {
            name: "ExecutingFunctionFailed",
            details: QuickjsTypescriptSandbox.extractErrorDetails(
              error,
              "Unknown error executing function",
            ),
          },
        };
      }
    });
  }

  static getQuickJS: () => Promise<QuickJSWASMModule>;

  private async importModule(
    typescriptModule: TypescriptModule,
  ): Promise<ImportedModule> {
    const runtime = this.runtime ?? (await this.runtimePromise);
    const cacheKey = typescriptModule;
    const cachedImport = this.importCache.get(cacheKey);
    if (cachedImport) {
      return cachedImport;
    }

    const javascriptModule =
      await QuickjsTypescriptSandbox.stripTypes(typescriptModule);
    const vm = runtime.newContext();
    try {
      const moduleNamespace = vm.unwrapResult(
        vm.evalCode(javascriptModule, "module.js", {
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

  private static async stripTypes(
    typescriptModule: TypescriptModule,
  ): Promise<string> {
    (globalThis as any).process ??= { env: {}, versions: {} };
    const ts = await import("typescript");
    return ts.transpileModule(typescriptModule, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
      },
    }).outputText;
  }

  private static extractErrorDetails(
    error: unknown,
    fallbackMessage: string,
  ): TypescriptSandbox.ExecutingFunctionFailed["details"] {
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
