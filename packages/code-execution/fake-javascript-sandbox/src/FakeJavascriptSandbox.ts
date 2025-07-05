import type {
  JavascriptFunctionExecutionResult,
  TypescriptModule,
} from "@superego/backend";
import type { JavascriptSandbox } from "@superego/executing-backend";

export default class FakeJavascriptSandbox implements JavascriptSandbox {
  // TODO: consider using an LRU cache to avoid memory ballooning.
  private moduleCache = new Map<string, any>();

  async moduleDefaultExportsFunction(
    typescriptModule: TypescriptModule,
  ): Promise<boolean> {
    try {
      const importedModule = await this.importModule(typescriptModule);
      return FakeJavascriptSandbox.importedModuleDefaultExportsFunction(
        importedModule,
      );
    } catch {
      return false;
    }
  }

  async executeSyncFunction(
    typescriptModule: TypescriptModule,
    args: any[],
  ): Promise<JavascriptFunctionExecutionResult> {
    let importedModule: unknown;
    try {
      importedModule = await this.importModule(typescriptModule);
    } catch (error) {
      return {
        success: false,
        error: FakeJavascriptSandbox.extractErrorDetails(
          error,
          "Unknown error importing module",
        ),
      };
    }

    if (
      !FakeJavascriptSandbox.importedModuleDefaultExportsFunction(
        importedModule,
      )
    ) {
      return {
        success: false,
        error: {
          message: "The default export of the module is not a function",
        },
      };
    }

    let returnedValue: any;
    try {
      const clonedArgs = FakeJavascriptSandbox.jsonClone(args);
      returnedValue = importedModule.default(...clonedArgs);
    } catch (error) {
      return {
        success: false,
        error: FakeJavascriptSandbox.extractErrorDetails(
          error,
          "Unknown error executing function",
        ),
      };
    }

    try {
      returnedValue = FakeJavascriptSandbox.jsonClone(returnedValue);
    } catch {
      return {
        success: false,
        error: {
          message:
            "The value returned by the function is not serializable to JSON",
        },
      };
    }

    return { success: true, returnedValue };
  }

  static importModule: (typescriptModule: TypescriptModule) => Promise<unknown>;

  private async importModule(
    typescriptModule: TypescriptModule,
  ): Promise<unknown> {
    const cacheKey = typescriptModule.compiled;
    const cachedModule = this.moduleCache.get(cacheKey);
    if (cachedModule) {
      return cachedModule;
    }
    const importedModule =
      await FakeJavascriptSandbox.importModule(typescriptModule);
    this.moduleCache.set(cacheKey, importedModule);
    return importedModule;
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
  ): {
    message: string;
    name?: string | undefined;
    stack?: string | undefined;
  } {
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
