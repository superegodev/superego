import type * as v from "valibot";

export default function getUsecaseArgumentsSchema<
  ArgumentsSchema extends v.GenericSchema<unknown, any[]>,
>(
  UsecaseClass: new (...dependencies: any[]) => {
    argumentsSchema: ArgumentsSchema;
  },
): ArgumentsSchema {
  const usecase = new UsecaseClass(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  return usecase.argumentsSchema;
}
