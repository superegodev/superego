import type { TypescriptModule } from "@superego/backend";
import type { TypescriptSandbox } from "@superego/executing-backend";
import type { ResultPromise } from "@superego/global-types";
import { LocalInstant } from "@superego/typescript-sandbox-global-utils";

(globalThis as any).LocalInstant = LocalInstant;

export default class FakeTypescriptSandbox implements TypescriptSandbox {
  private moduleImportPromiseCache = new Map<string, Promise<unknown>>();

  async moduleDefaultExportsFunction(
    typescriptModule: TypescriptModule,
  ): Promise<boolean> {
    try {
      const importedModule = await this.importModule(typescriptModule);
      return FakeTypescriptSandbox.importedModuleDefaultExportsFunction(
        importedModule,
      );
    } catch {
      return false;
    }
  }

  async executeSyncFunction(
    typescriptModule: TypescriptModule,
    args: any[],
  ): ResultPromise<any, TypescriptSandbox.ExecutingFunctionFailed> {
    let importedModule: unknown;
    try {
      importedModule = await this.importModule(typescriptModule);
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          name: "ExecutingFunctionFailed",
          details: FakeTypescriptSandbox.extractErrorDetails(
            error,
            "Unknown error importing module",
          ),
        },
      };
    }

    if (
      !FakeTypescriptSandbox.importedModuleDefaultExportsFunction(
        importedModule,
      )
    ) {
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

    let returnedValue: any;
    try {
      const clonedArgs = FakeTypescriptSandbox.jsonClone(args);
      returnedValue = importedModule.default(...clonedArgs);
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          name: "ExecutingFunctionFailed",
          details: FakeTypescriptSandbox.extractErrorDetails(
            error,
            "Unknown error executing function",
          ),
        },
      };
    }

    try {
      returnedValue = FakeTypescriptSandbox.jsonClone(returnedValue);
    } catch {
      return {
        success: false,
        data: null,
        error: {
          name: "ExecutingFunctionFailed",
          details: {
            message:
              "The value returned by the function is not serializable to JSON",
          },
        },
      };
    }

    return { success: true, data: returnedValue, error: null };
  }

  static importModule: (javascriptModule: string) => Promise<unknown>;

  private async importModule(
    typescriptModule: TypescriptModule,
  ): Promise<unknown> {
    const cacheKey = typescriptModule;
    const cachedModuleImportPromise =
      this.moduleImportPromiseCache.get(cacheKey);
    if (cachedModuleImportPromise) {
      return cachedModuleImportPromise;
    }
    const moduleImportPromise = FakeTypescriptSandbox.stripTypes(
      typescriptModule,
    ).then((javascriptModule) =>
      FakeTypescriptSandbox.importModule(javascriptModule),
    );
    this.moduleImportPromiseCache.set(cacheKey, moduleImportPromise);
    return moduleImportPromise;
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

  private static importedModuleDefaultExportsFunction(
    importedModule: unknown,
  ): importedModule is { default: Function } {
    return (
      typeof importedModule === "object" &&
      importedModule !== null &&
      "default" in importedModule &&
      typeof importedModule.default === "function"
    );
  }

  private static jsonClone<Value>(value: Value): Value {
    return JSON.parse(JSON.stringify(value));
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
