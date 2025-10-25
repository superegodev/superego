import type {
  TypescriptCompilationFailed,
  TypescriptFile,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";

export default interface TypescriptCompiler {
  compile(
    main: TypescriptFile,
    libs: TypescriptFile[],
  ): ResultPromise<string, TypescriptCompilationFailed | UnexpectedError>;
}
