import type { TypescriptFile, UnexpectedError } from "@superego/backend";
import type { ResultError, ResultPromise } from "@superego/global-types";

interface TypescriptCompiler {
  compile(
    main: TypescriptFile,
    libs: TypescriptFile[],
  ): ResultPromise<
    string,
    | TypescriptCompiler.TypeErrors
    | TypescriptCompiler.MissingOutput
    | UnexpectedError
  >;
}

namespace TypescriptCompiler {
  export interface TypeError {
    message: string;
    line?: number;
    character?: number;
  }

  export type TypeErrors = ResultError<
    "TypeErrors",
    {
      errors: TypeError[];
    }
  >;

  export type MissingOutput = ResultError<
    "MissingOutput",
    {
      message: string;
    }
  >;
}

export default TypescriptCompiler;
